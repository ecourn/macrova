import type { FoodSnapshot } from "./contracts"
import { parseDecimal } from "./decimal"
import { checkCalculability, validateFoodSnapshot } from "./food"
import { normalizeProduct, parseLossless } from "./off-normalization"

export const OFF_ENDPOINT = "https://search.openfoodfacts.org/search"
export const OFF_API_VERSION = "Search-a-licious 0.1.0"
export const OFF_FIELDS =
  "code,product_name,product_name_fr,brands,categories,categories_tags,nutriments,nutrition_data_per,product_quantity_unit,last_indexed_datetime,obsolete,countries_tags"
export const SEARCH_BUDGET = 8
export const PRODUCT_BUDGET = 12
export const NETWORK_TIMEOUT_MS = 15_000
export const TRANSIENT_TTL_MS = 90_000
export type CatalogueHit = {
  snapshot: FoodSnapshot
  indexedAt: string | null
  reasons: string[]
}
export type CatalogueResult =
  | { kind: "results"; hits: CatalogueHit[]; capturedAt: number }
  | { kind: "unavailable"; reason: string }
  | { kind: "limited"; retryAt: number }
  | { kind: "suspended"; retryAt: number }
export function normalizeSearch(query: string): string {
  const normalized = query.normalize("NFC").trim().replace(/\s+/g, " ")
  if (
    !normalized ||
    normalized.length > 120 ||
    Array.from(normalized).some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127
    )
  )
    throw new Error(
      "Saisissez entre 1 et 120 caractères sans caractères de contrôle."
    )
  return normalized
}
export function searchUrl(query: string, endpoint = OFF_ENDPOINT): URL {
  if (endpoint !== OFF_ENDPOINT)
    throw new Error("Endpoint OFF non pris en charge")
  const url = new URL(endpoint)
  url.searchParams.set("q", normalizeSearch(query))
  url.searchParams.set("page_size", "10")
  url.searchParams.set("langs", "fr")
  url.searchParams.set("fields", OFF_FIELDS)
  return url
}
export function suspensionDeadline(value: string | null, now: number): number {
  if (value !== null && /^\d+$/.test(value.trim())) {
    const seconds = Number(value.trim())
    if (
      Number.isSafeInteger(seconds) &&
      Number.isSafeInteger(now + seconds * 1000)
    )
      return now + seconds * 1000
  }
  // HTTP-date, sans accepter les dates permissives telles que « 1.5 ».
  if (
    value &&
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(
      value
    )
  ) {
    const deadline = Date.parse(value)
    if (Number.isSafeInteger(deadline) && deadline >= now) return deadline
  }
  return now + 60_000
}
export function normalizeSearchBody(
  body: string,
  capturedAt: number,
  revision: string
): CatalogueResult {
  try {
    const value = parseLossless(body)
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("object")
    const data = value as Record<string, unknown>
    if (
      data.timed_out === true ||
      (Array.isArray(data.errors) && data.errors.length)
    )
      return { kind: "unavailable", reason: "SOURCE_ERROR" }
    if (!Array.isArray(data.hits) || data.hits.length > 10)
      throw new Error("hits")
    const hits: CatalogueHit[] = []
    for (const product of data.hits) {
      if (!product || typeof product !== "object" || Array.isArray(product))
        throw new Error("hit")
      const source = product as Record<string, unknown>
      if (typeof source.code !== "string" || !/^\d{4,24}$/.test(source.code))
        throw new Error("code")
      const normalized = normalizeProduct(
        product,
        { query: "", state: "unknown", basis: "unknown" },
        {
          apiVersion: OFF_API_VERSION,
          sha256: revision,
          capturedAt: new Date(capturedAt).toISOString(),
        }
      )
      if (normalized.reasons.includes("SOURCE_OBSOLETE")) continue
      if (
        !normalized.snapshot.name.trim() ||
        normalized.snapshot.name.length > 500
      )
        throw new Error("name")
      const reasons = [...normalized.reasons]
      for (const [nutrient, amount] of Object.entries(
        normalized.snapshot.nutrition
      )) {
        const sourceKey = {
          protein: "proteins",
          carbohydrate: "carbohydrates",
          fat: "fat",
          energy: "energy-kcal",
        }[nutrient]
        if (
          (amount !== null && !parseDecimal(amount, nutrient).ok) ||
          reasons.some(
            (r) =>
              r === `UNSUPPORTED_NUTRIENT_UNIT:${sourceKey}` ||
              r === `UNSUPPORTED_NUTRIENT_MODIFIER:${sourceKey}`
          )
        )
          normalized.snapshot.nutrition[
            nutrient as keyof FoodSnapshot["nutrition"]
          ] = null
      }
      const indexedAt =
        typeof source.last_indexed_datetime === "string" &&
        Number.isFinite(Date.parse(source.last_indexed_datetime))
          ? source.last_indexed_datetime
          : null
      hits.push({ snapshot: normalized.snapshot, indexedAt, reasons })
    }
    return { kind: "results", hits, capturedAt }
  } catch {
    return { kind: "unavailable", reason: "MALFORMED_RESPONSE" }
  }
}

export const OFF_PRODUCT_API_VERSION = "OFF v3.6"
export const OFF_PRODUCT_ENDPOINTS = [
  "https://world.openfoodfacts.net",
  "https://world.openfoodfacts.org",
] as const
export const OFF_PRODUCT_FIELDS =
  "code,product_name,product_name_fr,brands,categories,categories_tags,product_quantity_unit,nutrition,obsolete"
