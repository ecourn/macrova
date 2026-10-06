// Module interne uniquement copié dans un projet local jetable par le script.
import { v } from "convex/values"
import { components } from "../../convex/_generated/api"
import { internalMutation, internalQuery } from "../../convex/_generated/server"
import { requireInternalWrite } from "../../convex/lib/access"
import schema from "../../convex/schema"

const account = v.object({
  ownerId: v.string(),
  sessionId: v.string(),
  referenceId: v.id("entitlements"),
})
export const seed = internalMutation({
  args: {},
  returns: v.object({ closed: account, open: account }),
  handler: async (ctx) => {
    if (
      (await ctx.db.query("entitlements").first()) ||
      (await ctx.db.query("accountClosures").first())
    )
      throw new Error("RECOVERY_NOT_EMPTY")
    const now = Date.now()
    async function create(name: string) {
      const user = await ctx.runMutation(components.betterAuth.adapter.create, {
        input: {
          model: "user",
          data: {
            name,
            email: `${name}@example.com`,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
          },
        },
      })
      const session = await ctx.runMutation(
        components.betterAuth.adapter.create,
        {
          input: {
            model: "session",
            data: {
              userId: user._id,
              token: crypto.randomUUID(),
              expiresAt: now + 3_600_000,
              createdAt: now,
              updatedAt: now,
            },
          },
        }
      )
      const referenceId = await ctx.db.insert("entitlements", {
        ownerId: user._id,
        version: 1,
        enabled: true,
        validUntil: now + 3_600_000,
      })
      return { ownerId: user._id, sessionId: session._id, referenceId }
    }
    const closed = await create("socle-recovery-closed")
    const open = await create("socle-recovery-open")
    await ctx.db.insert("accountClosures", {
      ownerId: closed.ownerId,
      closedAt: now,
    })
    return { closed, open }
  },
})
export const snapshot = internalQuery({
  args: {},
  returns: v.object({
    entitlements: v.array(schema.doc("entitlements")),
    closures: v.array(schema.doc("accountClosures")),
  }),
  handler: async (ctx) => ({
    entitlements: await ctx.db.query("entitlements").take(20),
    closures: await ctx.db.query("accountClosures").take(20),
  }),
})
export const loseRoots = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const entitlements = await ctx.db.query("entitlements").take(21)
    const closures = await ctx.db.query("accountClosures").take(21)
    if (entitlements.length > 20 || closures.length > 20)
      throw new Error("RECOVERY_LIMIT")
    for (const doc of entitlements) await ctx.db.delete("entitlements", doc._id)
    for (const doc of closures) await ctx.db.delete("accountClosures", doc._id)
    return null
  },
})
export const enrich = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({
    cursor: v.string(),
    done: v.boolean(),
    updated: v.number(),
  }),
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query("entitlements")
      .paginate({ cursor, numItems: 10 })
    let updated = 0
    for (const doc of page.page) {
      // Fermeture : aucun enrichissement interne autorisé.
      if (
        await ctx.db
          .query("accountClosures")
          .withIndex("by_ownerId", (q) => q.eq("ownerId", doc.ownerId))
          .unique()
      )
        continue
      await requireInternalWrite(ctx, doc.ownerId)
      if (!doc.metadata) {
        await ctx.db.patch("entitlements", doc._id, {
          metadata: { version: 1 },
        })
        updated++
      }
    }
    return { cursor: page.continueCursor, done: page.isDone, updated }
  },
})
export const revoke = internalMutation({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: { model: "session", where: [{ field: "_id", value: sessionId }] },
    })
    return null
  },
})
