import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient, isMollieConfigured } from "@/lib/billing/mollie";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("mollie_customer_id, mollie_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  if (isMollieConfigured() && profile?.mollie_customer_id && profile?.mollie_subscription_id) {
    try {
      const mollie = getMollieClient();
      await mollie.customerSubscriptions.cancel(profile.mollie_subscription_id, {
        customerId: profile.mollie_customer_id,
      });
    } catch (e) {
      console.error("[billing/cancel]", e);
    }
  }

  await admin
    .from("profiles")
    .update({ plan_status: "canceled", plan_canceled_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
