import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { getMollieClient, isMollieConfigured } from "@/lib/billing/mollie";
import { finalizePremiumSubscription } from "@/lib/billing/subscription";
import { getSiteUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * Resynchronise l'état d'abonnement Mollie → DB (filet de sécurité si le
 * webhook a été manqué). Gère aussi le cas d'un 1er paiement encaissé dont
 * l'abonnement n'a jamais été créé (webhook perdu) : il finalise l'abonnement.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  await ensureProfile(admin, user.id, user.email ?? "");

  const { data: profile } = await admin
    .from("profiles")
    .select("mollie_customer_id, mollie_subscription_id, plan_interval")
    .eq("id", user.id)
    .maybeSingle();

  if (!isMollieConfigured() || !profile?.mollie_customer_id) {
    return NextResponse.json({ ok: true, synced: false, premium: false });
  }

  const mollie = getMollieClient();
  const customerId = profile.mollie_customer_id;

  try {
    // Cas 1 : un abonnement est déjà connu → on vérifie son état
    if (profile.mollie_subscription_id) {
      const sub = await mollie.customerSubscriptions.get(profile.mollie_subscription_id, {
        customerId,
      });
      const active = sub.status === "active" || sub.status === "pending";
      await admin
        .from("profiles")
        .update({
          plan: active ? "premium" : "free",
          plan_status: active ? "active" : "canceled",
          plan_renews_at: sub.nextPaymentDate ?? null,
        })
        .eq("id", user.id);
      return NextResponse.json({ ok: true, synced: true, premium: active, status: sub.status });
    }

    // Cas 2 : pas d'abonnement en DB → un webhook a peut-être été manqué.
    // On cherche un 1er paiement encaissé (subscription_setup) et on finalise.
    const payments = await mollie.customerPayments.page({ customerId, limit: 250 });
    const setupPaid = payments.find((p) => {
      const meta = (p.metadata ?? {}) as { kind?: string };
      return p.status === "paid" && meta.kind === "subscription_setup";
    });

    if (setupPaid) {
      const meta = (setupPaid.metadata ?? {}) as { interval?: "monthly" | "yearly" };
      const interval =
        meta.interval === "yearly"
          ? "yearly"
          : profile.plan_interval === "yearly"
            ? "yearly"
            : "monthly";
      await finalizePremiumSubscription(admin, mollie, {
        userId: user.id,
        customerId,
        interval,
        mandateId: setupPaid.mandateId ?? null,
        webhookUrl: `${getSiteUrl()}/api/billing/webhook`,
      });
      return NextResponse.json({ ok: true, synced: true, premium: true, recovered: true });
    }

    return NextResponse.json({ ok: true, synced: false, premium: false });
  } catch (e) {
    console.error("[billing/sync]", e);
    return NextResponse.json({ ok: true, synced: false, premium: false });
  }
}
