import type { VehicleCategory } from "@/types/database";

/**
 * Catalogue de la gamme Voge (motos + scooters).
 *
 * NB branding : la marque interne est "Voge" mais l'UI publique reste neutre
 * (RideCloudMoto). Les libellés constructeur ne sont pas affichés tant que
 * l'autorisation marque n'est pas accordée — voir `BRAND_PUBLIC_LABEL`.
 *
 * Les fiches techniques sont approximatives (données constructeur publiques)
 * et les notices pointent vers des liens externes maintenus par le réseau.
 */

export const BRAND_INTERNAL = "Voge";
/** Libellé affiché à l'utilisateur tant que la marque n'est pas autorisée. */
export const BRAND_PUBLIC_LABEL = "Constructeur";

export interface VehicleSpecs {
  cylindree?: string;
  puissance?: string;
  couple?: string;
  poids?: string;
  reservoir?: string;
  hauteurSelle?: string;
  transmission?: string;
  refroidissement?: string;
  freinAvant?: string;
  freinArriere?: string;
  pneuAvant?: string;
  pneuArriere?: string;
  capaciteHuile?: string;
  normeEuro?: string;
}

export interface CatalogModel {
  modele: string;
  category: VehicleCategory;
  /** Famille de plan d'entretien (clé vers maintenance-manufacturer-templates). */
  maintenanceProfile: string;
  annees: number[];
  specs: VehicleSpecs;
  /** Lien externe vers la notice / manuel constructeur (maintenu par le réseau). */
  noticeUrl?: string | null;
}

function years(from: number, to: number): number[] {
  const out: number[] = [];
  for (let y = from; y <= to; y++) out.push(y);
  return out;
}

