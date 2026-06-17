export interface FuelOption {
  value: string;
  label: string;
}

export const FUEL_OPTIONS: FuelOption[] = [
  { value: "essence", label: "Essence (SP95 / SP98)" },
  { value: "essence_e10", label: "Essence SP95-E10" },
  { value: "electrique", label: "Électrique" },
  { value: "hybride", label: "Hybride" },
];

export function fuelLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return FUEL_OPTIONS.find((f) => f.value === value)?.label ?? value;
}
