import type { MaintenanceTemplate } from "@/types/maintenance";

/**
 * Plans d'entretien spécifiques Voge, indexés par `maintenanceProfile`
 * (cf. vehicle-catalog.ts). Intervalles dérivés des préconisations
 * constructeur Voge (révision principale tous les 6 000 km).
 */

const COMMON_BRAKE_FLUID: MaintenanceTemplate = {
  titre: "Remplacement liquide de frein",
  categorie: "Liquides",
  description: "Purge et remplacement du liquide de frein DOT 4.",
  intervalMonths: 24,
  priority: "important",
};

const COMMON_COOLANT: MaintenanceTemplate = {
  titre: "Remplacement liquide de refroidissement",
  categorie: "Liquides",
  description: "Vidange du circuit de refroidissement.",
  intervalKm: 24000,
  intervalMonths: 36,
  priority: "normal",
};

const COMMON_TIRES: MaintenanceTemplate = {
  titre: "Contrôle pneumatiques (usure & pression)",
  categorie: "Pneumatiques",
  intervalKm: 5000,
  intervalMonths: 6,
  priority: "normal",
};

const COMMON_BRAKE_PADS: MaintenanceTemplate = {
  titre: "Contrôle plaquettes de frein avant/arrière",
  categorie: "Freinage",
  intervalKm: 8000,
  intervalMonths: 12,
  priority: "important",
};

