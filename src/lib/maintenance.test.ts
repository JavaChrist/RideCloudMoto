import { describe, it, expect } from "vitest";
import { calculateNextMaintenanceDue, getMaintenanceStatus, compareMaintenanceByDue, MAINTENANCE_STATUS_SORT_ORDER } from "./maintenance";

describe("calculateNextMaintenanceDue", () => {
  it("repart du dernier entretien réalisé + intervalle km", () => {
    const res = calculateNextMaintenanceDue({
      intervalKm: 6000,
      lastDoneKm: 12000,
    });
    expect(res.nextDueKm).toBe(18000);
  });

  it("utilise la première échéance si aucun entretien réalisé", () => {
    const res = calculateNextMaintenanceDue({
      intervalKm: 6000,
      firstDueKm: 1000,
    });
    expect(res.nextDueKm).toBe(1000);
  });

  it("calcule la prochaine date avec intervalle en mois", () => {
    const res = calculateNextMaintenanceDue({
      intervalMonths: 12,
      lastDoneDate: "2025-01-15",
    });
    expect(res.nextDueDate).toBe("2026-01-15");
  });
});

describe("getMaintenanceStatus", () => {
  it("retourne overdue quand le km courant dépasse l'échéance", () => {
    expect(
      getMaintenanceStatus({ nextDueKm: 10000, currentKm: 10500 })
    ).toBe("overdue");
  });

  it("retourne due_soon proche du seuil km", () => {
    expect(
      getMaintenanceStatus({ nextDueKm: 10000, currentKm: 9600, dueSoonKmThreshold: 500 })
    ).toBe("due_soon");
  });

  it("retourne upcoming quand l'échéance est lointaine", () => {
    expect(
      getMaintenanceStatus({ nextDueKm: 10000, currentKm: 5000 })
    ).toBe("upcoming");
  });

  it("retourne overdue quand la date est dépassée", () => {
    expect(
      getMaintenanceStatus({ nextDueDate: "2020-01-01", currentKm: 0 })
    ).toBe("overdue");
  });
});

describe("compareMaintenanceByDue", () => {
  it("trie par km restant croissant", () => {
    const a = { next_due_km: 10_000, next_due_date: null };
    const b = { next_due_km: 5_000, next_due_date: null };
    expect(compareMaintenanceByDue(a, b, 1_000)).toBeGreaterThan(0);
    expect(compareMaintenanceByDue(b, a, 1_000)).toBeLessThan(0);
  });

  it("trie par date si pas de km", () => {
    const a = { next_due_km: null, next_due_date: "2027-06-01" };
    const b = { next_due_km: null, next_due_date: "2026-08-01" };
    expect(compareMaintenanceByDue(a, b, 0)).toBeGreaterThan(0);
  });
});
