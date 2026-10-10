import { v, type Validator } from "convex/values"
import type { CatalogueResult, ProductResult } from "../../src/domain/catalogue"
import { foodSnapshotValidator } from "./food"
export const catalogueResultValidator: Validator<
  CatalogueResult,
  "required",
  string
> = v.union(
  v.object({
    kind: v.literal("results"),
    hits: v.array(
      v.object({
        snapshot: foodSnapshotValidator,
        indexedAt: v.union(v.string(), v.null()),
        reasons: v.array(v.string()),
      })
    ),
    capturedAt: v.number(),
  }),
  v.object({ kind: v.literal("unavailable"), reason: v.string() }),
  v.object({
    kind: v.union(v.literal("limited"), v.literal("suspended")),
    retryAt: v.number(),
  })
)

export const productResultValidator: Validator<
  ProductResult,
  "required",
  string
> = v.union(
  v.object({
    kind: v.literal("product"),
    detail: v.object({
      status: v.union(v.literal("ready"), v.literal("blocked")),
      snapshot: foodSnapshotValidator,
      reasons: v.array(v.string()),
      sourceFields: v.object({
        aggregatePer: v.union(v.string(), v.null()),
        preparation: v.union(v.string(), v.null()),
        productQuantityUnit: v.union(v.string(), v.null()),
        obsolete: v.union(v.string(), v.null()),
        stateEvidence: v.string(),
        nutrients: v.record(
          v.string(),
          v.record(v.string(), v.union(v.string(), v.null()))
        ),
      }),
    }),
  }),
  v.object({ kind: v.literal("missing") }),
  v.object({ kind: v.literal("unavailable"), reason: v.string() }),
  v.object({
    kind: v.union(v.literal("limited"), v.literal("suspended")),
    retryAt: v.number(),
  })
)
export const catalogueWorkResultValidator = v.union(
  catalogueResultValidator,
  productResultValidator
)
