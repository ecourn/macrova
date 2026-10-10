import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import { describe, expect, it, vi } from "vitest"
import { referenceProducts, replayProducts } from "./audit-off-products"
import { mealTotals, type ReferenceMeal } from "./audit-off-meals"
import { calculatePortion } from "../src/domain/food"
import {
  buildUrl,
  capture,
  classify,
  freshness,
  hash,
  normalizeProduct,
  parseLossless,
  replay,
  ROOT,
  sourceDecimal,
  validateManifest,
  VERSION,
  type AuditCase,
  type Capture,
} from "./audit-off"
// Synthétique : aucune valeur ici n’est une observation alimentaire.
const c: AuditCase = {
  id: "OFF-01",
  query: "avoine",
  categories: ["brut"],
  brand: null,
  state: "unknown",
  basis: "g",
  justification: "fixture synthétique",
  source: "test",
  expected: "fixture",
}
const body = JSON.stringify({
  products: [
    {
      code: "synthetic",
      product_name: "avoine",
      nutrition_data_per: "100g",
      nutriments: {
        proteins_100g: 0,
        carbohydrates_100g: 12,
        fat_100g: 3,
        "energy-kcal_100g": 100,
      },
    },
  ],
})
const cap = (b = body, extra: Partial<Capture> = {}): Capture => ({
  version: VERSION,
  revision: "test",
  id: c.id,
  query: c.query,
  url: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(c.query)}`,
  capturedAt: "2026-10-10T08:00:00.000Z",
  status: 200,
  reason: null,
  retryAfter: null,
  sha256: hash(b),
  bodyFile: "OFF-01.body.json",
  userAgent: VERSION,
  ...extra,
})
const product = (overrides: Record<string, unknown> = {}) => ({
  code: "synthetic",
  product_name: "avoine",
  nutrition_data_per: "100g",
  nutriments: {
    proteins_100g: "0",
    carbohydrates_100g: "12",
    fat_100g: "3",
    "energy-kcal_100g": "100",
  },
  ...overrides,
})
describe("normaliseur OFF, fixtures synthétiques séparées", () => {
  it("préserve zéro, provenance et contrat v1", () => {
    const p = classify(c, cap(), body).products[0]
    expect(p.snapshot.nutrition.protein).toBe("0")
    expect(p.status).toBe("utilisable")
    expect(p.snapshot.version).toBe(1)
    expect(
      calculatePortion(p.snapshot, { quantity: "100", unit: "g" }).ok
    ).toBe(true)
  })
  it("distingue absence de zéro et ne déduit pas kcal", () => {
    const p = normalizeProduct(
      product({ nutriments: { proteins_100g: "0" } }),
      c,
      cap()
    )
    expect(p.snapshot.nutrition.energy).toBeNull()
    expect(p.reasons).toContain("MISSING_NUTRITION")
  })
  it.each(["0.1234567", "1e2", "1000000.000001", "-1"])(
    "rejette sans arrondi %s",
    (v) => {
      const p = normalizeProduct(
        product({
          nutriments: {
            proteins_100g: v,
            carbohydrates_100g: "1",
            fat_100g: "0",
            "energy-kcal_100g": "1",
          },
        }),
        c,
        cap()
      )
      expect(p.reasons).toContain("INVALID_DECIMAL")
    }
  )
  it("accepte plafond exact et six décimales", () => {
    expect(sourceDecimal("1000000")).toBe("1000000")
    expect(sourceDecimal("0.123456")).toBe("0.123456")
    expect(
      normalizeProduct(
        product({
          nutriments: {
            proteins_100g: "1000000",
            carbohydrates_100g: "0.123456",
            fat_100g: "0",
            "energy-kcal_100g": "1",
          },
        }),
        c,
        cap()
      ).status
    ).toBe("utilisable")
  })
  it("préserve les lexèmes numériques et les chaînes JSON", () => {
    expect(
      parseLossless(
        '{"x":0.123456789123456789,"y":1e2,"s":"3.000","a":"escaped \\\"4\\\""}'
      )
    ).toEqual({
      x: "0.123456789123456789",
      y: "1e2",
      s: "3.000",
      a: 'escaped "4"',
    })
  })
  it("normalise des zéros finaux sans arrondir une précision excessive", () => {
    expect(sourceDecimal("01.2300")).toBe("1.23")
    expect(sourceDecimal("1.0000000")).toBe("1.0000000")
  })
  it("bloque base ambiguë et ne déduit pas ml du conditionnement", () => {
    expect(
      normalizeProduct(product({ nutrition_data_per: "serving" }), c, cap())
        .reasons
    ).toContain("AMBIGUOUS_BASIS")
    expect(
      normalizeProduct(product({ product_quantity_unit: "ml" }), c, cap())
        .reasons
    ).toContain("AMBIGUOUS_BASIS")
  })
  it("accepte base 100ml explicite, bloque conversion sans densité", () => {
    const p = normalizeProduct(
      product({ nutrition_data_per: "100ml" }),
      { ...c, basis: "ml" },
      cap()
    )
    expect(p.status).toBe("utilisable")
    expect(
      calculatePortion(p.snapshot, { quantity: "100", unit: "g" })
    ).toMatchObject({ ok: false, error: { code: "MISSING_DENSITY" } })
  })
  it("la requête ne prouve jamais cru/cuit ; états distincts", () => {
    expect(
      normalizeProduct(product(), { ...c, state: "raw" }, cap()).reasons
    ).toContain("STATE_UNPROVEN")
    expect(
      normalizeProduct(
        product({ product_name: "avoine cuite" }),
        { ...c, state: "raw" },
        cap()
      ).reasons
    ).toContain("STATE_MISMATCH")
    expect(
      normalizeProduct(
        product({ product_name: "avoine crue" }),
        { ...c, state: "raw" },
        cap()
      ).snapshot.state
    ).toBe("raw")
  })
  it("refuse un résultat hors sujet", () => {
    expect(
      normalizeProduct(product({ product_name: "chocolat" }), c, cap()).reasons
    ).toContain("IRRELEVANT_RESULT")
  })
  it("une liste vide est distincte de panne et capture ancienne", () => {
    const b = '{"products":[]}'
    expect(classify(c, cap(b), b)).toMatchObject({
      status: "non pris en charge",
      reasons: ["NO_RESULTS"],
    })
    expect(freshness(cap().capturedAt, "2026-10-12T08:00:00Z", 86400000)).toBe(
      "ancien"
    )
  })
  it.each([429, 503, 500])("conserve HTTP %s", (status) =>
    expect(classify(c, cap(body, { status }), body)).toMatchObject({
      status: "indisponible",
      reasons: [`HTTP_${status}`],
    })
  )
  it("conserve un timeout", () =>
    expect(
      classify(c, cap("", { status: null, reason: "TimeoutError" }), "").reasons
    ).toEqual(["TimeoutError"]))
  it.each(["{", '{"error":1}', '{"products":null}'])(
    "conserve réponse malformée %s",
    (b) =>
      expect(classify(c, cap(b), b).reasons).toEqual(["MALFORMED_RESPONSE"])
  )
  it("une altération de capture échoue explicitement", () =>
    expect(() => classify(c, cap(), body + " ")).toThrow("INTEGRITY"))
})
describe("corpus versionné hors réseau", () => {
  it("valide les 50 recherches et refuse doublons/categories absentes", async () => {
    const m = JSON.parse(await readFile(resolve(ROOT, "manifest.json"), "utf8"))
    expect(validateManifest(m)).toHaveLength(50)
    expect(() =>
      validateManifest({ version: 1, cases: m.cases.slice(1) })
    ).toThrow()
    const duplicate = structuredClone(m)
    duplicate.cases[1].query = duplicate.cases[0].query
    expect(() => validateManifest(duplicate)).toThrow()
    const missing = structuredClone(m)
    for (const x of missing.cases) x.categories = ["brut"]
    expect(() => validateManifest(missing)).toThrow()
  })
  it("rejoue deux fois sans réseau avec identité des classifications", async () => {
    const network = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw Error("NETWORK_FORBIDDEN")
    })
    try {
      const first = await replay()
      expect(await replay()).toEqual(first)
      expect(first).toEqual(
        JSON.parse(await readFile(resolve(ROOT, "classification.json"), "utf8"))
      )
      expect(network).not.toHaveBeenCalled()
    } finally {
      network.mockRestore()
    }
  })
})

// Ces repas sont références techniques sourcées, sans solveur ni conseil alimentaire.
it("vérifie les repas, leur provenance et leurs totaux exacts hors réseau", async () => {
  const references = await referenceProducts()
  const meals: { meals: ReferenceMeal[] } = JSON.parse(
    await readFile(resolve(ROOT, "repas-reference.json"), "utf8")
  )
  expect(meals.meals.length).toBeGreaterThan(0)
  for (const meal of meals.meals) {
    const lookup = (line: ReferenceMeal["lines"][number]) => {
      const source = references.find(
        (x) => x.caseId === line.caseId && x.product.code === line.code
      )?.product
      if (!source || source.status !== "utilisable")
        throw Error("REFERENCE_NOT_USABLE")
      return source.snapshot
    }
    expect(mealTotals(meal.lines, lookup)).toEqual(meal.totals)
    const wrong = structuredClone(meal.lines)
    wrong[0].quantity = "1000000.000001"
    expect(() => mealTotals(wrong, lookup)).toThrow("INVALID_CONSTRAINT")
    const altered = structuredClone(meal.lines)
    altered[0].sha256 = "altered"
    expect(() => mealTotals(altered, lookup)).toThrow("MEAL_SOURCE")
  }
})

it("n’assimile pas cru de saumon au riz ni grand cru à cru", () => {
  for (const name of [
    "Poke Bowl saumon cru sur lit de riz",
    "Chocolat grand cru riz soufflé",
  ]) {
    expect(
      normalizeProduct(
        product({ product_name: name }),
        { ...c, query: "riz cru", state: "raw" },
        cap()
      ).snapshot.state
    ).toBe("unknown")
  }
})

it("traite le schéma Search-a-licious, marque tableau et base absente", () => {
  const b = JSON.stringify({
    hits: [
      product({
        brands: ["Marque OFF"],
        nutrition_data_per: undefined,
        last_indexed_datetime: "2024-10-21T08:32:53",
      }),
    ],
  })
  const p = classify(
    c,
    cap(b, {
      apiVersion: "Search-a-licious 0.1.0",
      url: `https://search.openfoodfacts.org/search?q=${encodeURIComponent(c.query)}`,
    }),
    b
  ).products[0]
  expect(p.snapshot.brand).toBe("Marque OFF")
  expect(p.reasons).toContain("AMBIGUOUS_BASIS")
  expect(p.sourceFields.lastIndexed).toBe("2024-10-21T08:32:53")
})
it("rejette produit obsolète et unités/modificateurs non pris en charge", () => {
  expect(
    normalizeProduct(product({ obsolete: true }), c, cap()).reasons
  ).toContain("SOURCE_OBSOLETE")
  const p = normalizeProduct(
    product({
      nutriments: {
        proteins_100g: "1",
        proteins_unit: "oz",
        fat_100g: "1",
        fat_modifier: "<",
        carbohydrates_100g: "1",
        "energy-kcal_100g": "1",
      },
    }),
    c,
    cap()
  )
  expect(p.reasons).toContain("UNSUPPORTED_NUTRIENT_UNIT:proteins")
  expect(p.reasons).toContain("UNSUPPORTED_NUTRIENT_MODIFIER:fat")
})
it("suspend la capture, conserve erreur et Retry-After, sans retry ni écrasement", async () => {
  const temp = await mkdtemp(resolve(tmpdir(), "macrova-audit-"))
  await writeFile(
    resolve(temp, "manifest.json"),
    await readFile(resolve(ROOT, "manifest.json"))
  )
  const net = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("OFF unavailable", {
      status: 503,
      headers: { "Retry-After": "120" },
    })
  )
  try {
    await expect(capture(temp)).rejects.toThrow("SUSPENDED")
    expect(net).toHaveBeenCalledTimes(1)
    const lock = JSON.parse(
      await readFile(resolve(temp, "suspension.json"), "utf8")
    )
    expect(lock.retryAfter).toBe("120")
    const saved = await readFile(
      resolve(temp, "captures/OFF-01.body.json"),
      "utf8"
    )
    expect(saved).toBe("OFF unavailable")
    await expect(capture(temp)).rejects.toThrow("SUSPENDED")
    expect(net).toHaveBeenCalledTimes(1)
    expect(
      await readFile(resolve(temp, "captures/OFF-01.body.json"), "utf8")
    ).toBe(saved)
  } finally {
    net.mockRestore()
    await rm(temp, { recursive: true, force: true })
  }
})

