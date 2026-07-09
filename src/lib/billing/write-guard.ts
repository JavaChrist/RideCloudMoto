import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import { isAdminEmail } from "@/lib/admin";
import type { Profile } from "@/types/database";

export const READ_ONLY_MESSAGE =
  "Votre accès est en lecture seule (offre terminée). Passez en Premium pour ajouter ou modifier vos données. Votre historique reste consultable et exportable.";

export interface WriteGuard {
  supabase: SupabaseClient;
  userId: string | null;
  canWrite: boolean;
  isReadOnly: boolean;
  reason?: string;
}

/**
 * Vérifie que l'utilisateur courant peut écrire (ajout/modif/suppression).
 * Les comptes en lecture seule (offre expirée) sont bloqués en écriture.
 * Les admins et les comptes avec accès actif peuvent écrire.
 */
export async function getWriteGuard(): Promise<WriteGuard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null, canWrite: false, isReadOnly: false, reason: "Non authentifié" };
  }

  if (isAdminEmail(user.email)) {
    return { supabase, userId: user.id, canWrite: true, isReadOnly: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { supabase, userId: user.id, canWrite: true, isReadOnly: false };
  }

  const state = getUserPlanState(profile as Profile);
  if (state.isReadOnly) {
    return {
      supabase,
      userId: user.id,
      canWrite: false,
      isReadOnly: true,
      reason: READ_ONLY_MESSAGE,
    };
  }

  return { supabase, userId: user.id, canWrite: true, isReadOnly: false };
}