export type ProductSourceFields = {
  aggregatePer: string | null
  preparation: string | null
  productQuantityUnit: string | null
  obsolete: string | null
  stateEvidence: string
  nutrients: Record<string, Record<string, string | null>>
}
export type ProductDetail = {
  status: "ready" | "blocked"
  snapshot: FoodSnapshot
  reasons: string[]
  sourceFields: ProductSourceFields
}
export type ProductResult =
  | { kind: "product"; detail: ProductDetail }
  | { kind: "missing" }
  | Exclude<CatalogueResult, { kind: "results" }>
export type CatalogueWorkResult = CatalogueResult | ProductResult
export function validateProductCode(code: string): string {
  if (!/^\d{4,24}$/.test(code)) throw new Error("Code produit OFF invalide.")
  return code
}
export function productUrl(code: string, endpoint: string): URL {
  validateProductCode(code)
  if (!OFF_PRODUCT_ENDPOINTS.some((allowed) => endpoint === allowed))
    throw new Error("Endpoint produit OFF non pris en charge")
  const url = new URL(`/api/v3.6/product/${code}.json`, endpoint)
  url.searchParams.set("fields", OFF_PRODUCT_FIELDS)
  return url
}
const sourceRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const sourceText = (value: unknown): string | null => {
  if (value === undefined || value === null) return null
  if (typeof value === "boolean") return String(value)
  if (typeof value !== "string" || value.length > 2000)
    throw new Error("source field")
  return value
}
/** Enveloppe stricte v3.6 : le normaliseur audité reste inchangé. */
export function normalizeProductBody(
  body: string,
  code: string,
  capturedAt: number,
  revision: string
): ProductResult {
  try {
    validateProductCode(code)
    const data = sourceRecord(parseLossless(body))
    const errors = data.errors
    if (!Array.isArray(errors)) throw new Error("errors")
    if (data.code !== code) throw new Error("code")
    if (sourceRecord(data.result).id === "product_not_found" && !data.product)
      return { kind: "missing" }
    if (errors.length) return { kind: "unavailable", reason: "SOURCE_ERROR" }
    if (
      data.status !== "success" ||
      sourceRecord(data.result).id !== "product_found"
    )
      throw new Error("status")
    const product = sourceRecord(data.product)
    if (product.code !== code) throw new Error("product")
    const aggregate = sourceRecord(
      sourceRecord(product.nutrition).aggregated_set
    )
    // L'absence de l'agrégat ne doit jamais rouvrir les nutriments legacy.
    const normalized = normalizeProduct(
      { ...product, nutriments: {}, nutrition_data_per: null },
      { query: "", basis: "unknown", state: "unknown" },
      {
        apiVersion: OFF_PRODUCT_API_VERSION,
        sha256: revision,
        capturedAt: new Date(capturedAt).toISOString(),
      }
    )
    const { snapshot } = normalized
    if (
      !snapshot.name.trim() ||
      snapshot.name.length > 500 ||
      (snapshot.brand?.length ?? 0) > 500
    )
      throw new Error("metadata")
    const reasons = [...normalized.reasons]
    if (!Object.keys(aggregate).length) reasons.push("MISSING_AGGREGATE")
    if (aggregate.preparation !== "as_sold")
      reasons.push("UNSUPPORTED_PREPARATION")
    const sourceFields: ProductSourceFields = {
      aggregatePer: sourceText(aggregate.per),
      preparation: sourceText(aggregate.preparation),
      productQuantityUnit: sourceText(product.product_quantity_unit),
      obsolete: sourceText(product.obsolete),
      stateEvidence: normalized.sourceFields.stateEvidence.slice(0, 2000),
      nutrients: {},
    }
    const nutrients = sourceRecord(aggregate.nutrients)
    for (const [field, sourceKey] of [
      ["protein", "proteins"],
      ["carbohydrate", "carbohydrates"],
      ["fat", "fat"],
      ["energy", "energy-kcal"],
    ] as const) {
      const nutrient = sourceRecord(nutrients[sourceKey])
      sourceFields.nutrients[sourceKey] = Object.fromEntries(
        ["value", "unit", "source", "source_per", "modifier"].map((key) => [
          key,
          sourceText(nutrient[key]),
        ])
      )
      if (nutrient.value !== null && nutrient.value !== undefined) {
        if (nutrient.source !== "packaging")
          reasons.push(`UNSUPPORTED_NUTRIENT_SOURCE:${sourceKey}`)
        if (nutrient.source_per !== aggregate.per)
          reasons.push(`INCOMPATIBLE_SOURCE_PER:${sourceKey}`)
      }
      const amount = snapshot.nutrition[field]
      if (amount !== null && !parseDecimal(amount, field).ok) {
        reasons.push(`INVALID_DECIMAL:${sourceKey}`)
        snapshot.nutrition[field] = null
      }
      if (nutrient.modifier !== undefined && nutrient.modifier !== "=")
        snapshot.nutrition[field] = null
    }
    const valid = validateFoodSnapshot(snapshot)
    if (!valid.ok) throw new Error("snapshot")
    const calculability = checkCalculability(snapshot)
    if (!calculability.ok) reasons.push(calculability.error.code)
    const unique = [...new Set(reasons)]
    return {
      kind: "product",
      detail: {
        status: unique.length ? "blocked" : "ready",
        snapshot,
        reasons: unique,
        sourceFields,
      },
    }
  } catch {
    return { kind: "unavailable", reason: "MALFORMED_RESPONSE" }
  }
}
