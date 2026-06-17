import type { UsageProfile, VehicleCategory } from "@/types/database";

/**
 * Kilométrage annuel moyen estimé par profil d'usage et catégorie.
 * Les motos/scooters roulent généralement moins qu'une voiture.
 */
const KM_PER_YEAR: Record<VehicleCategory, Record<UsageProfile, number>> = {
  motos: {
    daily: 12000,
    often: 6000,
    occasional: 3000,
    rare: 1500,
  },
  scooters: {
    daily: 9000,
    often: 5000,
    occasional: 2500,
    rare: 1200,
  },
};

export const USAGE_PROFILE_LABELS: Record<UsageProfile, string> = {
  daily: "Quotidien",
  often: "Régulier",
  occasional: "Occasionnel",
  rare: "Rare",
};

export const USAGE_PROFILE_DESCRIPTIONS: Record<UsageProfile, string> = {
  daily: "Tous les jours, trajets domicile-travail",
  often: "Plusieurs fois par semaine",
  occasional: "Quelques sorties par mois",
  rare: "Balades ponctuelles, collection",
};

export function avgKmPerYear(category: VehicleCategory, profile: UsageProfile): number {
  return KM_PER_YEAR[category]?.[profile] ?? 6000;
}
