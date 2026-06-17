import type { MaintenanceStatus } from "@/types/database";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface NextDueInput {
  intervalKm?: number | null;
  intervalMonths?: number | null;
  firstDueKm?: number | null;
  firstDueDate?: string | null;
  lastDoneKm?: number | null;
  lastDoneDate?: string | null;
}

export interface NextDue {
  nextDueKm: number | null;
  nextDueDate: string | null;
}

function addMonths(dateIso: string, months: number): string {
  const d = new Date(dateIso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

/**
 * Calcule la prochaine échéance (km + date) d'une tâche d'entretien.
 * - Si un entretien a déjà été réalisé → on repart de last_done + intervalle.
 * - Sinon → on utilise la première échéance (first_due) si fournie.
 */
export function calculateNextMaintenanceDue(input: NextDueInput): NextDue {
  const { intervalKm, intervalMonths, firstDueKm, firstDueDate, lastDoneKm, lastDoneDate } = input;

  let nextDueKm: number | null = null;
  if (intervalKm && intervalKm > 0) {
    if (lastDoneKm != null) nextDueKm = lastDoneKm + intervalKm;
    else if (firstDueKm != null) nextDueKm = firstDueKm;
  } else if (firstDueKm != null) {
    nextDueKm = firstDueKm;
  }

  let nextDueDate: string | null = null;
  if (intervalMonths && intervalMonths > 0) {
    if (lastDoneDate) nextDueDate = addMonths(lastDoneDate, intervalMonths);
    else if (firstDueDate) nextDueDate = firstDueDate;
  } else if (firstDueDate) {
    nextDueDate = firstDueDate;
  }

  return { nextDueKm, nextDueDate };
}

export interface StatusInput {
  nextDueKm?: number | null;
  nextDueDate?: string | null;
  currentKm: number;
  dueSoonKmThreshold?: number;
  dueSoonDaysThreshold?: number;
  at?: Date;
}

/**
 * Détermine le statut d'une tâche d'entretien : upcoming / due_soon / overdue.
 * (Le statut "done" est géré séparément lorsqu'un entretien est enregistré.)
 */
export function getMaintenanceStatus(input: StatusInput): MaintenanceStatus {
  const {
    nextDueKm,
    nextDueDate,
    currentKm,
    dueSoonKmThreshold = 500,
    dueSoonDaysThreshold = 30,
    at = new Date(),
  } = input;

  let overdue = false;
  let dueSoon = false;

  if (nextDueKm != null) {
    if (currentKm >= nextDueKm) overdue = true;
    else if (nextDueKm - currentKm <= dueSoonKmThreshold) dueSoon = true;
  }

  if (nextDueDate) {
    const due = new Date(nextDueDate);
    if (!Number.isNaN(due.getTime())) {
      const diffDays = (due.getTime() - at.getTime()) / MS_PER_DAY;
      if (diffDays < 0) overdue = true;
      else if (diffDays <= dueSoonDaysThreshold) dueSoon = true;
    }
  }

  if (overdue) return "overdue";
  if (dueSoon) return "due_soon";
  return "upcoming";
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  upcoming: "À venir",
  due_soon: "Bientôt",
  overdue: "En retard",
  done: "Effectué",
};
