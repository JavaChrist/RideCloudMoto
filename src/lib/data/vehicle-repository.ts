import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MaintenanceEntry,
  MaintenancePlanEntry,
  Modification,
  UpcomingMaintenance,
  Vehicle,
  VehicleCategory,
  VehicleDocument,
} from "@/types/database";
import { calculateNextMaintenanceDue, getMaintenanceStatus } from "@/lib/maintenance";
import { estimateCurrentKm } from "@/lib/odometer-estimate";
import { todayIso } from "@/lib/utils/date";
import { resolveTemplatesForVehicle } from "./maintenance-template-resolver";

export async function getVehiclesForUser(
  supabase: SupabaseClient,
  userId: string,
  category?: VehicleCategory
): Promise<Vehicle[]> {
  let query = supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Vehicle[];
}

export async function getVehicleById(
  supabase: SupabaseClient,
  userId: string,
  vehicleId: string
): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .eq("id", vehicleId)
    .maybeSingle();
  if (error) throw error;
  return (data as Vehicle) ?? null;
}

export interface VehicleDetail {
  vehicle: Vehicle;
  maintenanceEntries: MaintenanceEntry[];
  planEntries: MaintenancePlanEntry[];
  modifications: Modification[];
  documents: VehicleDocument[];
  upcoming: UpcomingMaintenance[];
  estimatedKm: number;
}

export async function getVehicleDetail(
  supabase: SupabaseClient,
  userId: string,
  vehicleId: string
): Promise<VehicleDetail | null> {
  const vehicle = await getVehicleById(supabase, userId, vehicleId);
  if (!vehicle) return null;

  const [entries, plan, mods, docs, upcoming] = await Promise.all([
    supabase
      .from("maintenance_entries")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("date_entretien", { ascending: false }),
    supabase
      .from("maintenance_plan_entries")
      .select("*")
      .eq("vehicle_id", vehicleId),
    supabase
      .from("modifications")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("date_pose", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("created_at", { ascending: false }),
    supabase
      .from("upcoming_maintenance")
      .select("*")
      .eq("vehicle_id", vehicleId),
  ]);

  return {
    vehicle,
    maintenanceEntries: (entries.data ?? []) as MaintenanceEntry[],
    planEntries: (plan.data ?? []) as MaintenancePlanEntry[],
    modifications: (mods.data ?? []) as Modification[],
    documents: (docs.data ?? []) as VehicleDocument[],
    upcoming: (upcoming.data ?? []) as UpcomingMaintenance[],
    estimatedKm: estimateCurrentKm(vehicle),
  };
}

/**
 * Génère / synchronise le plan d'entretien d'un véhicule à partir des templates.
 * Idempotent grâce à la contrainte unique (user_id, vehicle_id, source, categorie, titre).
 * Pour un véhicule d'occasion (km > 0), le plan démarre depuis le km actuel.
 */
export async function ensureMaintenancePlanForVehicle(
  supabase: SupabaseClient,
  vehicle: Vehicle
): Promise<void> {
  const { templates } = await resolveTemplatesForVehicle(supabase, vehicle);
  if (templates.length === 0) return;

  const { data: existing } = await supabase
    .from("maintenance_plan_entries")
    .select("titre, categorie")
    .eq("vehicle_id", vehicle.id);

  const existingKeys = new Set(
    (existing ?? []).map((e: { titre: string; categorie: string }) => `${e.categorie}::${e.titre}`)
  );

  const isUsed = vehicle.kilometrage > 0;
  const initialLastDoneKm = isUsed ? vehicle.kilometrage : null;
  const initialLastDoneDate = isUsed ? todayIso() : null;
  const currentKm = estimateCurrentKm(vehicle);

  const rows = templates
    .filter((t) => !existingKeys.has(`${t.categorie}::${t.titre}`))
    .map((t) => {
      const firstDueDate =
        t.firstDueMonths != null
          ? addMonthsIso(todayIso(), t.firstDueMonths)
          : null;

      const { nextDueKm, nextDueDate } = calculateNextMaintenanceDue({
        intervalKm: t.intervalKm,
        intervalMonths: t.intervalMonths,
        firstDueKm: t.firstDueKm,
        firstDueDate,
        lastDoneKm: t.firstDueKm != null ? null : initialLastDoneKm,
        lastDoneDate: t.firstDueKm != null ? null : initialLastDoneDate,
      });

      const status = getMaintenanceStatus({
        nextDueKm,
        nextDueDate,
        currentKm,
        dueSoonKmThreshold: t.dueSoonKmThreshold ?? 500,
        dueSoonDaysThreshold: t.dueSoonDaysThreshold ?? 30,
      });

      return {
        user_id: vehicle.user_id,
        vehicle_id: vehicle.id,
        titre: t.titre,
        categorie: t.categorie,
        description: t.description ?? null,
        interval_km: t.intervalKm ?? null,
        interval_months: t.intervalMonths ?? null,
        first_due_km: t.firstDueKm ?? null,
        first_due_date: firstDueDate,
        last_done_km: t.firstDueKm != null ? null : initialLastDoneKm,
        last_done_date: t.firstDueKm != null ? null : initialLastDoneDate,
        next_due_km: nextDueKm,
        next_due_date: nextDueDate,
        due_soon_km_threshold: t.dueSoonKmThreshold ?? 500,
        due_soon_days_threshold: t.dueSoonDaysThreshold ?? 30,
        priority: t.priority ?? "normal",
        status,
        source: "template" as const,
        template_source: "hardcoded" as const,
      };
    });

  if (rows.length === 0) return;

  await supabase
    .from("maintenance_plan_entries")
    .upsert(rows, { onConflict: "user_id,vehicle_id,source,categorie,titre", ignoreDuplicates: true });
}

function addMonthsIso(dateIso: string, months: number): string {
  const d = new Date(dateIso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
