import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient, isMollieConfigured } from "@/lib/billing/mollie";

export const dynamic = "force-dynamic";

/**
 * Suppression de compte RGPD : annule l'abonnement Mollie, supprime les
 * fichiers Storage, puis supprime l'utilisateur (cascade DB via FK).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createAdminClient();

  // 1. Annuler l'abonnement Mollie éventuel
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
      console.error("[account/delete] mollie cancel", e);
    }
  }

  // 2. Supprimer les fichiers Storage de l'utilisateur
  try {
    const { data: files } = await admin.storage.from("ridecloudmoto-files").list(user.id);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${f.name}`);
      await admin.storage.from("ridecloudmoto-files").remove(paths);
    }
  } catch (e) {
    console.error("[account/delete] storage", e);
  }

  // 3. Supprimer l'utilisateur (cascade sur profiles, vehicles, etc.)
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