it("toutes les 50 observations ont une trace réelle et une altération réelle échoue", async () => {
  const m = JSON.parse(await readFile(resolve(ROOT, "manifest.json"), "utf8"))
  const corpus = await replay()
  expect(corpus.cases).toHaveLength(50)
  expect(corpus.cases.every((observation) => observation.trace !== null)).toBe(
    true
  )
  const real = JSON.parse(
    await readFile(resolve(ROOT, "captures/OFF-01.json"), "utf8")
  )
  const response = await readFile(
    resolve(ROOT, "captures/OFF-01.body.json"),
    "utf8"
  )
  expect(() => classify(m.cases[0], real, response + " ")).toThrow("INTEGRITY")
  expect(() =>
    classify(
      m.cases[0],
      { ...real, url: "https://example.invalid/search" },
      response
    )
  ).toThrow("INTEGRITY")
})

it("construit la projection Search-a-licious en CSV et une requête exacte", () => {
  const endpoint = buildUrl({ ...c, query: "pois chiches" }, true)
  expect(endpoint.hostname).toBe("search.openfoodfacts.org")
  expect(endpoint.pathname).toBe("/search")
  expect(endpoint.searchParams.get("q")).toBe("pois chiches")
  expect(endpoint.searchParams.getAll("fields")).toHaveLength(1)
  expect(endpoint.searchParams.get("fields")).toContain("code,product_name")
  expect(endpoint.searchParams.get("fields")).toContain("nutrition_data_per")
  expect(endpoint.searchParams.get("page_size")).toBe("3")
  const legacy = buildUrl(c)
  expect(legacy.searchParams.get("search_terms")).toBe(c.query)
  expect(legacy.searchParams.get("page_size")).toBe("3")
})
it("bloque erreur source HTTP200 et capture ancienne sans confondre résultat vide", () => {
  const b = '{"hits":[],"timed_out":true}'
  expect(
    classify(
      c,
      cap(b, {
        apiVersion: "Search-a-licious 0.1.0",
        url: `https://search.openfoodfacts.org/search?q=${c.query}`,
      }),
      b
    ).reasons
  ).toEqual(["MALFORMED_RESPONSE"])
  expect(freshness(cap().capturedAt, cap().capturedAt, 86400000)).toBe(
    "courant"
  )
})

