import type { SupabaseClient } from "@supabase/supabase-js";

const DEALER_FREE_MONTHS = Number(process.env.DEALER_FREE_PREMIUM_MONTHS ?? 12);

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

/** Le code d'activation est désormais une immatriculation SIV. */
export function isValidDealerActivationCode(raw: string): boolean {
  return isFrenchPlateDealerCode(raw);
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
      error: "Immatriculation invalide. Format attendu : AB-123-CD.",
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

export interface DealerCodeCustomerInfo {
  dealerName?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  vehicleModel?: string | null;
  purchaseDate?: string | null; // YYYY-MM-DD
}

function toDbColumns(info: DealerCodeCustomerInfo) {
  const clean = (v?: string | null) => {
    const t = v?.trim();
    return t ? t : null;
  };
  return {
    dealer_name: clean(info.dealerName),
    customer_first_name: clean(info.customerFirstName),
    customer_last_name: clean(info.customerLastName),
    customer_email: clean(info.customerEmail)?.toLowerCase() ?? null,
    customer_phone: clean(info.customerPhone),
    vehicle_model: clean(info.vehicleModel),
    purchase_date: clean(info.purchaseDate),
  };
}

/**
 * Enregistre un code à partir d'une immatriculation (livraison moto) avec
 * les informations client/véhicule fournies par le concessionnaire.
 */
export async function registerPlateAsDealerCode(
  admin: SupabaseClient,
  rawPlate: string,
  info: DealerCodeCustomerInfo
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const code = normalizeDealerCode(rawPlate);
  if (!isFrenchPlateDealerCode(code)) {
    return {
      ok: false,
      error: "Immatriculation invalide. Format attendu : AB-123-CD.",
    };
  }

  const columns = toDbColumns(info);

  const { data: existing } = await admin
    .from("dealer_activation_codes")
    .select("id, used_by")
    .eq("code", code)
    .maybeSingle();

  if (existing) {
    if (existing.used_by) {
      return { ok: false, error: "Cette immatriculation a déjà été utilisée comme code." };
    }
    const { error } = await admin
      .from("dealer_activation_codes")
      .update(columns)
      .eq("id", existing.id);
    if (error) {
      return { ok: false, error: "Impossible de mettre à jour cette fiche." };
    }
    return { ok: true, code };
  }

  const { error } = await admin.from("dealer_activation_codes").insert({
    code,
    ...columns,
  });

  if (error) {
    return { ok: false, error: "Impossible d'enregistrer ce code." };
  }

  return { ok: true, code };
}