export const VOGE_MAINTENANCE_PROFILES: Record<string, MaintenanceTemplate[]> = {
  // ── Monocylindre ~300 routier ────────────────────────────────────────────
  moto_mono_petite: [
    {
      titre: "Rodage : 1ère vidange moteur + filtre",
      categorie: "Moteur",
      description: "Vidange de rodage à effectuer entre 800 et 1 000 km.",
      firstDueKm: 1000,
      priority: "urgent",
    },
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Contrôle / lubrification chaîne",
      categorie: "Transmission",
      intervalKm: 1000,
      intervalMonths: 2,
      priority: "normal",
    },
    {
      titre: "Contrôle jeu aux soupapes",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "important",
    },
    {
      titre: "Remplacement bougie",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "normal",
    },
    {
      titre: "Filtre à air",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "normal",
    },
    COMMON_BRAKE_PADS,
    COMMON_BRAKE_FLUID,
    COMMON_COOLANT,
    COMMON_TIRES,
    {
      titre: "Révision principale",
      categorie: "Révision",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
  ],

  // ── Monocylindre 300 trail ───────────────────────────────────────────────
  moto_mono_trail: [
    {
      titre: "Rodage : 1ère vidange moteur + filtre",
      categorie: "Moteur",
      firstDueKm: 1000,
      priority: "urgent",
    },
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Contrôle / lubrification chaîne (usage trail)",
      categorie: "Transmission",
      intervalKm: 800,
      intervalMonths: 2,
      priority: "normal",
    },
    {
      titre: "Contrôle jeu aux soupapes",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "important",
    },
    {
      titre: "Remplacement bougie",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "normal",
    },
    {
      titre: "Filtre à air (contrôle renforcé tout-terrain)",
      categorie: "Moteur",
      intervalKm: 8000,
      priority: "normal",
    },
    COMMON_BRAKE_PADS,
    COMMON_BRAKE_FLUID,
    COMMON_COOLANT,
    COMMON_TIRES,
    {
      titre: "Révision principale",
      categorie: "Révision",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
  ],

  // ── Bicylindre 471/494 cm³ ───────────────────────────────────────────────
  moto_bicylindre: [
    {
      titre: "Rodage : 1ère vidange moteur + filtre",
      categorie: "Moteur",
      firstDueKm: 1000,
      priority: "urgent",
    },
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Contrôle / lubrification chaîne",
      categorie: "Transmission",
      intervalKm: 1000,
      intervalMonths: 2,
      priority: "normal",
    },
    {
      titre: "Contrôle jeu aux soupapes",
      categorie: "Moteur",
      intervalKm: 24000,
      priority: "important",
    },
    {
      titre: "Remplacement bougies",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "normal",
    },
    {
      titre: "Filtre à air",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "normal",
    },
    COMMON_BRAKE_PADS,
    COMMON_BRAKE_FLUID,
    COMMON_COOLANT,
    COMMON_TIRES,
    {
      titre: "Révision principale",
      categorie: "Révision",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
  ],

  // ── Bicylindre 650/900 cm³ ───────────────────────────────────────────────
  moto_bicylindre_grosse: [
    {
      titre: "Rodage : 1ère vidange moteur + filtre",
      categorie: "Moteur",
      firstDueKm: 1000,
      priority: "urgent",
    },
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      intervalKm: 8000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Contrôle / lubrification chaîne",
      categorie: "Transmission",
      intervalKm: 1000,
      intervalMonths: 2,
      priority: "normal",
    },
    {
      titre: "Contrôle jeu aux soupapes",
      categorie: "Moteur",
      intervalKm: 24000,
      priority: "important",
    },
    {
      titre: "Remplacement bougies",
      categorie: "Moteur",
      intervalKm: 16000,
      priority: "normal",
    },
    {
      titre: "Filtre à air",
      categorie: "Moteur",
      intervalKm: 16000,
      priority: "normal",
    },
    COMMON_BRAKE_PADS,
    COMMON_BRAKE_FLUID,
    COMMON_COOLANT,
    COMMON_TIRES,
    {
      titre: "Révision principale",
      categorie: "Révision",
      intervalKm: 8000,
      intervalMonths: 12,
      priority: "important",
    },
  ],

  // ── Scooter CVT 125 ──────────────────────────────────────────────────────
  scooter_cvt_petit: [
    {
      titre: "Rodage : 1ère vidange moteur",
      categorie: "Moteur",
      firstDueKm: 1000,
      priority: "urgent",
    },
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      intervalKm: 5000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Huile de transmission finale",
      categorie: "Transmission",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "normal",
    },
    {
      titre: "Courroie de variateur (CVT)",
      categorie: "Transmission",
      description: "Contrôle et remplacement de la courroie de transmission.",
      intervalKm: 10000,
      priority: "important",
    },
    {
      titre: "Galets de variateur",
      categorie: "Transmission",
      intervalKm: 12000,
      priority: "normal",
    },
    {
      titre: "Bougie",
      categorie: "Moteur",
      intervalKm: 10000,
      priority: "normal",
    },
    COMMON_BRAKE_PADS,
    COMMON_BRAKE_FLUID,
    COMMON_TIRES,
    {
      titre: "Révision principale",
      categorie: "Révision",
      intervalKm: 5000,
      intervalMonths: 12,
      priority: "important",
    },
  ],

  // ── Scooter CVT GT 350 ───────────────────────────────────────────────────
  scooter_cvt_gt: [
    {
      titre: "Rodage : 1ère vidange moteur",
      categorie: "Moteur",
      firstDueKm: 1000,
      priority: "urgent",
    },
    {
      titre: "Vidange huile moteur + filtre",
      categorie: "Moteur",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
    {
      titre: "Huile de transmission finale",
      categorie: "Transmission",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "normal",
    },
    {
      titre: "Courroie de variateur (CVT)",
      categorie: "Transmission",
      intervalKm: 12000,
      priority: "important",
    },
    {
      titre: "Galets de variateur",
      categorie: "Transmission",
      intervalKm: 12000,
      priority: "normal",
    },
    {
      titre: "Bougie",
      categorie: "Moteur",
      intervalKm: 12000,
      priority: "normal",
    },
    COMMON_BRAKE_PADS,
    COMMON_BRAKE_FLUID,
    COMMON_COOLANT,
    COMMON_TIRES,
    {
      titre: "Révision principale",
      categorie: "Révision",
      intervalKm: 6000,
      intervalMonths: 12,
      priority: "important",
    },
  ],
};

export function getManufacturerTemplates(profile: string): MaintenanceTemplate[] | undefined {
  return VOGE_MAINTENANCE_PROFILES[profile];
}
