import { expect, test } from "vitest"
import {
  normalizeSearchBody,
  normalizeSearch,
  searchUrl,
  suspensionDeadline,
  OFF_FIELDS,
} from "./catalogue"
import { normalizeProduct, parseLossless } from "./off-normalization"
const now = Date.parse("2026-10-10T09:00:00Z")
const fixture = (patch = {}) => ({
  code: "123456789",
  product_name_fr: "Riz cru",
  brands: "Exemple",
  nutrition_data_per: "100g",
  last_indexed_datetime: "2026-10-01T00:00:00Z",
  nutriments: {
    proteins_100g: "0",
    carbohydrates_100g: "25.125",
    fat_100g: "1.0",
    "energy-kcal_100g": "112",
  },
  ...patch,
})
const normalize = (products: unknown[]) =>
  normalizeSearchBody(JSON.stringify({ hits: products }), now, "revision")
test("normalisation partagée : zéro, absence, dates distinctes et parité audit", () => {
  const product = fixture()
  const result = normalize([product])
  expect(result.kind).toBe("results")
  if (result.kind !== "results") throw Error("results")
  const audited = normalizeProduct(
    product,
    { query: "", basis: "unknown", state: "unknown" },
    {
      apiVersion: "Search-a-licious 0.1.0",
      sha256: "revision",
      capturedAt: new Date(now).toISOString(),
    }
  )
  expect(result.hits[0].snapshot).toEqual(audited.snapshot)
  expect(result.hits[0]).toMatchObject({
    indexedAt: "2026-10-01T00:00:00Z",
    snapshot: {
      state: "raw",
      capturedAt: now,
      nutrition: { protein: "0", fat: "1" },
    },
  })
  expect(normalize([fixture({ nutriments: {} })])).toMatchObject({
    hits: [{ snapshot: { nutrition: { protein: null, energy: null } } }],
  })
})
test.each([
  [{ nutrition_data_per: "serving" }, { basis: { kind: "ambiguous" } }],
  [{ product_name_fr: "Riz" }, { state: "unknown" }],
  [{ nutrition_data_per: "100ml" }, { basis: { kind: "known", unit: "ml" } }],
  [
    { nutrition_data_per: "100g", product_quantity_unit: "ml" },
    { basis: { kind: "ambiguous" } },
  ],
])("bases/état conservateurs %j", (patch, expected) => {
  expect(normalize([fixture(patch)])).toMatchObject({
    hits: [{ snapshot: expected }],
  })
})
test.each(["-1", "1e2", "0.1234567", "1000001", "NaN", "<2"])(
  "nombre invalide %s : absent, raison conservée",
  (amount) => {
    const result = normalize([
      fixture({ nutriments: { proteins_100g: amount } }),
    ])
    expect(result).toMatchObject({
      hits: [
        {
          snapshot: { nutrition: { protein: null } },
          reasons: expect.arrayContaining(["INVALID_DECIMAL"]),
        },
      ],
    })
  }
)
test.each([{ proteins_unit: "mg" }, { proteins_modifier: "<" }])(
  "unité/modificateur invalide %j",
  (patch) => {
    expect(
      normalize([fixture({ nutriments: { proteins_100g: "2", ...patch } })])
    ).toMatchObject({
      hits: [
        {
          snapshot: { nutrition: { protein: null } },
          reasons: expect.any(Array),
        },
      ],
    })
  }
)
test("obsolètes écartés ; index invalide inconnu ; JSON lossless conserve précision", () => {
  expect(
    normalize([fixture({ obsolete: true }), fixture({ obsolete: "1" })])
  ).toMatchObject({ hits: [] })
  expect(
    normalize([fixture({ last_indexed_datetime: "broken" })])
  ).toMatchObject({ hits: [{ indexedAt: null }] })
  expect(parseLossless('{"n":0.1234567890123456789}')).toEqual({
    n: "0.1234567890123456789",
  })
})
test.each([
  "{",
  '{"hits":null}',
  '{"hits":[null]}',
  '{"hits":[{}]}',
  '{"hits":[{"code":"../secret"}]}',
])("réponse invalide distincte %s", (body) => {
  expect(normalizeSearchBody(body, now, "revision")).toEqual({
    kind: "unavailable",
    reason: "MALFORMED_RESPONSE",
  })
})
test("liste vide distincte de timeout source", () => {
  expect(normalize([])).toEqual({ kind: "results", hits: [], capturedAt: now })
  expect(normalizeSearchBody('{"hits":[],"timed_out":true}', now, "r")).toEqual(
    { kind: "unavailable", reason: "SOURCE_ERROR" }
  )
})
test("projection CSV et requête minimale", () => {
  expect(normalizeSearch("  riz   cru ")).toBe("riz cru")
  const url = searchUrl("riz cru")
  expect([...url.searchParams.keys()]).toEqual([
    "q",
    "page_size",
    "langs",
    "fields",
  ])
  expect(url.searchParams.get("fields")).toBe(OFF_FIELDS)
  for (const invalid of ["", " ", "a".repeat(121), "riz\u0000"])
    expect(() => normalizeSearch(invalid)).toThrow()
  expect(() => searchUrl("riz", "https://evil.example/search")).toThrow()
})
test("Retry-After secondes/date et minimum de repli", () => {
  expect(suspensionDeadline("120", now)).toBe(now + 120000)
  expect(suspensionDeadline("Sat, 10 Oct 2026 09:03:00 GMT", now)).toBe(
    now + 180000
  )
  for (const value of [
    null,
    "bad",
    "-1",
    "1.5",
    "99999999999999999999999",
    "Fri, 09 Oct 2026 09:00:00 GMT",
  ])
    expect(suspensionDeadline(value, now)).toBe(now + 60000)
})
