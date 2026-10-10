import type { FoodSnapshot } from "./contracts"
import { checkCalculability } from "./food"
export type NormalizationCase = { query: string; state: string; basis: string }
export type NormalizationCapture = {
  apiVersion?: string
  sha256: string
  capturedAt: string
}
/** Preserve numeric JSON lexemes before JSON.parse can round them. */
export function parseLossless(body: string): unknown {
  // Validate the original grammar only; discard rounded numbers from this pass.
  JSON.parse(body)
  return JSON.parse(
    body.replace(
      /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
      (token) => (token.startsWith('"') ? token : JSON.stringify(token))
    )
  )
}
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
const string = (v: unknown) => (typeof v === "string" ? v : "")
export function sourceDecimal(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const raw = string(value)
  if (!/^\d+(?:\.\d{1,6})?$/.test(raw)) return raw || "INVALID"
  const [whole, fraction = ""] = raw.split(".")
  const tail = fraction.replace(/0+$/, "")
  return `${whole.replace(/^0+(?=\d)/, "")}${tail ? `.${tail}` : ""}`
}
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
export function normalizeProduct(
  input: unknown,
  c: NormalizationCase,
  cap: NormalizationCapture
) {
  const p = record(input)
  const aggregate = record(record(p.nutrition).aggregated_set)
  const fromV3 =
    cap.apiVersion === "OFF v3.6" && Object.keys(aggregate).length > 0
  const preparationSupported = !fromV3 || aggregate.preparation === "as_sold"
  let n = record(p.nutriments)
  if (fromV3) {
    n = {}
    const nutrients = record(aggregate.nutrients)
    for (const key of ["proteins", "carbohydrates", "fat", "energy-kcal"]) {
      const nutrient = record(nutrients[key])
      n[`${key}_100g`] =
        preparationSupported &&
        nutrient.source === "packaging" &&
        nutrient.source_per === aggregate.per &&
        nutrient.unit === (key === "energy-kcal" ? "kcal" : "g")
          ? nutrient.value
          : null
      n[`${key}_unit`] = nutrient.unit
      if (nutrient.modifier !== undefined)
        n[`${key}_modifier`] = nutrient.modifier
    }
  }
  const name = string(p.product_name_fr) || string(p.product_name)
  const brands = Array.isArray(p.brands)
    ? p.brands.map(string).filter(Boolean).join(", ")
    : string(p.brands)
  const evidence = fold(
    `${name} ${string(p.categories)} ${Array.isArray(p.categories_tags) ? p.categories_tags.join(" ") : ""}`
  )
  const raw = /\b(cru|crue|crues|raw|uncooked)\b/.test(evidence),
    cooked = /\b(cuit|cuite|cuits|cuites|cooked)\b/.test(evidence)
  const mixed =
    /\b(grand cru|bowl|poke|salade|chocolat|sur lit|avec|sauce|preparation)\b/.test(
      evidence
    )
  const state = !mixed && raw !== cooked ? (raw ? "raw" : "cooked") : "unknown"
  const sourceUnit = string(fromV3 ? aggregate.per : p.nutrition_data_per)
  const unit =
    sourceUnit === "100g" && string(p.product_quantity_unit) !== "ml"
      ? "g"
      : sourceUnit === "100ml"
        ? "ml"
        : null
  const snapshot: FoodSnapshot = {
    version: 1,
    revision: cap.sha256,
    sourceId: string(p.code),
    name,
    ...(brands ? { brand: brands } : {}),
    provenance: {
      name: "Open Food Facts",
      reference: `https://world.openfoodfacts.org/product/${string(p.code)}`,
    },
    capturedAt: Date.parse(cap.capturedAt),
    state,
    basis: unit
      ? { kind: "known", unit }
      : { kind: "ambiguous", sourceField: "nutrition_data_per" },
    nutrition: {
      protein: sourceDecimal(n.proteins_100g),
      carbohydrate: sourceDecimal(n.carbohydrates_100g),
      fat: sourceDecimal(n.fat_100g),
      energy: sourceDecimal(n["energy-kcal_100g"]),
    },
  }
  const relevant = fold(c.query)
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .every((t) => fold(`${name} ${brands} ${string(p.categories)}`).includes(t))
  const valid = checkCalculability(snapshot),
    reasons: string[] = []
  if (!preparationSupported) reasons.push("UNSUPPORTED_PREPARATION")
  if (p.obsolete === true || ["on", "1", "true"].includes(string(p.obsolete)))
    reasons.push("SOURCE_OBSOLETE")
  if (!relevant) reasons.push("IRRELEVANT_RESULT")
  if (c.state !== "unknown" && state !== c.state)
    reasons.push(state === "unknown" ? "STATE_UNPROVEN" : "STATE_MISMATCH")
  if (!valid.ok) reasons.push(valid.error.code)
  const missing = Object.entries(snapshot.nutrition)
    .filter(([, v]) => v === null)
    .map(([k]) => k)
  if (missing.length && !reasons.includes("MISSING_NUTRITION"))
    reasons.push("MISSING_NUTRITION")
  for (const [key, expectedUnit] of [
    ["proteins", "g"],
    ["carbohydrates", "g"],
    ["fat", "g"],
    ["energy-kcal", "kcal"],
  ]) {
    if (n[`${key}_unit`] !== undefined && n[`${key}_unit`] !== expectedUnit)
      reasons.push(`UNSUPPORTED_NUTRIENT_UNIT:${key}`)
    if (n[`${key}_modifier`] !== undefined && n[`${key}_modifier`] !== "=")
      reasons.push(`UNSUPPORTED_NUTRIENT_MODIFIER:${key}`)
  }
  if (unit && c.basis !== "unknown" && unit !== c.basis)
    reasons.push("MISSING_DENSITY")
  const status =
    reasons.length === 0
      ? "utilisable"
      : reasons.every((r) =>
            [
              "MISSING_NUTRITION",
              "AMBIGUOUS_BASIS",
              "STATE_UNPROVEN",
              "MISSING_DENSITY",
            ].includes(r)
          )
        ? "complétion privée sourcée nécessaire"
        : "non pris en charge"
  return {
    code: snapshot.sourceId,
    status,
    reasons,
    snapshot,
    sourceFields: {
      nutrition_data_per: p.nutrition_data_per ?? null,
      aggregatePer: fromV3 ? aggregate.per : null,
      nutritionSource: fromV3 ? p.nutrition : null,
      product_quantity_unit: p.product_quantity_unit ?? null,
      nutriments: n,
      missing,
      validationError: valid.ok ? null : valid.error,
      stateEvidence: evidence,
      lastIndexed: p.last_indexed_datetime ?? null,
      obsolete: p.obsolete ?? null,
    },
    action:
      status === "utilisable"
        ? "Utiliser dans la base et l’état déclarés."
        : "Confirmer la pertinence et compléter avec une source identifiable avant tout calcul.",
  }
}
