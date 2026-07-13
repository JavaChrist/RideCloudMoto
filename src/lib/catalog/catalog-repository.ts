import type { SupabaseClient } from "@supabase/supabase-js";
import type { VehicleCategory } from "@/types/database";
import type { MaintenanceTemplate } from "@/types/maintenance";

/** Modèle allégé transmis au formulaire d'ajout de véhicule. */
export interface FormCatalogModel {
  name: string;
  category: VehicleCategory;
  years: number[];
}

/** Marque + ses modèles, pour le sélecteur du formulaire. */
export interface FormCatalogBrand {
  name: string;
  slug: string;
  logoUrl: string | null;
  models: FormCatalogModel[];
}

/** Fiche catalogue complète d'un modèle (fiche technique + notice + entretien). */
export interface CatalogModelDetail {
  name: string;
  brandName: string;
  category: VehicleCategory;
  specs: Record<string, string>;
  noticeUrl: string | null;
  maintenanceTasks: MaintenanceTemplate[];
}

/**
 * Catalogue pour le formulaire d'ajout : marques actives et leurs modèles actifs.
 * Si `allowedBrandNames` est fourni (marques du concessionnaire), seules ces
 * marques sont retournées ; liste vide ou null = toutes les marques.
 */
export async function getFormCatalog(
  supabase: SupabaseClient,
  allowedBrandNames?: string[] | null
): Promise<FormCatalogBrand[]> {
  const { data, error } = await supabase
    .from("catalog_brands")
    .select("name, slug, logo_url, catalog_models(name, category, years, is_active)")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;

  const allowed =
    allowedBrandNames && allowedBrandNames.length > 0
      ? new Set(allowedBrandNames.map((b) => b.trim().toLowerCase()))
      : null;

  return (data ?? [])
    .filter((b) => !allowed || allowed.has(b.name.toLowerCase()))
    .map((b) => ({
      name: b.name,
      slug: b.slug,
      logoUrl: b.logo_url,
      models: (b.catalog_models ?? [])
        .filter((m: { is_active: boolean }) => m.is_active)
        .map((m: { name: string; category: string; years: number[] }) => ({
          name: m.name,
          category: m.category as VehicleCategory,
          years: m.years ?? [],
        }))
        .sort((a: FormCatalogModel, z: FormCatalogModel) => a.name.localeCompare(z.name)),
    }));
}

/**
 * Retrouve la fiche catalogue d'un véhicule (marque + catégorie + modèle,
 * insensible à la casse). Retourne null si le modèle est hors catalogue.
 */
export async function findCatalogModelDetail(
  supabase: SupabaseClient,
  marque: string,
  category: VehicleCategory,
  modele: string
): Promise<CatalogModelDetail | null> {
  const { data, error } = await supabase
    .from("catalog_models")
    .select(
      "name, category, specs, notice_url, brand:catalog_brands!inner(name), profile:catalog_maintenance_profiles(tasks)"
    )
    .eq("category", category)
    .eq("is_active", true)
    .ilike("name", modele)
    .ilike("brand.name", marque)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const brand = data.brand as unknown as { name: string } | null;
  const profile = data.profile as unknown as { tasks: unknown } | null;
  const tasks = Array.isArray(profile?.tasks)
    ? (profile!.tasks as MaintenanceTemplate[])
    : [];

  return {
    name: data.name,
    brandName: brand?.name ?? marque,
    category: data.category as VehicleCategory,
    specs: (data.specs ?? {}) as Record<string, string>,
    noticeUrl: data.notice_url ?? null,
    maintenanceTasks: tasks,
  };
}