it("les contraintes techniques bloquent borne, grille et verrou invalides", async () => {
  const available = await referenceProducts()
  const references: { meals: ReferenceMeal[] } = JSON.parse(
    await readFile(resolve(ROOT, "repas-reference.json"), "utf8")
  )
  const meal = references.meals[0]
  const lookup = (line: ReferenceMeal["lines"][number]) => {
    const snapshot = available.find(
      (x) => x.caseId === line.caseId && x.product.code === line.code
    )?.product.snapshot
    if (!snapshot) throw Error("MEAL_SOURCE")
    return snapshot
  }
  for (const value of ["110", "55", "60"]) {
    const invalid = structuredClone(meal.lines)
    invalid[0].quantity = value
    expect(() => mealTotals(invalid, lookup)).toThrow("INVALID_CONSTRAINT")
  }
  expect(() => mealTotals(meal.lines.slice(0, 2), lookup)).toThrow("MEAL_SIZE")
  const duplicate = structuredClone(meal.lines)
  duplicate[1] = duplicate[0]
  expect(() => mealTotals(duplicate, lookup)).toThrow("DUPLICATE_FOOD")
  const conversion = structuredClone(meal.lines)
  conversion[0].unit = "ml"
  expect(() => mealTotals(conversion, lookup)).toThrow("MISSING_DENSITY")
})

