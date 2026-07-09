import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Dealer, DealerRole } from "@/types/database";

export interface DealerMembership {
  dealerId: string;
  role: DealerRole;
}

/** Appartenance concessionnaire de l'utilisateur (compte dédié), ou null. */
export async function getDealerMembership(
  supabase: SupabaseClient,
  userId: string
): Promise<DealerMembership | null> {
  const { data } = await supabase
    .from("dealer_users")
    .select("dealer_id, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return { dealerId: data.dealer_id as string, role: data.role as DealerRole };
}

export interface DealerPortalContext {
  user: User;
  membership: DealerMembership;
  dealer: Dealer;
}

/**
 * Contexte du portail concessionnaire pour les pages (rendu serveur).
 * Retourne null si l'utilisateur n'est pas un compte concessionnaire.
 */
export async function getDealerPortalContext(): Promise<DealerPortalContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const membership = await getDealerMembership(supabase, user.id);
  if (!membership) return null;

  const { data: dealer } = await supabase
    .from("dealers")
    .select("*")
    .eq("id", membership.dealerId)
    .maybeSingle();
  if (!dealer) return null;

  return { user, membership, dealer: dealer as Dealer };
}

export interface DealerApiContext {
  user: User;
  membership: DealerMembership;
  admin: ReturnType<typeof createAdminClient>;
}

/**
 * Contexte du portail pour les routes API : vérifie l'appartenance puis fournit
 * un client service_role scoped par `membership.dealerId`.
 */
export async function requireDealerApiContext(): Promise<DealerApiContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const membership = await getDealerMembership(supabase, user.id);
  if (!membership) return null;

  return { user, membership, admin: createAdminClient() };
}
