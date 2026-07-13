import type { VehicleCategory } from "@/types/database";

export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  motos: "Motos",
  scooters: "Scooters",
  quads: "Quads",
};

export const CATEGORY_LABELS_SINGULAR: Record<VehicleCategory, string> = {
  motos: "Moto",
  scooters: "Scooter",
  quads: "Quad",
};
