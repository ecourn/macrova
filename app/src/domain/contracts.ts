export const FOOD_SNAPSHOT_VERSION = 1
export const ERROR_CODES = [
  "UNAUTHENTICATED",
  "ACCESS_DENIED",
  "NOT_FOUND",
  "CONFLICT",
  "UNAVAILABLE",
  "ENTITLEMENT_REQUIRED",
  "ACCOUNT_CLOSED",
  "UNSUPPORTED_VERSION",
  "INVALID_METADATA",
  "INVALID_DECIMAL",
  "POSITIVE_REQUIRED",
  "MISSING_NUTRITION",
  "AMBIGUOUS_BASIS",
  "MISSING_DENSITY",
] as const
export type ErrorCode = (typeof ERROR_CODES)[number]
export type DomainError =
  | {
      code: Exclude<ErrorCode, "UNAVAILABLE">
      fields: string[]
      retryable: false
    }
  | { code: "UNAVAILABLE"; fields: string[]; retryable: true }
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: DomainError }
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: "Une session valide est requise.",
  ACCESS_DENIED: "Cette référence appartient à un autre compte.",
  NOT_FOUND: "Référence introuvable.",
  CONFLICT: "Le contenu a changé. Relire avant de confirmer.",
  UNAVAILABLE: "Service temporairement indisponible.",
  ENTITLEMENT_REQUIRED: "Un droit confirmé actif est requis.",
  ACCOUNT_CLOSED: "Le compte est fermé.",
  UNSUPPORTED_VERSION: "Version de contrat inconnue.",
  INVALID_METADATA: "Métadonnées invalides.",
  INVALID_DECIMAL: "Valeur décimale canonique invalide.",
  POSITIVE_REQUIRED: "Une valeur strictement positive est requise.",
  MISSING_NUTRITION: "Des valeurs nutritionnelles sont absentes.",
  AMBIGUOUS_BASIS: "La base nutritionnelle est ambiguë.",
  MISSING_DENSITY: "Une densité sourcée est nécessaire à la conversion.",
}
export function failure(code: ErrorCode, ...fields: string[]): Result<never> {
  return code === "UNAVAILABLE"
    ? { ok: false, error: { code, fields, retryable: true } }
    : { ok: false, error: { code, fields, retryable: false } }
}
export type QuantityUnit = "g" | "ml"
export const NUTRIENTS = ["protein", "carbohydrate", "fat", "energy"] as const
export type Nutrient = (typeof NUTRIENTS)[number]
export type Nutrition = Record<Nutrient, string | null>
export type FoodSnapshot = {
  version: number
  revision: string
  sourceId: string
  name: string
  brand?: string
  provenance: { name: string; reference: string }
  capturedAt: number
  state: string
  basis:
    | { kind: "known"; unit: string }
    | { kind: "ambiguous"; sourceField: string }
  nutrition: Nutrition
  density?: { gramsPerMl: string; reference: string; capturedAt: number }
}
export type Portion = { quantity: string; unit: string; step?: string }
export type ExactValue = {
  numerator: string
  denominator: string
  display: string
}
export type PortionTotals = Record<Nutrient, ExactValue>
