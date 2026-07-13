import type { SupabaseClient } from "@supabase/supabase-js";
import type { Vehicle } from "@/types/database";
import type { MaintenanceTemplate } from "@/types/maintenance";
import { findCatalogModelDetail } from "@/lib/catalog/catalog-repository";
import { GENERIC_TEMPLATES } from "./maintenance-templates";

/**
 * Résout la liste de templates d'entretien applicables à un véhicule :
 *  1. Profil constructeur du catalogue en base (marque + catégorie + modèle).
 *  2. Repli sur les templates génériques de la catégorie.
 */
export async function resolveTemplatesForVehicle(
  supabase: SupabaseClient,
  vehicle: Vehicle
): Promise<{
  templates: MaintenanceTemplate[];
  source: "manufacturer" | "generic";
}> {
  try {
    const model = await findCatalogModelDetail(
      supabase,
      vehicle.marque,
      vehicle.category,
      vehicle.modele
    );
    if (model && model.maintenanceTasks.length > 0) {
      return { templates: model.maintenanceTasks, source: "manufacturer" };
    }
  } catch {
    // Catalogue indisponible : on retombe sur le plan générique.
  }
  return { templates: GENERIC_TEMPLATES[vehicle.category] ?? [], source: "generic" };
}
