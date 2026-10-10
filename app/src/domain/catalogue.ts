import type { FoodSnapshot } from "./contracts"
import { parseDecimal } from "./decimal"
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
