import type { MaintenancePlanEntry, UpcomingMaintenance, Vehicle } from "@/types/database";
import { getMaintenanceStatus, compareMaintenanceByDue } from "@/lib/maintenance";
import { estimateCurrentKm } from "@/lib/odometer-estimate";

export interface Reminder {
  id: string;
  vehicleId: string;
  titre: string;
  categorie: string;
  status: "due_soon" | "overdue";
  nextDueKm: number | null;
  nextDueDate: string | null;
  priority: "normal" | "important" | "urgent";
}

/**
 * Agrège les rappels actifs (en retard / bientôt) d'un véhicule, à partir du
 * plan d'entretien recalculé avec le km estimé courant.
 */
export function getVehicleReminders(
  vehicle: Vehicle,
  planEntries: MaintenancePlanEntry[]
): Reminder[] {
  const currentKm = estimateCurrentKm(vehicle);

  return planEntries
    .filter((p) => p.status !== "done")
    .map((p) => {
      const status = getMaintenanceStatus({
        nextDueKm: p.next_due_km,
        nextDueDate: p.next_due_date,
        currentKm,
        dueSoonKmThreshold: p.due_soon_km_threshold,
        dueSoonDaysThreshold: p.due_soon_days_threshold,
      });
      return { p, status };
    })
    .filter(({ status }) => status === "due_soon" || status === "overdue")
    .map(({ p, status }) => ({
      id: p.id,
      vehicleId: p.vehicle_id,
      titre: p.titre,
      categorie: p.categorie,
      status: status as "due_soon" | "overdue",
      nextDueKm: p.next_due_km,
      nextDueDate: p.next_due_date,
      priority: p.priority,
    }))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "overdue" ? -1 : 1;
      return compareMaintenanceByDue(
        { next_due_km: a.nextDueKm, next_due_date: a.nextDueDate },
        { next_due_km: b.nextDueKm, next_due_date: b.nextDueDate },
        currentKm
      );
    });
}

export function countActiveReminders(reminders: Reminder[]): {
  overdue: number;
  dueSoon: number;
  total: number;
} {
  const overdue = reminders.filter((r) => r.status === "overdue").length;
  const dueSoon = reminders.filter((r) => r.status === "due_soon").length;
  return { overdue, dueSoon, total: overdue + dueSoon };
}

export function upcomingToReminders(
  vehicle: Vehicle,
  upcoming: UpcomingMaintenance[]
): Reminder[] {
  const currentKm = estimateCurrentKm(vehicle);
  return upcoming
    .map((u) => {
      const status = getMaintenanceStatus({
        nextDueKm: u.due_km,
        nextDueDate: u.due_date,
        currentKm,
      });
      return { u, status };
    })
    .filter(({ status }) => status !== "upcoming")
    .map(({ u, status }) => ({
      id: u.id,
      vehicleId: u.vehicle_id,
      titre: u.titre,
      categorie: "Rappel",
      status: status === "overdue" ? "overdue" : "due_soon",
      nextDueKm: u.due_km,
      nextDueDate: u.due_date,
      priority: u.niveau_urgence === "urgent" ? "urgent" : "normal",
    }));
}
