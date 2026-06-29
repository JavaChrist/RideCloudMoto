import { describe, it, expect } from "vitest";
import {
  normalizeDealerCode,
  formatDealerCodeDisplay,
  isFrenchPlateDealerCode,
  isValidDealerActivationCode,
  generateDealerActivationCode,
  PLATE_CODE_REGEX,
} from "./dealer-activation";

describe("dealer activation — format plaque SIV", () => {
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

  it("génère un code au format plaque", () => {
    const code = generateDealerActivationCode();
    expect(code).toHaveLength(7);
    expect(PLATE_CODE_REGEX.test(code)).toBe(true);
  });

  it("accepte les anciens codes alphanumériques", () => {
    expect(isValidDealerActivationCode("AB12CD34")).toBe(true);
    expect(isValidDealerActivationCode("AB-123-CD")).toBe(true);
    expect(isValidDealerActivationCode("XX")).toBe(false);
  });
});
