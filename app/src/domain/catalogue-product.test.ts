import { readFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { expect, test } from "vitest"
import {
  normalizeProductBody,
  productUrl,
  OFF_PRODUCT_FIELDS,
} from "./catalogue"
import { calculatePortion, validateFoodSnapshot } from "./food"
const now = Date.parse("2026-10-10T09:00:00Z")
const code = "123456789"
// Négatifs synthétiques, séparés des captures réelles immuables.
const nutrient = (value: unknown, patch = {}) => ({
  value,
  unit: "g",
  source: "packaging",
  source_per: "100g",
  ...patch,
})
const fixture = (aggregatePatch = {}, productPatch = {}) => ({
  code,
  status: "success",
  result: { id: "product_found" },
  errors: [],
  product: {
    code,
    product_name_fr: "Riz cru",
    nutrition: {
      aggregated_set: {
        per: "100g",
        preparation: "as_sold",
        nutrients: {
          proteins: nutrient("0"),
          carbohydrates: nutrient("2"),
          fat: nutrient("1"),
          "energy-kcal": nutrient("17", { unit: "kcal" }),
        },
        ...aggregatePatch,
      },
    },
    ...productPatch,
  },
})
const normalize = (data = fixture()) =>
  normalizeProductBody(JSON.stringify(data), code, now, "synthetic")
test.each([
  [
    "0745760279005",
    "ready",
    { protein: "13.8", carbohydrate: "1.78", fat: "5.32", energy: "99.8" },
  ],
  ["3350033027046", "blocked", { carbohydrate: null }],
  ["3270190024309", "blocked", { protein: "3.5" }],
])(
  "capture réelle immuable %s : snapshot validé et champs publics bornés",
  async (sourceCode, status, nutrition) => {
    const root = new URL(
      "../../../_bmad-output/initiative-macrova/epic-catalogue/audit-off-v1/products/",
      import.meta.url
    )
    const body = await readFile(
      new URL(`${sourceCode}.body.json`, root),
      "utf8"
    )
    const cap = JSON.parse(
      await readFile(new URL(`${sourceCode}.json`, root), "utf8")
    )
    expect(createHash("sha256").update(body).digest("hex")).toBe(cap.sha256)
    const result = normalizeProductBody(
      body,
      sourceCode,
      Date.parse(cap.capturedAt),
      cap.sha256
    )
    expect(result).toMatchObject({
      kind: "product",
      detail: {
        status,
        snapshot: {
          nutrition,
          capturedAt: Date.parse(cap.capturedAt),
          revision: cap.sha256,
        },
        sourceFields: { aggregatePer: "100g", preparation: "as_sold" },
      },
    })
    if (result.kind !== "product") throw Error("product")
    expect(validateFoodSnapshot(result.detail.snapshot).ok).toBe(true)
    expect(JSON.stringify(result.detail.sourceFields)).not.toMatch(
      /creator|correctors|images|value_computed/
    )
    if (sourceCode === "3350033027046")
      expect(result.detail.sourceFields.nutrients.carbohydrates.value).toBe(
        "9.3999996185303"
      )
    if (sourceCode === "3270190024309")
      expect(result.detail.reasons).toContain("SOURCE_OBSOLETE")
  }
)
test("zéro distinct des absences ; aucun fallback legacy ni kcal inférée", () => {
  expect(normalize()).toMatchObject({
    detail: {
      status: "ready",
      snapshot: { state: "raw", nutrition: { protein: "0" } },
    },
  })
  expect(normalize(fixture({ nutrients: {} }))).toMatchObject({
    detail: {
      status: "blocked",
      snapshot: {
        nutrition: {
          protein: null,
          carbohydrate: null,
          fat: null,
          energy: null,
        },
      },
    },
  })
  expect(
    normalize(
      fixture(
        {},
        {
          nutrition: {},
          nutrition_data_per: "100g",
          nutriments: { proteins_100g: "12", "energy-kcal_100g": "20" },
        }
      )
    )
  ).toMatchObject({
    detail: {
      status: "blocked",
      reasons: expect.arrayContaining(["MISSING_AGGREGATE"]),
      snapshot: {
        basis: { kind: "ambiguous" },
        nutrition: { protein: null, energy: null },
      },
    },
  })
})
test.each(["-1", "1e2", "0.1234567", "1000001", "NaN", "<2"])(
  "%s rejetée sans arrondi avec champ ciblé",
  (value) => {
    expect(
      normalize(fixture({ nutrients: { proteins: nutrient(value) } }))
    ).toMatchObject({
      detail: {
        status: "blocked",
        snapshot: { nutrition: { protein: null } },
        reasons: expect.arrayContaining(["INVALID_DECIMAL:proteins"]),
        sourceFields: { nutrients: { proteins: { value } } },
      },
    })
  }
)
test.each([
  [{ source: "computed" }, "UNSUPPORTED_NUTRIENT_SOURCE:proteins"],
  [{ source: "estimate" }, "UNSUPPORTED_NUTRIENT_SOURCE:proteins"],
  [{ source_per: "serving" }, "INCOMPATIBLE_SOURCE_PER:proteins"],
  [{ unit: "mg" }, "UNSUPPORTED_NUTRIENT_UNIT:proteins"],
  [{ modifier: "<" }, "UNSUPPORTED_NUTRIENT_MODIFIER:proteins"],
])("origine/base/unité/modificateur refusés %j", (patch, reason) => {
  expect(
    normalize(fixture({ nutrients: { proteins: nutrient("2", patch) } }))
  ).toMatchObject({
    detail: {
      status: "blocked",
      snapshot: { nutrition: { protein: null } },
      reasons: expect.arrayContaining([reason]),
    },
  })
})
test.each(["prepared", null, undefined])(
  "préparation %s explicitement bloquée",
  (preparation) => {
    expect(normalize(fixture({ preparation }))).toMatchObject({
      detail: {
        status: "blocked",
        reasons: expect.arrayContaining(["UNSUPPORTED_PREPARATION"]),
        snapshot: { nutrition: { protein: null } },
      },
    })
  }
)
test("bases/états prouvés, pas de conversion sans densité, précédent inchangé", () => {
  const initial = normalize(),
    before = structuredClone(initial)
  for (const [name, state] of [
    ["Riz", "unknown"],
    ["Riz cru", "raw"],
    ["Riz cuit", "cooked"],
  ])
    expect(normalize(fixture({}, { product_name_fr: name }))).toMatchObject({
      detail: { snapshot: { state } },
    })
  const result = normalize(
    fixture({
      per: "100ml",
      nutrients: Object.fromEntries(
        ["proteins", "carbohydrates", "fat", "energy-kcal"].map((key) => [
          key,
          nutrient("0", {
            unit: key === "energy-kcal" ? "kcal" : "g",
            source_per: "100ml",
          }),
        ])
      ),
    })
  )
  if (result.kind !== "product") throw Error("product")
  expect(result.detail.snapshot.basis).toEqual({ kind: "known", unit: "ml" })
  expect(
    calculatePortion(result.detail.snapshot, { quantity: "100", unit: "g" })
  ).toMatchObject({ error: { code: "MISSING_DENSITY" } })
  expect(normalize(fixture({ per: "serving" }))).toMatchObject({
    detail: { status: "blocked", snapshot: { basis: { kind: "ambiguous" } } },
  })
  expect(initial).toEqual(before)
})
test("absence, erreur source et réponse invalide distinguées", () => {
  expect(
    normalizeProductBody(
      JSON.stringify({ code, errors: [], result: { id: "product_not_found" } }),
      code,
      now,
      "r"
    )
  ).toEqual({ kind: "missing" })
  expect(
    normalizeProductBody(
      JSON.stringify({ code, errors: [{ id: "bad" }] }),
      code,
      now,
      "r"
    )
  ).toEqual({ kind: "unavailable", reason: "SOURCE_ERROR" })
  for (const body of [
    "{",
    "null",
    JSON.stringify(fixture({}, { code: "987654321" })),
    JSON.stringify({ ...fixture(), code: "987654321" }),
    JSON.stringify(fixture({}, { product_name_fr: "" })),
  ])
    expect(normalizeProductBody(body, code, now, "r")).toEqual({
      kind: "unavailable",
      reason: "MALFORMED_RESPONSE",
    })
})
test("URL v3.6 minimale et endpoint borné", () => {
  const url = productUrl(code, "https://world.openfoodfacts.net")
  expect(url.pathname).toBe(`/api/v3.6/product/${code}.json`)
  expect([...url.searchParams.keys()]).toEqual(["fields"])
  expect(url.searchParams.get("fields")).toBe(OFF_PRODUCT_FIELDS)
  expect(() =>
    productUrl("../private", "https://world.openfoodfacts.net")
  ).toThrow()
  expect(() => productUrl(code, "https://evil.example")).toThrow()
})
