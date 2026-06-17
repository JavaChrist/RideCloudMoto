"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  maintenanceEntrySchema,
  modificationSchema,
} from "@/lib/validators/vehicle";
import type { ActionResult } from "@/app/(protected)/vehicules/actions";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function addMaintenanceEntry(
  vehicleId: string,
  input: unknown,
  planEntryId?: string | null
): Promise<ActionResult> {
  const parsed = maintenanceEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const { supabase, userId } = await getUserId();
  if (!userId) return { ok: false, error: "Non authentifié" };

  const { error } = await supabase.from("maintenance_entries").insert({
    user_id: userId,
    vehicle_id: vehicleId,
    titre: parsed.data.titre,
    date_entretien: parsed.data.date_entretien,
    kilometrage: parsed.data.kilometrage,
    cout: parsed.data.cout ?? null,
    description: parsed.data.description ?? null,
    maintenance_plan_entry_id: planEntryId ?? null,
  });
  if (error) return { ok: false, error: error.message };

  // Si lié à une tâche du plan : marquer comme effectuée et recalculer la prochaine échéance
  if (planEntryId) {
    await markPlanEntryDone(vehicleId, planEntryId, parsed.data.kilometrage, parsed.data.date_entretien);
  }

  revalidatePath(`/vehicule/${vehicleId}`);
  return { ok: true };
}

async function markPlanEntryDone(
  vehicleId: string,
  planEntryId: string,
  doneKm: number,
  doneDate: string
) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  const { data: entry } = await supabase
    .from("maintenance_plan_entries")
    .select("*")
    .eq("id", planEntryId)
    .maybeSingle();
  if (!entry) return;

  const { calculateNextMaintenanceDue, getMaintenanceStatus } = await import("@/lib/maintenance");
  const { nextDueKm, nextDueDate } = calculateNextMaintenanceDue({
    intervalKm: entry.interval_km,
    intervalMonths: entry.interval_months,
    lastDoneKm: doneKm,
    lastDoneDate: doneDate,
  });
  const status = getMaintenanceStatus({
    nextDueKm,
    nextDueDate,
    currentKm: doneKm,
    dueSoonKmThreshold: entry.due_soon_km_threshold,
    dueSoonDaysThreshold: entry.due_soon_days_threshold,
  });

  await supabase
    .from("maintenance_plan_entries")
    .update({
      last_done_km: doneKm,
      last_done_date: doneDate,
      next_due_km: nextDueKm,
      next_due_date: nextDueDate,
      status,
    })
    .eq("id", planEntryId)
    .eq("user_id", userId);
}

export async function deleteMaintenanceEntry(
  vehicleId: string,
  entryId: string
): Promise<ActionResult> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { ok: false, error: "Non authentifié" };
  const { error } = await supabase
    .from("maintenance_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/vehicule/${vehicleId}`);
  return { ok: true };
}

export async function addModification(
  vehicleId: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = modificationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const { supabase, userId } = await getUserId();
  if (!userId) return { ok: false, error: "Non authentifié" };

  const { error } = await supabase.from("modifications").insert({
    user_id: userId,
    vehicle_id: vehicleId,
    titre: parsed.data.titre,
    marque: parsed.data.marque ?? null,
    modele: parsed.data.modele ?? null,
    date_pose: parsed.data.date_pose ?? null,
    cout: parsed.data.cout ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/vehicule/${vehicleId}`);
  return { ok: true };
}

export async function deleteModification(
  vehicleId: string,
  modId: string
): Promise<ActionResult> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { ok: false, error: "Non authentifié" };
  const { error } = await supabase
    .from("modifications")
    .delete()
    .eq("id", modId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/vehicule/${vehicleId}`);
  return { ok: true };
}
