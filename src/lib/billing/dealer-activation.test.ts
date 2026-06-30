import { describe, it, expect } from "vitest";
import {
  normalizeDealerCode,
  formatDealerCodeDisplay,
  isFrenchPlateDealerCode,
  isValidDealerActivationCode,
} from "./dealer-activation";

describe("dealer activation — code = immatriculation SIV", () => {
  it("normalise les tirets et espaces", () => {
    expect(normalizeDealerCode(" ab-123-cd ")).toBe("AB123CD");
    expect(normalizeDealerCode("AB 123 CD")).toBe("AB123CD");
  });

  it("valide une immatriculation SIV", () => {
    expect(isFrenchPlateDealerCode("AB-123-CD")).toBe(true);
    expect(isFrenchPlateDealerCode("ab123cd")).toBe(true);
    expect(isFrenchPlateDealerCode("AB-123-IO")).toBe(false); // I interdit
    expect(isFrenchPlateDealerCode("A1-123-CD")).toBe(false);
  });

  it("formate l'affichage avec tirets", () => {
    expect(formatDealerCodeDisplay("AB123CD")).toBe("AB-123-CD");
  });

  it("rejette les codes hors format plaque", () => {
    expect(isValidDealerActivationCode("AB-123-CD")).toBe(true);
    expect(isValidDealerActivationCode("AB12CD34")).toBe(false);
    expect(isValidDealerActivationCode("XX")).toBe(false);
  });
});
