import { v, type Validator } from "convex/values"
import type { CatalogueResult } from "../../src/domain/catalogue"
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
