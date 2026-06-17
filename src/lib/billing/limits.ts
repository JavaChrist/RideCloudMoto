import type { Profile } from "@/types/database";
import type { PlanId } from "./plans";
import { maxVehiclesForPlan } from "./plans";

export interface PlanState {
  /** Plan effectif appliqué à l'utilisateur (offre concessionnaire incluse). */
  effectivePlan: PlanId;
  /** Plan réellement payé (issu de Mollie). */
  paidPlan: PlanId;
  /** True si l'accès Premium provient de l'offre concessionnaire (gratuite). */
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
 * (annulé + date de renouvellement dépassée)
 */
export function isSubscriptionExpired(profile: Profile, at: Date = new Date()): boolean {
  if (profile.plan_canceled_at && profile.plan_renews_at) {
    return new Date(profile.plan_renews_at).getTime() < at.getTime();
  }
  return profile.plan_status === "canceled";
}

/**
 * Calcule l'état de plan effectif d'un utilisateur en combinant :
 *  1. L'offre concessionnaire (Premium gratuit jusqu'à dealer_premium_until)
 *  2. L'abonnement payant Mollie (et son éventuelle expiration)
 */
export function getUserPlanState(profile: Profile, at: Date = new Date()): PlanState {
  const expired = isSubscriptionExpired(profile, at);
  const paidPlan: PlanId = expired ? "free" : profile.plan === "premium" ? "premium" : "free";

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

  const isDealerOffer = dealerActive && paidPlan !== "premium";
  const effectivePlan: PlanId = dealerActive || paidPlan === "premium" ? "premium" : "free";

  return {
    effectivePlan,
    paidPlan,
    isDealerOffer,
    dealerPremiumUntil,
    dealerDaysLeft: dealerActive ? dealerDaysLeft : null,
    isExpired: expired,
    maxVehicles: maxVehiclesForPlan(effectivePlan),
  };
}

export function isPremium(profile: Profile, at: Date = new Date()): boolean {
  return getUserPlanState(profile, at).effectivePlan === "premium";
}
