import { describe, it, expect } from "vitest";
import {
  getDealerCountdown,
  getDealerUrgency,
  formatCountdownDisplay,
  pad2,
} from "./dealer-countdown";

describe("dealer countdown", () => {
  const until = new Date("2026-12-31T12:00:00Z");

  it("calcule jours/heures/minutes/secondes", () => {
    const at = new Date("2026-12-30T12:00:00Z");
    const c = getDealerCountdown(until, at);
    expect(c.days).toBe(1);
    expect(c.hours).toBe(0);
    expect(c.expired).toBe(false);
  });

  it("formate l'affichage", () => {
    const c = getDealerCountdown(until, new Date("2026-12-31T11:59:30Z"));
    expect(formatCountdownDisplay(c)).toMatch(/00:00:30/);
  });

  it("urgence selon jours restants", () => {
    expect(getDealerUrgency(60)).toBe("normal");
    expect(getDealerUrgency(20)).toBe("warning");
    expect(getDealerUrgency(5)).toBe("urgent");
    expect(getDealerUrgency(1)).toBe("critical");
  });

  it("pad2", () => {
    expect(pad2(5)).toBe("05");
  });
});
