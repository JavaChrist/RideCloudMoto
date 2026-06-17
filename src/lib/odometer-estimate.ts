import type { Vehicle } from "@/types/database";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Estime le kilométrage courant entre deux saisies de l'odomètre,
 * en extrapolant à partir du dernier relevé et du km/an moyen.
 */
export function estimateCurrentKm(vehicle: Vehicle, at: Date = new Date()): number {
  const lastDate = new Date(vehicle.last_odometer_date);
  const lastValue = vehicle.last_odometer_value || vehicle.kilometrage || 0;

  if (Number.isNaN(lastDate.getTime())) return lastValue;

  const elapsedDays = Math.max(0, (at.getTime() - lastDate.getTime()) / MS_PER_DAY);
  const kmPerDay = (vehicle.avg_km_per_year || 6000) / 365;
  const estimated = lastValue + Math.round(elapsedDays * kmPerDay);

  return Math.max(estimated, lastValue);
}

/**
 * Indique si le relevé d'odomètre est ancien et mérite un rappel de mise à jour.
 */
export function shouldRemindOdometer(vehicle: Vehicle, thresholdDays = 90, at: Date = new Date()): boolean {
  const lastDate = new Date(vehicle.last_odometer_date);
  if (Number.isNaN(lastDate.getTime())) return false;
  const elapsedDays = (at.getTime() - lastDate.getTime()) / MS_PER_DAY;
  return elapsedDays >= thresholdDays;
}
