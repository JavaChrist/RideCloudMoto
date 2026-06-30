export type PlanId = "free" | "premium";

export interface PlanPrice {
  amount: number;
  currency: "EUR";
  label: string;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  prices: { monthly: PlanPrice | null; yearly: PlanPrice | null };
  maxVehicles: number;
  features: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Gratuit",
    tagline: "Offert 12 mois par votre concessionnaire (code d'activation)",
    prices: { monthly: null, yearly: null },
    maxVehicles: 1,
    features: [
      "1 véhicule",
      "Carnet d'entretien",
      "Historique illimité",
      "Rappels manuels",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "Le suivi complet, sans limite",
    prices: {
      monthly: { amount: 3.99, currency: "EUR", label: "3,99 €/mois" },
      yearly: { amount: 39.99, currency: "EUR", label: "39,99 €/an" },
    },
    maxVehicles: 5,
    features: [
      "Jusqu'à 5 véhicules",
      "Plan d'entretien constructeur",
      "Rappels automatiques + notifications push",
      "Fiches techniques & notices",
      "Export PDF / ZIP / JSON",
      "Estimation kilométrique intelligente",
    ],
  },
};

/** Version du consentement CGV affiché lors du checkout. */
export const CHECKOUT_CONSENT_VERSION = "2026-06-rcm-v1";

export function getPlan(id: PlanId): PlanDefinition {
  return PLANS[id];
}

export function maxVehiclesForPlan(id: PlanId): number {
  return PLANS[id].maxVehicles;
}