it("conserve et vérifie aussi les empreintes des essais archivés", async () => {
  let checked = 0
  async function walk(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) {
        await walk(path)
        continue
      }
      if (!entry.name.endsWith(".json") || entry.name.endsWith(".body.json"))
        continue
      const observation = JSON.parse(await readFile(path, "utf8"))
      if (!observation.sha256 || !observation.bodyFile) continue
      const filename = entry.name.startsWith("initial-")
        ? `initial-${observation.bodyFile}`
        : observation.bodyFile
      expect(hash(await readFile(resolve(directory, filename), "utf8"))).toBe(
        observation.sha256
      )
      checked++
    }
  }
  await walk(resolve(ROOT, "attempts"))
  expect(checked).toBeGreaterThan(0)
})

it("rejoue les enrichissements v3.6 avec leurs liens et empreintes hors réseau", async () => {
  const net = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
    throw Error("NETWORK_FORBIDDEN")
  })
  try {
    expect(await replayProducts()).toEqual(
      JSON.parse(
        await readFile(resolve(ROOT, "enrichment-classification.json"), "utf8")
      )
    )
    expect(net).not.toHaveBeenCalled()
  } finally {
    net.mockRestore()
  }
})

it("mappe v3.6 explicitement sourcé sans valeur calculée ni estimation", () => {
  const value = {
    nutrition: {
      aggregated_set: {
        per: "100g",
        preparation: "as_sold",
        nutrients: {
          proteins: {
            source: "packaging",
            source_per: "100g",
            unit: "g",
            value: "13.8",
          },
          carbohydrates: {
            source: "packaging",
            source_per: "100g",
            unit: "g",
            value: "1.78",
          },
          fat: {
            source: "packaging",
            source_per: "100g",
            unit: "g",
            value: "5.32",
          },
          "energy-kcal": {
            source: "packaging",
            source_per: "100g",
            unit: "kcal",
            value: "99.8",
            value_computed: "113.6",
          },
        },
      },
    },
  }
  const captured = cap(body, { apiVersion: "OFF v3.6" })
  const ready = normalizeProduct(
    product({ ...value, nutrition_data_per: undefined, nutriments: {} }),
    c,
    captured
  )
  expect(ready.status).toBe("utilisable")
  expect(ready.snapshot.nutrition.energy).toBe("99.8")
  const estimated = structuredClone(value)
  estimated.nutrition.aggregated_set.nutrients.proteins.source = "estimate"
  expect(
    normalizeProduct(
      product({ ...estimated, nutrition_data_per: undefined, nutriments: {} }),
      c,
      captured
    ).snapshot.nutrition.protein
  ).toBeNull()
  const mismatch = structuredClone(value)
  mismatch.nutrition.aggregated_set.nutrients.fat.source_per = "serving"
  expect(
    normalizeProduct(
      product({ ...mismatch, nutrition_data_per: undefined, nutriments: {} }),
      c,
      captured
    ).reasons
  ).toContain("MISSING_NUTRITION")
  expect(
    normalizeProduct(product({ obsolete: "on" }), c, cap()).reasons
  ).toContain("SOURCE_OBSOLETE")
})

