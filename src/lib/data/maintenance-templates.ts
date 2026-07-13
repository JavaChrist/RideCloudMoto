import type { VehicleCategory } from "@/types/database";
import type { MaintenanceTemplate } from "@/types/maintenance";

/**
 * Templates génériques par catégorie — utilisés en repli si aucun profil
 * constructeur précis n'est trouvé.
 */
export const GENERIC_TEMPLATES: Record<VehicleCategory, MaintenanceTemplate[]> = {
  motos: [
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      description: "Remplacement de l'huile moteur et du filtre à huile.",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Contrôle / réglage tension de chaîne",
      categorie: "Transmission",
      description: "Vérifier la tension et lubrifier la chaîne.",
      intervalKm: 1000,
      intervalMonths: 2,
      priority: "normal",
    },
    {
      titre: "Plaquettes de frein (avant/arrière)",
      categorie: "Freinage",
      description: "Contrôle de l'usure des plaquettes.",
      intervalKm: 8000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Liquide de frein",
      categorie: "Liquides",
      description: "Remplacement du liquide de frein.",
      intervalMonths: 24,
      priority: "important",
    },
    {
      titre: "Pneumatiques (contrôle usure/pression)",
      categorie: "Pneumatiques",
      intervalKm: 5000,
      intervalMonths: 6,
      priority: "normal",
    },
    {
      titre: "Révision générale",
      categorie: "Révision",
      intervalKm: 12000,
      intervalMonths: 12,
      priority: "important",
    },
  ],
  scooters: [
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      intervalKm: 5000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Contrôle courroie de variateur (CVT)",
      categorie: "Transmission",
      description: "Vérification et remplacement de la courroie de transmission.",
      intervalKm: 10000,
      intervalMonths: 24,
      priority: "important",
    },
    {
      titre: "Galets de variateur",
      categorie: "Transmission",
      intervalKm: 12000,
      priority: "normal",
    },
    {
      titre: "Huile de transmission finale",
      categorie: "Transmission",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "normal",
    },
    {
      titre: "Plaquettes de frein",
      categorie: "Freinage",
      intervalKm: 8000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Liquide de frein",
      categorie: "Liquides",
      intervalMonths: 24,
      priority: "important",
    },
    {
      titre: "Révision générale",
      categorie: "Révision",
      intervalKm: 10000,
      intervalMonths: 12,
      priority: "important",
    },
  ],
  quads: [
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      description: "Usage intensif ou tout-terrain : rapprocher l'échéance.",
      intervalKm: 2500,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Filtre à air (nettoyage / remplacement)",
      categorie: "Moteur",
      description: "Contrôle fréquent en usage poussiéreux.",
      intervalKm: 1500,
      intervalMonths: 6,
      priority: "important",
    },
    {
      titre: "Courroie de variateur (CVT)",
      categorie: "Transmission",
      intervalKm: 5000,
      intervalMonths: 24,
      priority: "important",
    },
    {
      titre: "Graissage châssis, rotules et cardans",
      categorie: "Transmission",
      intervalKm: 1000,
      intervalMonths: 6,
      priority: "normal",
    },
    {
      titre: "Plaquettes de frein",
      categorie: "Freinage",
      intervalKm: 4000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Liquide de frein",
      categorie: "Liquides",
      intervalMonths: 24,
      priority: "important",
    },
    {
      titre: "Pneumatiques (contrôle usure/pression)",
      categorie: "Pneumatiques",
      intervalKm: 2500,
      intervalMonths: 6,
      priority: "normal",
    },
    {
      titre: "Révision générale",
      categorie: "Révision",
      intervalKm: 2500,
      intervalMonths: 12,
      priority: "important",
    },
  ],
};
