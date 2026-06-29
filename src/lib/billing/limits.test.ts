import { describe, it, expect } from "vitest";
import { getUserPlanState, hasAppAccess, isSubscriptionExpired } from "./limits";
import type { Profile } from "@/types/database";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    email: "test@example.fr",
    full_name: null,
    plan: "free",
    plan_status: "active",
    plan_interval: null,
    plan_renews_at: null,
    plan_canceled_at: null,
    mollie_customer_id: null,
    mollie_subscription_id: null,
    mollie_mandate_id: null,
    dealer_premium_until: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("getUserPlanState — offre concessionnaire", () => {
  const now = new Date("2026-06-17T00:00:00Z");

  it("accorde l'accès gratuit (1 véhicule) si dealer_premium_until est futur", () => {
    const profile = makeProfile({ dealer_premium_until: "2026-12-31T00:00:00Z" });
    const state = getUserPlanState(profile, now);
    expect(state.hasAccess).toBe(true);
    expect(state.effectivePlan).toBe("free");
    expect(state.isDealerOffer).toBe(true);
    expect(state.maxVehicles).toBe(1);
  });

  it("bloque l'accès sans code ni abonnement", () => {
    const state = getUserPlanState(makeProfile(), now);
    expect(state.hasAccess).toBe(false);
    expect(state.maxVehicles).toBe(0);
    expect(hasAppAccess(makeProfile(), now)).toBe(false);
  });

  it("bloque l'accès quand l'offre concessionnaire est expirée sans abo payant", () => {
    const profile = makeProfile({ dealer_premium_until: "2026-01-01T00:00:00Z" });
    const state = getUserPlanState(profile, now);
    expect(state.hasAccess).toBe(false);
    expect(state.isDealerOffer).toBe(false);
  });

  it("garde Premium via abonnement payant", () => {
    const profile = makeProfile({
      plan: "premium",
      plan_renews_at: "2026-07-01T00:00:00Z",
    });
    const state = getUserPlanState(profile, now);
    expect(state.hasAccess).toBe(true);
    expect(state.effectivePlan).toBe("premium");
    expect(state.maxVehicles).toBeGreaterThan(1);
  });

  it("priorise Premium payant sur l'offre concessionnaire", () => {
    const profile = makeProfile({
      plan: "premium",
      dealer_premium_until: "2026-12-31T00:00:00Z",
      plan_renews_at: "2026-07-01T00:00:00Z",
    });
    const state = getUserPlanState(profile, now);
    expect(state.effectivePlan).toBe("premium");
    expect(state.isDealerOffer).toBe(false);
  });
});

describe("isSubscriptionExpired", () => {
  it("détecte un abonnement résilié et échu", () => {
    const profile = makeProfile({
      plan: "premium",
      plan_canceled_at: "2026-05-01T00:00:00Z",
      plan_renews_at: "2026-06-01T00:00:00Z",
    });
    expect(isSubscriptionExpired(profile, new Date("2026-06-17T00:00:00Z"))).toBe(true);
  });

  it("considère actif un abonnement non échu", () => {
    const profile = makeProfile({
      plan: "premium",
      plan_renews_at: "2026-12-01T00:00:00Z",
    });
    expect(isSubscriptionExpired(profile, new Date("2026-06-17T00:00:00Z"))).toBe(false);
  });
});
