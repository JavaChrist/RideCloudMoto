import type { MaintenanceEntry, Modification, Vehicle } from "@/types/database";

export interface VehicleCosts {
  totalMaintenance: number;
  totalModifications: number;
  total: number;
  perMonth: number;
  perYear: number;
  perKm: number;
  monthsOwned: number;
}

function monthsOwned(vehicle: Vehicle): number {
  const start = vehicle.date_achat
    ? new Date(vehicle.date_achat)
    : new Date(vehicle.created_at);
  if (Number.isNaN(start.getTime())) return 1;
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(1, months);
}

export function computeVehicleCosts(
  vehicle: Vehicle,
  entries: MaintenanceEntry[],
  modifications: Modification[]
): VehicleCosts {
  const totalMaintenance = entries.reduce((sum, e) => sum + (e.cout ?? 0), 0);
  const totalModifications = modifications.reduce((sum, m) => sum + (m.cout ?? 0), 0);
  const total = totalMaintenance + totalModifications;

  const months = monthsOwned(vehicle);
  const perMonth = total / months;
  const perYear = perMonth * 12;
  const perKm = vehicle.kilometrage > 0 ? total / vehicle.kilometrage : 0;

  return {
    totalMaintenance,
    totalModifications,
    total,
    perMonth,
    perYear,
    perKm,
    monthsOwned: months,
  };
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
