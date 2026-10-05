import { v } from "convex/values"
import { normalizeFrenchDecimal } from "../src/domain/decimal"
import {
  calculatePortion,
  checkCalculability,
  validateFoodSnapshot,
} from "../src/domain/food"
import { query } from "./_generated/server"
import {
  failureValidator,
  foodSnapshotValidator,
  portionValidator,
  totalsValidator,
} from "./contracts/food"

/** Public, anonymous and pure: validates only the caller's supplied snapshot. */
export const inspect = query({
  args: {
    snapshot: foodSnapshotValidator,
    portion: v.optional(portionValidator),
  },
  returns: v.union(
    failureValidator,
    v.object({
      ok: v.literal(true),
      snapshot: foodSnapshotValidator,
      calculability: v.union(
        failureValidator,
        v.object({ ok: v.literal(true), value: foodSnapshotValidator })
      ),
      totals: v.union(
        v.null(),
        failureValidator,
        v.object({ ok: v.literal(true), value: totalsValidator })
      ),
    })
  ),
  handler: (_ctx, { snapshot, portion }) => {
    const valid = validateFoodSnapshot(snapshot)
    if (!valid.ok) return valid
    return {
      ok: true as const,
      snapshot: valid.value,
      calculability: checkCalculability(snapshot),
      totals: portion ? calculatePortion(snapshot, portion) : null,
    }
  },
})
/** Explicit normalization for user input; never rewrites source values. */
export const normalizeInput = query({
  args: { input: v.string(), positive: v.optional(v.boolean()) },
  returns: v.union(
    failureValidator,
    v.object({ ok: v.literal(true), value: v.string() })
  ),
  handler: (_ctx, { input, positive }) =>
    normalizeFrenchDecimal(input, "value", positive),
})
