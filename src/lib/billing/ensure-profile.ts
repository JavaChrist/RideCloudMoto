import type { SupabaseClient } from "@supabase/supabase-js";

const DEALER_FREE_PREMIUM_MONTHS = Number(process.env.DEALER_FREE_PREMIUM_MONTHS ?? 12);

/**
 * Upsert idempotent de la row `profiles`. Positionne la période Premium
 * offerte par le concessionnaire si elle n'existe pas encore.
 * Non bloquant : ne lève jamais (log only).
 */
export async function ensureProfile(
  admin: SupabaseClient,
  userId: string,
  email: string
): Promise<void> {
  try {
    const { data: existing } = await admin
      .from("profiles")
      .select("id, dealer_premium_until")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      const until = new Date();
      until.setMonth(until.getMonth() + DEALER_FREE_PREMIUM_MONTHS);
      await admin.from("profiles").upsert(
        {
          id: userId,
          email,
          dealer_premium_until: until.toISOString(),
        },
        { onConflict: "id" }
      );
      return;
    }

    if (!existing.dealer_premium_until) {
      const until = new Date();
      until.setMonth(until.getMonth() + DEALER_FREE_PREMIUM_MONTHS);
      await admin
        .from("profiles")
        .update({ email, dealer_premium_until: until.toISOString() })
        .eq("id", userId);
    }
  } catch (err) {
    console.error("[ensureProfile]", err);
  }
}
