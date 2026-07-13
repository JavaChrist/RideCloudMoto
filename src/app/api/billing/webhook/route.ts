import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient } from "@/lib/billing/mollie";
import { finalizePremiumSubscription } from "@/lib/billing/subscription";

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
    const customerId = payment.customerId!;

    // Corrélation de sécurité : le client Mollie du paiement doit correspondre
    // au client enregistré sur le profil ciblé (sinon métadonnées suspectes).
    const { data: profile } = await admin
      .from("profiles")
      .select("mollie_customer_id")
      .eq("id", userId)
      .maybeSingle();
    if (
      profile?.mollie_customer_id &&
      customerId &&
      profile.mollie_customer_id !== customerId
    ) {
      console.error("[billing/webhook] customerId mismatch", { userId, customerId });
      return NextResponse.json({ ok: true });
    }

    // Création de l'abonnement récurrent après le 1er paiement réussi
    if (metadata.kind === "subscription_setup") {
      await finalizePremiumSubscription(admin, mollie, {
        userId,
        customerId,
        interval,
        mandateId: payment.mandateId ?? null,
        webhookUrl: payment.webhookUrl ?? undefined,
      });
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
