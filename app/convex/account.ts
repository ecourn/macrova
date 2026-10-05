import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { accountAccessValidator, closureValidator } from "./contracts/access"
import { readClosure, readEntitlement, requireOwner } from "./lib/access"

export const getAccess = query({
  args: {},
  returns: accountAccessValidator,
  handler: async (ctx) => {
    const ownerId = await requireOwner(ctx)
    const entitlement = await readEntitlement(ctx, ownerId)
    const closure = await readClosure(ctx, ownerId)
    return {
      entitlement: entitlement
        ? {
            version: entitlement.version,
            enabled: entitlement.enabled,
            validUntil: entitlement.validUntil,
          }
        : null,
      closure: closure ? { closedAt: closure.closedAt } : null,
    }
  },
})

export const close = mutation({
  args: { confirmation: v.literal("CLOSE_ACCOUNT") },
  returns: closureValidator,
  handler: async (ctx) => {
    const ownerId = await requireOwner(ctx)
    const existing = await readClosure(ctx, ownerId)
    if (existing) return { closedAt: existing.closedAt }
    const closedAt = Date.now()
    await ctx.db.insert("accountClosures", { ownerId, closedAt })
    return { closedAt }
  },
})
