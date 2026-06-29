import type { Profile } from "@/types/database";
import type { PlanId } from "./plans";
import { maxVehiclesForPlan } from "./plans";

export interface PlanState {
  /** Plan effectif pour quotas et fonctionnalités (free = offre concessionnaire active). */
  effectivePlan: PlanId;
  /** Plan réellement payé via Mollie. */
  paidPlan: PlanId;
  /** L'utilisateur peut utiliser l'application (offre concessionnaire ou Premium payant). */
  hasAccess: boolean;
  /** True si l'accès provient de l'offre gratuite concessionnaire (1 véhicule, durée limitée). */
  isDealerOffer: boolean;
  /** Date de fin de l'offre concessionnaire, si applicable. */
  dealerPremiumUntil: Date | null;
  /** Jours restants avant la fin de l'offre concessionnaire (>= 0) ou null. */
  dealerDaysLeft: number | null;
  /** True si l'abonnement payant est expiré/annulé. */
  isExpired: boolean;
  maxVehicles: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Détermine si l'abonnement payant Mollie est expiré.
 */
export function isSubscriptionExpired(profile: Profile, at: Date = new Date()): boolean {
  if (profile.plan_canceled_at && profile.plan_renews_at) {
    return new Date(profile.plan_renews_at).getTime() < at.getTime();
  }
  return profile.plan_status === "canceled";
}

/**
 * Calcule l'état de plan effectif :
 *  1. Offre concessionnaire active → Gratuit (1 véhicule), accès autorisé
 *  2. Abonnement Premium Mollie actif → Premium, accès autorisé
 *  3. Sinon → pas d'accès (Premium requis ou code concessionnaire)
 */
export function getUserPlanState(profile: Profile, at: Date = new Date()): PlanState {
  const expired = isSubscriptionExpired(profile, at);
  const paidPlan: PlanId =
    expired ? "free" : profile.plan === "premium" ? "premium" : "free";

  let dealerPremiumUntil: Date | null = null;
  let dealerActive = false;
  let dealerDaysLeft: number | null = null;

  if (profile.dealer_premium_until) {
    dealerPremiumUntil = new Date(profile.dealer_premium_until);
    if (!Number.isNaN(dealerPremiumUntil.getTime())) {
      dealerActive = dealerPremiumUntil.getTime() > at.getTime();
      dealerDaysLeft = Math.max(
        0,
        Math.ceil((dealerPremiumUntil.getTime() - at.getTime()) / MS_PER_DAY)
      );
    }
  }

  const hasPaidPremium = paidPlan === "premium" && !expired;
  const isDealerOffer = dealerActive && !hasPaidPremium;
  const hasAccess = dealerActive || hasPaidPremium;

  let effectivePlan: PlanId;
  if (hasPaidPremium) {
    effectivePlan = "premium";
  } else if (dealerActive) {
    effectivePlan = "free";
  } else {
    effectivePlan = "free";
  }

  return {
    effectivePlan,
    paidPlan,
    hasAccess,
    isDealerOffer,
    dealerPremiumUntil,
    dealerDaysLeft: dealerActive ? dealerDaysLeft : null,
    isExpired: expired,
    maxVehicles: hasAccess ? maxVehiclesForPlan(effectivePlan) : 0,
  };
}

export function hasAppAccess(profile: Profile, at: Date = new Date()): boolean {
  return getUserPlanState(profile, at).hasAccess;
}

export function isPremium(profile: Profile, at: Date = new Date()): boolean {
  return getUserPlanState(profile, at).effectivePlan === "premium";
}
