import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dealer, DealerPromotion } from "@/types/database";

export interface DealerWithPromotions {
  dealer: Dealer;
  promotions: DealerPromotion[];
}

/** Récupère un concessionnaire actif par son identifiant. */
export async function getDealerById(
  supabase: SupabaseClient,
  dealerId: string
): Promise<Dealer | null> {
  const { data } = await supabase
    .from("dealers")
    .select("*")
    .eq("id", dealerId)
    .maybeSingle();
  return (data as Dealer | null) ?? null;
}

/** Récupère un concessionnaire par son slug. */
export async function getDealerBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Dealer | null> {
  const { data } = await supabase
    .from("dealers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Dealer | null) ?? null;
}

/** Promotions actives d'un concessionnaire (non expirées). */
export async function getDealerPromotions(
  supabase: SupabaseClient,
  dealerId: string,
  at: Date = new Date()
): Promise<DealerPromotion[]> {
  const { data } = await supabase
    .from("dealer_promotions")
    .select("*")
    .eq("dealer_id", dealerId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const today = at.toISOString().slice(0, 10);
  return ((data as DealerPromotion[] | null) ?? []).filter((p) => {
    if (p.valid_until && p.valid_until < today) return false;
    if (p.valid_from && p.valid_from > today) return false;
    return true;
  });
}

/** Concessionnaire + promotions actives pour un identifiant donné. */
export async function getDealerWithPromotions(
  supabase: SupabaseClient,
  dealerId: string | null | undefined
): Promise<DealerWithPromotions | null> {
  if (!dealerId) return null;
  const dealer = await getDealerById(supabase, dealerId);
  if (!dealer || !dealer.is_active) return null;
  const promotions = await getDealerPromotions(supabase, dealer.id);
  return { dealer, promotions };
}

/** Liste des concessionnaires (admin). */
export async function listDealers(supabase: SupabaseClient): Promise<Dealer[]> {
  const { data } = await supabase
    .from("dealers")
    .select("*")
    .order("name", { ascending: true });
  return (data as Dealer[] | null) ?? [];
}
