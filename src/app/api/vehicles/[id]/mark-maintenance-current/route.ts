import { NextResponse, type NextRequest } from "next/server";
import { estimateCurrentKm } from "@/lib/odometer-estimate";
import { getWriteGuard } from "@/lib/billing/write-guard";
import type { Vehicle } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * Marque tout le plan d'entretien d'un véhicule comme "à jour" au kilométrage
 * courant (utile pour un véhicule d'occasion fraîchement révisé).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, userId, canWrite, reason } = await getWriteGuard();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!canWrite) return NextResponse.json({ error: reason }, { status: 403 });

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!vehicle) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const currentKm = estimateCurrentKm(vehicle as Vehicle);
  const today = new Date().toISOString().slice(0, 10);

  const { data: plans } = await supabase
    .from("maintenance_plan_entries")
    .select("*")
    .eq("vehicle_id", id);

  const { calculateNextMaintenanceDue, getMaintenanceStatus } = await import("@/lib/maintenance");

  for (const p of plans ?? []) {
    const { nextDueKm, nextDueDate } = calculateNextMaintenanceDue({
      intervalKm: p.interval_km,
      intervalMonths: p.interval_months,
      lastDoneKm: currentKm,
      lastDoneDate: today,
    });
    const status = getMaintenanceStatus({
      nextDueKm,
      nextDueDate,
      currentKm,
      dueSoonKmThreshold: p.due_soon_km_threshold,
      dueSoonDaysThreshold: p.due_soon_days_threshold,
    });
    await supabase
      .from("maintenance_plan_entries")
      .update({
        last_done_km: currentKm,
        last_done_date: today,
        next_due_km: nextDueKm,
        next_due_date: nextDueDate,
        status,
      })
      .eq("id", p.id);
  }

  return NextResponse.json({ ok: true, updated: (plans ?? []).length });
}
