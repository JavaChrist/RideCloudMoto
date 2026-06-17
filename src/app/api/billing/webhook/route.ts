import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient, formatMollieAmount } from "@/lib/billing/mollie";
import { PLANS } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

/**
 * Webhook Mollie (sans auth — vérifié en réinterrogeant l'API Mollie).
 * Gère le paiement initial (first) → création de l'abonnement récurrent.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const paymentId = form?.get("id")?.toString();
  if (!paymentId) return NextResponse.json({ ok: true });

  try {
    const mollie = getMollieClient();
    const payment = await mollie.payments.get(paymentId);
    const metadata = (payment.metadata ?? {}) as {
      userId?: string;
      interval?: "monthly" | "yearly";
      kind?: string;
    };
    const userId = metadata.userId;
    if (!userId) return NextResponse.json({ ok: true });

    const admin = createAdminClient();

    if (payment.status !== "paid") {
      if (payment.status === "failed" || payment.status === "expired" || payment.status === "canceled") {
        await admin.from("profiles").update({ plan_status: "active" }).eq("id", userId);
      }
      return NextResponse.json({ ok: true });
    }

    const interval = metadata.interval === "yearly" ? "yearly" : "monthly";
    const price = PLANS.premium.prices[interval]!;
    const customerId = payment.customerId!;

    // Création de l'abonnement récurrent après le 1er paiement réussi
    if (metadata.kind === "subscription_setup") {
      const subscription = await mollie.customerSubscriptions.create({
        customerId,
        amount: { currency: "EUR", value: formatMollieAmount(price.amount) },
        interval: interval === "yearly" ? "12 months" : "1 month",
        description: `RideCloudMoto Premium ${interval}`,
        webhookUrl: payment.webhookUrl ?? undefined,
        metadata: { userId },
      });

      const renews = new Date();
      if (interval === "yearly") renews.setFullYear(renews.getFullYear() + 1);
      else renews.setMonth(renews.getMonth() + 1);

      await admin
        .from("profiles")
        .update({
          plan: "premium",
          plan_status: "active",
          plan_interval: interval,
          plan_renews_at: renews.toISOString(),
          plan_canceled_at: null,
          mollie_subscription_id: subscription.id,
          mollie_mandate_id: payment.mandateId ?? null,
        })
        .eq("id", userId);
    } else {
      // Paiement récurrent : prolonger la date de renouvellement
      const renews = new Date();
      if (interval === "yearly") renews.setFullYear(renews.getFullYear() + 1);
      else renews.setMonth(renews.getMonth() + 1);
      await admin
        .from("profiles")
        .update({ plan: "premium", plan_status: "active", plan_renews_at: renews.toISOString() })
        .eq("id", userId);
    }
  } catch (e) {
    console.error("[billing/webhook]", e);
  }

  return NextResponse.json({ ok: true });
}
