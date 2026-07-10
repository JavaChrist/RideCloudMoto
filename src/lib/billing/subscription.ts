import type { SupabaseClient } from "@supabase/supabase-js";
import type { MollieClient } from "@mollie/api-client";
import { PLANS } from "./plans";
import { formatMollieAmount } from "./mollie";

export type BillingInterval = "monthly" | "yearly";

function nextRenewal(interval: BillingInterval): string {
  const d = new Date();
  if (interval === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/**
 * Crée (ou réutilise) l'abonnement Premium récurrent après un premier paiement
 * réussi, puis passe le profil en Premium. Idempotent : si un abonnement actif
 * existe déjà côté Mollie, il est réutilisé au lieu d'en créer un doublon.
 */
export async function finalizePremiumSubscription(
  admin: SupabaseClient,
  mollie: MollieClient,
  opts: {
    userId: string;
    customerId: string;
    interval: BillingInterval;
    mandateId?: string | null;
    webhookUrl?: string;
  }
): Promise<{ subscriptionId: string }> {
  const { userId, customerId, interval, mandateId, webhookUrl } = opts;
  const price = PLANS.premium.prices[interval]!;

  // Idempotence : réutilise un abonnement existant (actif/en attente) s'il y en a un
  let subscriptionId: string | null = null;
  try {
    const existing = await mollie.customerSubscriptions.page({ customerId });
    const reusable = existing.find(
      (s) => s.status === "active" || s.status === "pending"
    );
    if (reusable) subscriptionId = reusable.id;
  } catch {
    /* pas d'abonnement listable : on en crée un */
  }

  if (!subscriptionId) {
    const subscription = await mollie.customerSubscriptions.create({
      customerId,
      amount: { currency: "EUR", value: formatMollieAmount(price.amount) },
      interval: interval === "yearly" ? "12 months" : "1 month",
      description: `RideCloudMoto Premium ${interval}`,
      webhookUrl,
      metadata: { userId },
    });
    subscriptionId = subscription.id;
  }

  await admin
    .from("profiles")
    .update({
      plan: "premium",
      plan_status: "active",
      plan_interval: interval,
      plan_renews_at: nextRenewal(interval),
      plan_canceled_at: null,
      mollie_subscription_id: subscriptionId,
      mollie_mandate_id: mandateId ?? null,
    })
    .eq("id", userId);

  return { subscriptionId };
}
