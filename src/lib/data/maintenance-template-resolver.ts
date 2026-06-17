import type { Vehicle } from "@/types/database";
import type { MaintenanceTemplate } from "@/types/maintenance";
import { findCatalogModel } from "./vehicle-catalog";
import { getManufacturerTemplates } from "./maintenance-manufacturer-templates";
import { GENERIC_TEMPLATES } from "./maintenance-templates";

/**
 * Résout la liste de templates d'entretien applicables à un véhicule :
 *  1. Profil constructeur Voge (via le catalogue) si le modèle est reconnu.
 *  2. Repli sur les templates génériques de la catégorie.
 */
export function resolveTemplatesForVehicle(vehicle: Vehicle): {
  templates: MaintenanceTemplate[];
  source: "manufacturer" | "generic";
} {
  const model = findCatalogModel(vehicle.category, vehicle.modele);
  if (model) {
    const manufacturer = getManufacturerTemplates(model.maintenanceProfile);
    if (manufacturer && manufacturer.length > 0) {
      return { templates: manufacturer, source: "manufacturer" };
    }
  }
  return { templates: GENERIC_TEMPLATES[vehicle.category] ?? [], source: "generic" };
}
