import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { getMollieClient, isMollieConfigured } from "@/lib/billing/mollie";

export const dynamic = "force-dynamic";

/**
 * Resynchronise l'état d'abonnement Mollie → DB (filet de sécurité si le
 * webhook a été manqué, notamment au retour de paiement).
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
    .select("mollie_customer_id, mollie_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!isMollieConfigured() || !profile?.mollie_customer_id || !profile?.mollie_subscription_id) {
    return NextResponse.json({ ok: true, synced: false });
  }

  try {
    const mollie = getMollieClient();
    const sub = await mollie.customerSubscriptions.get(profile.mollie_subscription_id, {
      customerId: profile.mollie_customer_id,
    });

    const active = sub.status === "active";
    await admin
      .from("profiles")
      .update({
        plan: active ? "premium" : "free",
        plan_status: active ? "active" : "canceled",
        plan_renews_at: sub.nextPaymentDate ?? null,
      })
      .eq("id", user.id);

    return NextResponse.json({ ok: true, synced: true, status: sub.status });
  } catch (e) {
    console.error("[billing/sync]", e);
    return NextResponse.json({ ok: true, synced: false });
  }
}
