import { describe, expect, test } from "vitest"
import type { FoodSnapshot } from "./contracts"
import {
  decimalRational,
  displayHundredth,
  divide,
  normalizeFrenchDecimal,
  parseDecimal,
  rational,
} from "./decimal"
import {
  calculatePortion,
  checkCalculability,
  validateFoodSnapshot,
} from "./food"

import { fixture } from "./food.fixtures"
describe("contrat numérique", () => {
  test.each([
    "-1",
    "1e2",
    "01",
    "1.0",
    "0.0000001",
    "1000000.000001",
    "1,2",
    " 1 ",
    "1.",
  ])("refuse %s sans correction", (value) => {
    expect(parseDecimal(value)).toMatchObject({
      ok: false,
      error: { code: "INVALID_DECIMAL", fields: ["value"] },
    })
  })
  test("frontières, précision et positivité", () => {
    expect(parseDecimal("1000000")).toEqual({ ok: true, value: 1000000000000n })
    expect(parseDecimal("0.000001")).toEqual({ ok: true, value: 1n })
    expect(parseDecimal("0", "step", true)).toMatchObject({
      error: { code: "POSITIVE_REQUIRED" },
    })
  })
  test("normalisation française explicite", () => {
    expect(normalizeFrenchDecimal(" 12,50 ")).toEqual({
      ok: true,
      value: "12.5",
    })
    expect(normalizeFrenchDecimal("1,2.3").ok).toBe(false)
    expect(normalizeFrenchDecimal("1,0000000").ok).toBe(false)
  })
  test("division exacte et arrondi demi supérieur", () => {
    expect(divide(rational(1n), rational(3n))).toEqual({
      numerator: 1n,
      denominator: 3n,
    })
    expect(displayHundredth(rational(1005n, 1000n))).toBe("1.01")
    expect(displayHundredth(rational(1004999n, 1000000n))).toBe("1.00")
    expect(decimalRational(0n)).toEqual({ numerator: 0n, denominator: 1n })
  })
})
describe("instantané et portion", () => {
  test("conserve source, version, valeurs et zéro explicite", () => {
    const snapshot = fixture()
    expect(validateFoodSnapshot(snapshot)).toEqual({
      ok: true,
      value: snapshot,
    })
    expect(checkCalculability(snapshot).ok).toBe(true)
    expect(
      calculatePortion(snapshot, { quantity: "33.333333", unit: "g" })
    ).toMatchObject({
      ok: true,
      value: {
        protein: { numerator: "0", denominator: "1", display: "0.00" },
        carbohydrate: {
          numerator: "6314299936857",
          denominator: "1562500000000",
          display: "4.04",
        },
      },
    })
  })
  test("absence multiple nommée et aucune énergie inférée", () => {
    const snapshot = fixture()
    snapshot.nutrition.protein = null
    snapshot.nutrition.energy = null
    expect(validateFoodSnapshot(snapshot).ok).toBe(true)
    expect(
      calculatePortion(snapshot, { quantity: "0", unit: "g" })
    ).toMatchObject({
      error: {
        code: "MISSING_NUTRITION",
        fields: ["nutrition.protein", "nutrition.energy"],
      },
    })
  })
  test("ambiguïté conservée mais bloquante", () => {
    const snapshot = fixture()
    snapshot.basis = { kind: "ambiguous", sourceField: "portion brute" }
    expect(validateFoodSnapshot(snapshot).ok).toBe(true)
    expect(checkCalculability(snapshot)).toMatchObject({
      error: { code: "AMBIGUOUS_BASIS" },
    })
  })
  test.each([
    [
      "version",
      (s: FoodSnapshot) => {
        s.version = 2
      },
      "UNSUPPORTED_VERSION",
    ],
    [
      "provenance.reference",
      (s: FoodSnapshot) => {
        s.provenance.reference = " "
      },
      "INVALID_METADATA",
    ],
    [
      "capturedAt",
      (s: FoodSnapshot) => {
        s.capturedAt = Number.MAX_SAFE_INTEGER + 1
      },
      "INVALID_METADATA",
    ],
    [
      "capturedAt",
      (s: FoodSnapshot) => {
        s.capturedAt = -1
      },
      "INVALID_METADATA",
    ],
    [
      "capturedAt",
      (s: FoodSnapshot) => {
        s.capturedAt = Number.NaN
      },
      "INVALID_METADATA",
    ],
    [
      "state",
      (s: FoodSnapshot) => {
        s.state = "fried"
      },
      "INVALID_METADATA",
    ],
    [
      "basis.unit",
      (s: FoodSnapshot) => {
        s.basis = { kind: "known", unit: "oz" }
      },
      "INVALID_METADATA",
    ],
    [
      "density.gramsPerMl",
      (s: FoodSnapshot) => {
        s.density = { gramsPerMl: "0", reference: "source", capturedAt: 0 }
      },
      "POSITIVE_REQUIRED",
    ],
  ])("métadonnée %s", (field, mutate, code) => {
    const snapshot = fixture()
    mutate(snapshot)
    expect(validateFoodSnapshot(snapshot)).toMatchObject({
      error: { code, fields: [field], retryable: false },
    })
  })
  test("conversion sourcée dans les deux sens, division non finie", () => {
    const snapshot = fixture()
    expect(
      calculatePortion(snapshot, { quantity: "1", unit: "ml" })
    ).toMatchObject({ error: { code: "MISSING_DENSITY" } })
    snapshot.density = { gramsPerMl: "3", reference: "mesure:1", capturedAt: 1 }
    expect(
      calculatePortion(snapshot, { quantity: "1", unit: "ml" })
    ).toMatchObject({ value: { energy: { numerator: "3", denominator: "1" } } })
    snapshot.basis = { kind: "known", unit: "ml" }
    expect(
      calculatePortion(snapshot, { quantity: "1", unit: "g" })
    ).toMatchObject({
      value: { energy: { numerator: "1", denominator: "3", display: "0.33" } },
    })
  })
  test("pas positif, quantité zéro autorisée", () => {
    expect(
      calculatePortion(fixture(), { quantity: "0", unit: "g" })
    ).toMatchObject({ value: { energy: { display: "0.00" } } })
    expect(
      calculatePortion(fixture(), { quantity: "1", unit: "g", step: "0" })
    ).toMatchObject({
      error: { code: "POSITIVE_REQUIRED", fields: ["portion.step"] },
    })
  })
  test.each(["revision", "sourceId", "name", "brand"] as const)(
    "refuse le champ %s vide sans perdre le champ d'erreur",
    (field) => {
      for (const value of ["", " \t "]) {
        const snapshot = fixture()
        snapshot[field] = value
        expect(validateFoodSnapshot(snapshot)).toEqual({
          ok: false,
          error: {
            code: "INVALID_METADATA",
            fields: [field],
            retryable: false,
          },
        })
      }
    }
  )
  test.each(["name", "reference"] as const)(
    "refuse provenance.%s vide",
    (field) => {
      const snapshot = fixture()
      snapshot.provenance[field] = " "
      expect(validateFoodSnapshot(snapshot)).toMatchObject({
        ok: false,
        error: { code: "INVALID_METADATA", fields: [`provenance.${field}`] },
      })
    }
  )
  test("refuse une ambiguïté sans champ source", () => {
    const snapshot = fixture()
    snapshot.basis = { kind: "ambiguous", sourceField: " " }
    expect(validateFoodSnapshot(snapshot)).toMatchObject({
      ok: false,
      error: { code: "INVALID_METADATA", fields: ["basis.sourceField"] },
    })
  })
  test.each([
    ["density.reference", " ", 0],
    ["density.capturedAt", "mesure", -1],
    ["density.capturedAt", "mesure", 0.5],
    ["density.capturedAt", "mesure", Number.NaN],
    ["density.capturedAt", "mesure", Number.MAX_SAFE_INTEGER + 1],
  ] as const)(
    "bloque la conversion avec %s invalide",
    (field, reference, capturedAt) => {
      const snapshot = fixture()
      snapshot.density = { gramsPerMl: "3", reference, capturedAt }
      const expected = {
        ok: false,
        error: { code: "INVALID_METADATA", fields: [field], retryable: false },
      }
      expect(validateFoodSnapshot(snapshot)).toEqual(expected)
      expect(calculatePortion(snapshot, { quantity: "1", unit: "ml" })).toEqual(
        expected
      )
    }
  )
  test("conserve les grands totaux exacts avec une densité minimale", () => {
    const snapshot = fixture()
    snapshot.basis = { kind: "known", unit: "ml" }
    snapshot.density = {
      gramsPerMl: "0.000001",
      reference: "mesure",
      capturedAt: 0,
    }
    snapshot.nutrition = {
      protein: "1000000",
      carbohydrate: "0",
      fat: "0",
      energy: "1000000",
    }
    // 10^6 g / 10^-6 g/ml * 10^6 nutriments / 100 ml = 10^16.
    expect(
      calculatePortion(snapshot, { quantity: "1000000", unit: "g" })
    ).toEqual({
      ok: true,
      value: {
        protein: {
          numerator: "10000000000000000",
          denominator: "1",
          display: "10000000000000000.00",
        },
        carbohydrate: { numerator: "0", denominator: "1", display: "0.00" },
        fat: { numerator: "0", denominator: "1", display: "0.00" },
        energy: {
          numerator: "10000000000000000",
          denominator: "1",
          display: "10000000000000000.00",
        },
      },
    })
  })
})