it("n’invente pas l’unité d’un nutrient v3.6", () => {
  const p = product({
    nutrition_data_per: undefined,
    nutriments: {},
    nutrition: {
      aggregated_set: {
        per: "100g",
        nutrients: {
          proteins: { value: "2", source: "packaging", source_per: "100g" },
        },
      },
    },
  })
  expect(
    normalizeProduct(p, c, cap(body, { apiVersion: "OFF v3.6" })).snapshot
      .nutrition.protein
  ).toBeNull()
})

it.each(["01", "-01", "1."])(
  "rejette une réponse alimentaire au nombre JSON malformé %s",
  (invalidNumber) => {
    const malformed = body.replace(
      '"proteins_100g":0',
      `"proteins_100g":${invalidNumber}`
    )
    expect(() => parseLossless(malformed)).toThrow(SyntaxError)
    expect(classify(c, cap(malformed), malformed)).toMatchObject({
      status: "indisponible",
      reasons: ["MALFORMED_RESPONSE"],
      products: [],
    })
  }
)
it.each(["prepared", "as_prepared", undefined])(
  "bloque une préparation v3.6 non confirmée as_sold (%s) pour du riz cru",
  (preparation) => {
    const nutrition = {
      aggregated_set: {
        per: "100g",
        preparation,
        nutrients: Object.fromEntries(
          ["proteins", "carbohydrates", "fat", "energy-kcal"].map((key) => [
            key,
            {
              source: "packaging",
              source_per: "100g",
              unit: key === "energy-kcal" ? "kcal" : "g",
              value: "2",
            },
          ])
        ),
      },
    }
    const result = normalizeProduct(
      product({ product_name: "Riz cru", nutrition }),
      { ...c, query: "riz cru", state: "raw" },
      cap(body, { apiVersion: "OFF v3.6" })
    )
    expect(result.status).toBe("non pris en charge")
    expect(result.reasons).toContain("UNSUPPORTED_PREPARATION")
    expect(result.snapshot.state).toBe("raw")
    expect(result.sourceFields.nutritionSource).toEqual(nutrition)
    expect(
      calculatePortion(result.snapshot, { quantity: "100", unit: "g" })
    ).toMatchObject({ ok: false, error: { code: "MISSING_NUTRITION" } })
  }
)
