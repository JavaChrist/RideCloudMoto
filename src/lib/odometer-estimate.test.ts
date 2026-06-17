import { describe, it, expect } from "vitest";
import { estimateCurrentKm, shouldRemindOdometer } from "./odometer-estimate";
import type { Vehicle } from "@/types/database";

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "v1",
    user_id: "u1",
    category: "motos",
    marque: "Voge",
    modele: "300R",
    annee: 2024,
    kilometrage: 10000,
    date_mise_en_circulation: null,
    date_achat: null,
    carburant: "essence",
    immatriculation: null,
    vin: null,
    surnom: null,
    photo_url: null,
    usage_profile: "often",
    avg_km_per_year: 6000,
    last_odometer_value: 10000,
    last_odometer_date: "2026-01-01",
    last_estimation_reminder_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("estimateCurrentKm", () => {
  it("extrapole le km à partir du dernier relevé et du km/an", () => {
    const vehicle = makeVehicle({
      last_odometer_value: 10000,
      last_odometer_date: "2026-01-01",
      avg_km_per_year: 6000,
    });
    const at = new Date("2026-07-01"); // ~6 mois
    const km = estimateCurrentKm(vehicle, at);
    expect(km).toBeGreaterThanOrEqual(12900);
    expect(km).toBeLessThanOrEqual(13100);
  });

  it("ne retourne jamais moins que le dernier relevé", () => {
    const vehicle = makeVehicle({ last_odometer_value: 10000 });
    const at = new Date("2025-01-01"); // date passée
    expect(estimateCurrentKm(vehicle, at)).toBe(10000);
  });
});

describe("shouldRemindOdometer", () => {
  it("rappelle au-delà du seuil de jours", () => {
    const vehicle = makeVehicle({ last_odometer_date: "2026-01-01" });
    expect(shouldRemindOdometer(vehicle, 90, new Date("2026-06-01"))).toBe(true);
  });

  it("ne rappelle pas si relevé récent", () => {
    const vehicle = makeVehicle({ last_odometer_date: "2026-05-15" });
    expect(shouldRemindOdometer(vehicle, 90, new Date("2026-06-01"))).toBe(false);
  });
});
