import { v } from "convex/values"
import type { Validator } from "convex/values"
import {
  ERROR_CODES,
  type DomainError,
  type FoodSnapshot,
  type PortionTotals,
} from "../../src/domain/contracts"

const decimal = v.union(v.string(), v.null())
export const foodSnapshotValidator: Validator<
  FoodSnapshot,
  "required",
  string
> = v.object({
  version: v.number(),
  revision: v.string(),
  sourceId: v.string(),
  name: v.string(),
  brand: v.optional(v.string()),
  provenance: v.object({ name: v.string(), reference: v.string() }),
  capturedAt: v.number(),
  state: v.string(),
  basis: v.union(
    v.object({ kind: v.literal("known"), unit: v.string() }),
    v.object({ kind: v.literal("ambiguous"), sourceField: v.string() })
  ),
  nutrition: v.object({
    protein: decimal,
    carbohydrate: decimal,
    fat: decimal,
    energy: decimal,
  }),
  density: v.optional(
    v.object({
      gramsPerMl: v.string(),
      reference: v.string(),
      capturedAt: v.number(),
    })
  ),
})
export const portionValidator = v.object({
  quantity: v.string(),
  unit: v.string(),
  step: v.optional(v.string()),
})
export const errorValidator: Validator<DomainError, "required", string> =
  v.union(
    v.object({
      code: v.union(
        ...ERROR_CODES.filter((code) => code !== "UNAVAILABLE").map((code) =>
          v.literal(code)
        )
      ),
      fields: v.array(v.string()),
      retryable: v.literal(false),
    }),
    v.object({
      code: v.literal("UNAVAILABLE"),
      fields: v.array(v.string()),
      retryable: v.literal(true),
    })
  )
const exact = v.object({
  numerator: v.string(),
  denominator: v.string(),
  display: v.string(),
})
export const totalsValidator: Validator<PortionTotals, "required", string> =
  v.object({
    protein: exact,
    carbohydrate: exact,
    fat: exact,
    energy: exact,
  })
export const failureValidator = v.object({
  ok: v.literal(false),
  error: errorValidator,
})
