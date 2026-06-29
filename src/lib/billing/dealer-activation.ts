import type { SupabaseClient } from "@supabase/supabase-js";

const DEALER_FREE_MONTHS = Number(process.env.DEALER_FREE_PREMIUM_MONTHS ?? 12);

/** Lettres autorisées sur les plaques SIV françaises (hors I, O, U). */
const PLATE_LETTERS = "ABCDEFGHJKLMNPQRSTVWXYZ";

/** Code normalisé : 2 lettres + 3 chiffres + 2 lettres (ex. AB123CD). */
export const PLATE_CODE_REGEX = /^[A-HJ-NP-TV-Z]{2}\d{3}[A-HJ-NP-TV-Z]{2}$/;

export function normalizeDealerCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s.-]+/g, "");
}

/** Affichage lisible type plaque : AB-123-CD */
export function formatDealerCodeDisplay(code: string): string {
  const n = normalizeDealerCode(code);
  if (PLATE_CODE_REGEX.test(n)) {
    return `${n.slice(0, 2)}-${n.slice(2, 5)}-${n.slice(5, 7)}`;
  }
  return n;
}

export function isFrenchPlateDealerCode(raw: string): boolean {
  return PLATE_CODE_REGEX.test(normalizeDealerCode(raw));
}

/** Accepte le format plaque SIV ou d'anciens codes alphanumériques (rétrocompatibilité). */
export function isValidDealerActivationCode(raw: string): boolean {
  const n = normalizeDealerCode(raw);
  if (!n) return false;
  if (PLATE_CODE_REGEX.test(n)) return true;
  return /^[A-Z0-9]{6,12}$/.test(n);
}

function randomPlateLetter(): string {
  return PLATE_LETTERS[Math.floor(Math.random() * PLATE_LETTERS.length)]!;
}

function randomPlateDigit(): string {
  return String(Math.floor(Math.random() * 10));
}

/** Génère un code au format immatriculation SIV : AA-123-BB (stocké sans tirets). */
export function generateDealerActivationCode(): string {
  return (
    randomPlateLetter() +
    randomPlateLetter() +
    randomPlateDigit() +
    randomPlateDigit() +
    randomPlateDigit() +
    randomPlateLetter() +
    randomPlateLetter()
  );
}

export type RedeemResult =
  | { ok: true; until: string }
  | { ok: false; error: string };

/**
 * Consomme un code concessionnaire et active l'offre gratuite (1 véhicule, 12 mois).
 */
export async function redeemDealerActivationCode(
  admin: SupabaseClient,
  userId: string,
  email: string,
  rawCode: string
): Promise<RedeemResult> {
  const code = normalizeDealerCode(rawCode);
  if (!isValidDealerActivationCode(code)) {
    return {
      ok: false,
      error: "Code invalide. Utilisez le format immatriculation (ex. AB-123-CD).",
    };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("dealer_premium_until")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.dealer_premium_until) {
    const until = new Date(profile.dealer_premium_until);
    if (!Number.isNaN(until.getTime()) && until.getTime() > Date.now()) {
      return { ok: false, error: "Une offre concessionnaire est déjà active sur ce compte." };
    }
  }

  const { data: row, error: fetchErr } = await admin
    .from("dealer_activation_codes")
    .select("id, used_by, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: "Code inconnu ou déjà utilisé." };
  }

  if (row.used_by) {
    return { ok: false, error: "Ce code a déjà été utilisé." };
  }

  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Ce code a expiré." };
  }

  const until = new Date();
  until.setMonth(until.getMonth() + DEALER_FREE_MONTHS);
  const untilIso = until.toISOString();

  const { data: claimed, error: claimErr } = await admin
    .from("dealer_activation_codes")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("id", row.id)
    .is("used_by", null)
    .select("id")
    .maybeSingle();

  if (claimErr || !claimed) {
    return { ok: false, error: "Impossible d'activer ce code. Réessayez." };
  }

  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      dealer_premium_until: untilIso,
    },
    { onConflict: "id" }
  );

  if (profileErr) {
    return { ok: false, error: "Erreur lors de l'activation du profil." };
  }

  return { ok: true, until: untilIso };
}

/**
 * Enregistre un code à partir d'une immatriculation (livraison moto).
 * Retourne le code normalisé ou une erreur si format / doublon.
 */
export async function registerPlateAsDealerCode(
  admin: SupabaseClient,
  rawPlate: string,
  dealerName: string | null
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const code = normalizeDealerCode(rawPlate);
  if (!isFrenchPlateDealerCode(code)) {
    return {
      ok: false,
      error: "Immatriculation invalide. Format attendu : AB-123-CD.",
    };
  }

  const { data: existing } = await admin
    .from("dealer_activation_codes")
    .select("id, used_by")
    .eq("code", code)
    .maybeSingle();

  if (existing) {
    if (existing.used_by) {
      return { ok: false, error: "Cette immatriculation a déjà été utilisée comme code." };
    }
    return { ok: true, code };
  }

  const { error } = await admin.from("dealer_activation_codes").insert({
    code,
    dealer_name: dealerName,
  });

  if (error) {
    return { ok: false, error: "Impossible d'enregistrer ce code." };
  }

  return { ok: true, code };
}
