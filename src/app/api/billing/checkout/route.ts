import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";
import { SequenceType } from "@mollie/api-client";
import { getMollieClient, isMollieConfigured, formatMollieAmount } from "@/lib/billing/mollie";
import { PLANS, CHECKOUT_CONSENT_VERSION } from "@/lib/billing/plans";
import { getSiteUrl } from "@/lib/supabase/env";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isMollieConfigured()) {
    return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const rl = rateLimit(`checkout:${user.id}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Trop de tentatives" }, { status: 429 });

  const { interval, consentVersion } = await request.json().catch(() => ({}));
  if (consentVersion !== CHECKOUT_CONSENT_VERSION) {
    return NextResponse.json({ error: "Consentement requis" }, { status: 400 });
  }
  const billingInterval = interval === "yearly" ? "yearly" : "monthly";
  const price = PLANS.premium.prices[billingInterval];
  if (!price) return NextResponse.json({ error: "Tarif invalide" }, { status: 400 });

  const admin = createAdminClient();
  await ensureProfile(admin, user.id, user.email ?? "");

  const { data: profile } = await admin
    .from("profiles")
    .select("mollie_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const mollie = getMollieClient();

  let customerId = profile?.mollie_customer_id;
  if (!customerId) {
    const customer = await mollie.customers.create({
      email: user.email ?? undefined,
      name: user.email ?? "Client RideCloudMoto",
    });
    customerId = customer.id;
    await admin.from("profiles").update({ mollie_customer_id: customerId }).eq("id", user.id);
  }

  const siteUrl = getSiteUrl();
  const payment = await mollie.payments.create({
    amount: { currency: "EUR", value: formatMollieAmount(price.amount) },
    description: `RideCloudMoto Premium (${billingInterval === "yearly" ? "annuel" : "mensuel"})`,
    sequenceType: SequenceType.first,
    customerId,
    redirectUrl: `${siteUrl}/parametres?billing=success`,
    webhookUrl: `${siteUrl}/api/billing/webhook`,
    metadata: { userId: user.id, interval: billingInterval, kind: "subscription_setup" },
  });

  await admin
    .from("profiles")
    .update({ plan_status: "pending", plan_interval: billingInterval })
    .eq("id", user.id);

  const checkoutUrl = payment.getCheckoutUrl();
  if (!checkoutUrl) {
    return NextResponse.json({ error: "URL de paiement indisponible" }, { status: 502 });
  }
  return NextResponse.json({ checkoutUrl });
}
