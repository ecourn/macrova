/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import { expect, test } from "vitest"
import type { FoodSnapshot } from "../src/domain/contracts"
import { fixture } from "../src/domain/food.fixtures"
import {
  calculatePortion,
  checkCalculability,
  validateFoodSnapshot,
} from "../src/domain/food"
import { api } from "./_generated/api"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")
test("query anonyme : parité, exactitude et transport sans BigInt", async () => {
  const t = convexTest(schema, modules)
  const cases: FoodSnapshot[] = [
    fixture(),
    { ...fixture(), version: 2 },
    { ...fixture(), capturedAt: -1 },
    { ...fixture(), provenance: { name: "", reference: "source" } },
    { ...fixture(), basis: { kind: "known", unit: "oz" } },
    {
      ...fixture(),
      basis: { kind: "ambiguous", sourceField: "source ambiguë" },
    },
  ]
  for (const value of [
    null,
    "0",
    "1.123456",
    "1.1234567",
    "1000000.000001",
    "-1",
    "1e2",
    "01",
  ])
    cases.push({
      ...fixture(),
      nutrition: { ...fixture().nutrition, energy: value },
    })
  for (const snapshot of cases) {
    const portion = { quantity: "1", unit: "ml", step: "0.000001" }
    const valid = validateFoodSnapshot(snapshot)
    const result = await t.query(api.nutrition.inspect, { snapshot, portion })
    expect(result).toEqual(
      valid.ok
        ? {
            ok: true,
            snapshot,
            calculability: checkCalculability(snapshot),
            totals: calculatePortion(snapshot, portion),
          }
        : valid
    )
    expect(() => JSON.stringify(result)).not.toThrow()
  }
  const snapshot = fixture()
  snapshot.density = { gramsPerMl: "3", reference: "mesure", capturedAt: 0 }
  snapshot.basis = { kind: "known", unit: "ml" }
  expect(
    await t.query(api.nutrition.inspect, {
      snapshot,
      portion: { quantity: "1", unit: "g" },
    })
  ).toMatchObject({
    totals: { value: { energy: { numerator: "1", denominator: "3" } } },
  })
  expect(await t.query(api.nutrition.inspect, { snapshot })).toMatchObject({
    totals: null,
  })
})
test("saisie française dans Convex", async () => {
  const t = convexTest(schema, modules)
  expect(
    await t.query(api.nutrition.normalizeInput, { input: " 12,50 " })
  ).toEqual({ ok: true, value: "12.5" })
  expect(
    await t.query(api.nutrition.normalizeInput, { input: "1,2.3" })
  ).toMatchObject({ error: { code: "INVALID_DECIMAL" } })
  expect(
    await t.query(api.nutrition.normalizeInput, { input: "0", positive: true })
  ).toMatchObject({ error: { code: "POSITIVE_REQUIRED" } })
})
