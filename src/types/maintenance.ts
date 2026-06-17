import type { MaintenancePriority } from "./database";

/** Modèle de tâche d'entretien (template constructeur ou générique). */
export interface MaintenanceTemplate {
  titre: string;
  categorie: string;
  description?: string;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  /** Première échéance (pour les opérations de rodage notamment). */
  firstDueKm?: number | null;
  firstDueMonths?: number | null;
  priority?: MaintenancePriority;
  dueSoonKmThreshold?: number;
  dueSoonDaysThreshold?: number;
}

/** Catégories fonctionnelles d'entretien (pour regroupement UI). */
export const MAINTENANCE_CATEGORIES = [
  "Moteur",
  "Transmission",
  "Freinage",
  "Pneumatiques",
  "Liquides",
  "Contrôle",
  "Révision",
] as const;

export type MaintenanceCategorie = (typeof MAINTENANCE_CATEGORIES)[number];
