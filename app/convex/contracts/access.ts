import { v } from "convex/values"

export const entitlementValidator = v.object({
  version: v.number(),
  enabled: v.boolean(),
  validUntil: v.number(),
})
export const closureValidator = v.object({ closedAt: v.number() })
export const accountAccessValidator = v.object({
  entitlement: v.union(entitlementValidator, v.null()),
  closure: v.union(closureValidator, v.null()),
})
