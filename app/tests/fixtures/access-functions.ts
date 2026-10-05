// Fixtures enregistrées uniquement dans la module map convex-test.
import { v } from "convex/values"
import {
  internalMutation,
  mutation,
  query,
} from "../../convex/_generated/server"
import {
  requireInternalWrite,
  requireOwned,
  requireOwner,
  requirePersonalWrite,
} from "../../convex/lib/access"
import schema from "../../convex/schema"

export const readReference = query({
  args: { referenceId: v.id("entitlements") },
  returns: schema.doc("entitlements"),
  handler: async (ctx, args) =>
    requireOwned(
      await requireOwner(ctx),
      await ctx.db.get("entitlements", args.referenceId)
    ),
})
export const personalWrite = mutation({
  args: { referenceId: v.id("entitlements") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const reference = requireOwned(
      await requirePersonalWrite(ctx),
      await ctx.db.get("entitlements", args.referenceId)
    )
    await ctx.db.patch("entitlements", reference._id, {
      validUntil: reference.validUntil + 1,
    })
    return null
  },
})
export const delayedWrite = internalMutation({
  args: { referenceId: v.id("entitlements"), create: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // La référence synthétique représente un travail durable avec owner serveur.
    const reference = await ctx.db.get("entitlements", args.referenceId)
    if (!reference) throw new Error("Travail synthétique absent")
    await requireInternalWrite(ctx, reference.ownerId)
    if (args.create)
      await ctx.db.insert("entitlements", {
        ownerId: reference.ownerId,
        version: reference.version,
        enabled: reference.enabled,
        validUntil: reference.validUntil,
      })
    else await ctx.db.patch("entitlements", reference._id, { enabled: false })
    return null
  },
})
