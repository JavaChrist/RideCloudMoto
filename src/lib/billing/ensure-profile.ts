import type { SupabaseClient } from "@supabase/supabase-js";
import { redeemDealerActivationCode } from "./dealer-activation";

export interface EnsureProfileOptions {
  dealerActivationCode?: string | null;
}

/**
 * Upsert idempotent de la row `profiles`.
 * N'accorde plus l'offre concessionnaire automatiquement — uniquement via code.
 */
export async function ensureProfile(
  admin: SupabaseClient,
  userId: string,
  email: string,
  options?: EnsureProfileOptions
): Promise<void> {
  try {
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      await admin.from("profiles").upsert({ id: userId, email }, { onConflict: "id" });
    } else {
      await admin.from("profiles").update({ email }).eq("id", userId);
    }

    const code = options?.dealerActivationCode?.trim();
    if (code) {
      const result = await redeemDealerActivationCode(admin, userId, email, code);
      if (!result.ok) {
        console.warn("[ensureProfile] dealer code not redeemed:", result.error);
      }
    }
  } catch (err) {
    console.error("[ensureProfile]", err);
  }
}
