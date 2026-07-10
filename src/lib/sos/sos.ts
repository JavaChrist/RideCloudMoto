import type { SosKind } from "@/types/database";

/** Rayon d'entraide : au-delà, l'intervention est trop longue. */
export const SOS_RADIUS_KM = 30;

export const SOS_KIND_LABELS: Record<SosKind, string> = {
  panne: "En panne",
  chute: "Chute",
  perdu: "Perdu",
  autre: "Autre",
};

export const SOS_KIND_EMOJI: Record<SosKind, string> = {
  panne: "🛠️",
  chute: "🚑",
  perdu: "🧭",
  autre: "❗",
};

export function isSosKind(value: unknown): value is SosKind {
  return value === "panne" || value === "chute" || value === "perdu" || value === "autre";
}

/** Distance en km entre deux points GPS (formule de haversine). */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
