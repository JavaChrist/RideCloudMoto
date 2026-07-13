import { z } from "zod";

const currentYear = new Date().getFullYear();

export const vehicleFormSchema = z.object({
  category: z.enum(["motos", "scooters", "quads"], { message: "Catégorie invalide" }),
  marque: z.string().min(1, "Marque requise").max(60),
  modele: z.string().min(1, "Modèle requis"),
  annee: z
    .number({ error: "Année invalide" })
    .int()
    .min(1950, "Année trop ancienne")
    .max(currentYear + 1, "Année invalide"),
  kilometrage: z
    .number({ error: "Kilométrage invalide" })
    .int()
    .min(0, "Kilométrage invalide")
    .max(500000, "Kilométrage invalide"),
  date_mise_en_circulation: z.string().optional().nullable(),
  date_achat: z.string().optional().nullable(),
  carburant: z.string().optional().nullable(),
  immatriculation: z.string().max(15).optional().nullable(),
  vin: z.string().max(17).optional().nullable(),
  surnom: z.string().max(40).optional().nullable(),
  usage_profile: z.enum(["daily", "often", "occasional", "rare"]).default("often"),
});

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;

export const updateKilometrageSchema = z.object({
  kilometrage: z
    .number({ error: "Kilométrage invalide" })
    .int()
    .min(0, "Kilométrage invalide")
    .max(500000, "Kilométrage invalide"),
});

export const maintenanceEntrySchema = z.object({
  titre: z.string().min(1, "Titre requis").max(120),
  date_entretien: z.string().min(1, "Date requise"),
  kilometrage: z.number().int().min(0).max(500000),
  cout: z.number().min(0).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
});

export const modificationSchema = z.object({
  titre: z.string().min(1, "Titre requis").max(120),
  marque: z.string().max(60).optional().nullable(),
  modele: z.string().max(60).optional().nullable(),
  date_pose: z.string().optional().nullable(),
  cout: z.number().min(0).optional().nullable(),
});

export type MaintenanceEntryInput = z.infer<typeof maintenanceEntrySchema>;
export type ModificationInput = z.infer<typeof modificationSchema>;