export const VOGE_CATALOG: CatalogModel[] = [
  // ── MOTOS ──────────────────────────────────────────────────────────────────
  {
    modele: "300R",
    category: "motos",
    maintenanceProfile: "moto_mono_petite",
    annees: years(2020, 2026),
    specs: {
      cylindree: "292 cm³",
      puissance: "29 ch (21,5 kW)",
      couple: "25 Nm",
      poids: "162 kg",
      reservoir: "16 L",
      hauteurSelle: "795 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Disque 300 mm, ABS",
      freinArriere: "Disque 240 mm, ABS",
      pneuAvant: "110/70 R17",
      pneuArriere: "150/60 R17",
      capaciteHuile: "1,9 L",
      normeEuro: "Euro 5",
    },
    noticeUrl: null,
  },
  {
    modele: "300 AC",
    category: "motos",
    maintenanceProfile: "moto_mono_petite",
    annees: years(2021, 2026),
    specs: {
      cylindree: "292 cm³",
      puissance: "29 ch (21,5 kW)",
      couple: "25 Nm",
      poids: "175 kg",
      reservoir: "16 L",
      hauteurSelle: "775 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Disque 300 mm, ABS",
      freinArriere: "Disque 240 mm, ABS",
      pneuAvant: "100/90 R18",
      pneuArriere: "140/70 R17",
      capaciteHuile: "1,9 L",
      normeEuro: "Euro 5",
    },
    noticeUrl: null,
  },
  {
    modele: "300 DS",
    category: "motos",
    maintenanceProfile: "moto_mono_trail",
    annees: years(2021, 2026),
    specs: {
      cylindree: "292 cm³",
      puissance: "29 ch (21,5 kW)",
      couple: "25 Nm",
      poids: "178 kg",
      reservoir: "16 L",
      hauteurSelle: "820 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Disque 300 mm, ABS",
      freinArriere: "Disque 240 mm, ABS",
      pneuAvant: "110/80 R19",
      pneuArriere: "150/70 R17",
      capaciteHuile: "1,9 L",
      normeEuro: "Euro 5",
    },
    noticeUrl: null,
  },
  {
    modele: "500R",
    category: "motos",
    maintenanceProfile: "moto_bicylindre",
    annees: years(2020, 2026),
    specs: {
      cylindree: "471 cm³",
      puissance: "47 ch (35 kW)",
      couple: "43 Nm",
      poids: "196 kg",
      reservoir: "16 L",
      hauteurSelle: "795 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Double disque, ABS",
      freinArriere: "Disque, ABS",
      pneuAvant: "120/70 R17",
      pneuArriere: "160/60 R17",
      capaciteHuile: "2,4 L",
      normeEuro: "Euro 5",
    },
    noticeUrl: null,
  },
  {
    modele: "500 DS",
    category: "motos",
    maintenanceProfile: "moto_bicylindre",
    annees: years(2020, 2026),
    specs: {
      cylindree: "471 cm³",
      puissance: "47 ch (35 kW)",
      couple: "43 Nm",
      poids: "204 kg",
      reservoir: "16,5 L",
      hauteurSelle: "825 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Double disque, ABS",
      freinArriere: "Disque, ABS",
      pneuAvant: "110/80 R19",
      pneuArriere: "150/70 R17",
      capaciteHuile: "2,4 L",
      normeEuro: "Euro 5",
    },
    noticeUrl: null,
  },
  {
    modele: "525 DSX",
    category: "motos",
    maintenanceProfile: "moto_bicylindre",
    annees: years(2023, 2026),
    specs: {
      cylindree: "494 cm³",
      puissance: "47 ch (35 kW)",
      couple: "46,5 Nm",
      poids: "199 kg",
      reservoir: "16 L",
      hauteurSelle: "825 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Double disque 298 mm, ABS",
      freinArriere: "Disque 240 mm, ABS",
      pneuAvant: "110/80 R19",
      pneuArriere: "150/70 R17",
      capaciteHuile: "2,4 L",
      normeEuro: "Euro 5+",
    },
    noticeUrl: null,
  },
  {
    modele: "650 DSX",
    category: "motos",
    maintenanceProfile: "moto_bicylindre_grosse",
    annees: years(2023, 2026),
    specs: {
      cylindree: "652 cm³",
      puissance: "60 ch (44 kW)",
      couple: "61 Nm",
      poids: "214 kg",
      reservoir: "18 L",
      hauteurSelle: "840 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Double disque, ABS",
      freinArriere: "Disque, ABS",
      pneuAvant: "110/80 R19",
      pneuArriere: "150/70 R17",
      capaciteHuile: "2,6 L",
      normeEuro: "Euro 5+",
    },
    noticeUrl: null,
  },
  {
    modele: "900 DSX",
    category: "motos",
    maintenanceProfile: "moto_bicylindre_grosse",
    annees: years(2024, 2026),
    specs: {
      cylindree: "895 cm³",
      puissance: "95 ch (70 kW)",
      couple: "90 Nm",
      poids: "232 kg",
      reservoir: "19 L",
      hauteurSelle: "850 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Double disque, ABS",
      freinArriere: "Disque, ABS",
      pneuAvant: "90/90 R21",
      pneuArriere: "150/70 R18",
      capaciteHuile: "3,2 L",
      normeEuro: "Euro 5+",
    },
    noticeUrl: null,
  },
  {
    modele: "Brivido 500R",
    category: "motos",
    maintenanceProfile: "moto_bicylindre",
    annees: years(2021, 2026),
    specs: {
      cylindree: "471 cm³",
      puissance: "47 ch (35 kW)",
      couple: "43 Nm",
      poids: "195 kg",
      reservoir: "16 L",
      hauteurSelle: "800 mm",
      transmission: "Chaîne, 6 rapports",
      refroidissement: "Liquide",
      freinAvant: "Double disque, ABS",
      freinArriere: "Disque, ABS",
      pneuAvant: "120/70 R17",
      pneuArriere: "160/60 R17",
      capaciteHuile: "2,4 L",
      normeEuro: "Euro 5",
    },
    noticeUrl: null,
  },

  // ── SCOOTERS ─────────────────────────────────────────────────────────────────
  {
    modele: "SR1 125",
    category: "scooters",
    maintenanceProfile: "scooter_cvt_petit",
    annees: years(2022, 2026),
    specs: {
      cylindree: "125 cm³",
      puissance: "11 ch (8,3 kW)",
      couple: "10,8 Nm",
      poids: "126 kg",
      reservoir: "7 L",
      hauteurSelle: "780 mm",
      transmission: "Variateur CVT",
      refroidissement: "Liquide",
      freinAvant: "Disque, ABS",
      freinArriere: "Disque, CBS",
      pneuAvant: "110/70 R13",
      pneuArriere: "130/70 R13",
      capaciteHuile: "1,1 L",
      normeEuro: "Euro 5",
    },
    noticeUrl: null,
  },
  {
    modele: "SR4 Max 350",
    category: "scooters",
    maintenanceProfile: "scooter_cvt_gt",
    annees: years(2023, 2026),
    specs: {
      cylindree: "330 cm³",
      puissance: "29 ch (21,5 kW)",
      couple: "31 Nm",
      poids: "189 kg",
      reservoir: "13,5 L",
      hauteurSelle: "775 mm",
      transmission: "Variateur CVT",
      refroidissement: "Liquide",
      freinAvant: "Double disque, ABS",
      freinArriere: "Disque, ABS",
      pneuAvant: "120/70 R15",
      pneuArriere: "150/70 R14",
      capaciteHuile: "1,4 L",
      normeEuro: "Euro 5+",
    },
    noticeUrl: null,
  },
  {
    modele: "SR16 125",
    category: "scooters",
    maintenanceProfile: "scooter_cvt_petit",
    annees: years(2024, 2026),
    specs: {
      cylindree: "125 cm³",
      puissance: "11 ch (8,3 kW)",
      couple: "10,4 Nm",
      poids: "122 kg",
      reservoir: "6,5 L",
      hauteurSelle: "770 mm",
      transmission: "Variateur CVT",
      refroidissement: "Liquide",
      freinAvant: "Disque, ABS",
      freinArriere: "Disque, CBS",
      pneuAvant: "100/80 R16",
      pneuArriere: "120/80 R16",
      capaciteHuile: "1,0 L",
      normeEuro: "Euro 5+",
    },
    noticeUrl: null,
  },
];

export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  motos: "Motos",
  scooters: "Scooters",
};

export const CATEGORY_LABELS_SINGULAR: Record<VehicleCategory, string> = {
  motos: "Moto",
  scooters: "Scooter",
};

export function getModelsByCategory(category: VehicleCategory): CatalogModel[] {
  return VOGE_CATALOG.filter((m) => m.category === category);
}

export function findCatalogModel(
  category: VehicleCategory,
  modele: string
): CatalogModel | undefined {
  return VOGE_CATALOG.find(
    (m) => m.category === category && m.modele.toLowerCase() === modele.toLowerCase()
  );
}

export function getAvailableModelNames(category: VehicleCategory): string[] {
  return getModelsByCategory(category).map((m) => m.modele);
}
