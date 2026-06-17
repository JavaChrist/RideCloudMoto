import type { VehicleCategory } from "@/types/database";

export const CATEGORY_META: Record<
  VehicleCategory,
  { label: string; labelSingular: string; description: string; illustration: string }
> = {
  motos: {
    label: "Motos",
    labelSingular: "Moto",
    description: "Roadsters, trails et routières",
    illustration: "/illustrations/moto-default.png",
  },
  scooters: {
    label: "Scooters",
    labelSingular: "Scooter",
    description: "Urbains et GT à transmission CVT",
    illustration: "/illustrations/scooter-default.png",
  },
};

export const ALL_CATEGORIES: VehicleCategory[] = ["motos", "scooters"];

/** Illustration par défaut (rendu) à afficher quand un véhicule n'a pas de photo. */
export function defaultIllustration(category: VehicleCategory): string {
  return CATEGORY_META[category].illustration;
}
