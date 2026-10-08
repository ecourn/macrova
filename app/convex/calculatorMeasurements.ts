import { HOUR, RateLimiter } from "@convex-dev/rate-limiter"
import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { validatePublicEvent } from "../src/domain/events"
import { components, internal } from "./_generated/api"
import { internalMutation, internalQuery } from "./_generated/server"
import { publicEventValidator } from "./contracts/events"

export const RETENTION_MS = 30 * 24 * HOUR
export const PURGE_BATCH = 100
export const GLOBAL_HOURLY_BUDGET = 1000
const limiter = new RateLimiter(components.rateLimiter, {
  calculator: {
    kind: "fixed window",
    rate: GLOBAL_HOURLY_BUDGET,
    period: HOUR,
    start: 0,
  },
})

export const collect = internalMutation({
  args: { event: publicEventValidator },
  handler: async (ctx, { event }) => {
    const now = Date.now()
    if (
      !validatePublicEvent(event).ok ||
      event.type !== "calculator_completed" ||
      event.occurredAt < now - 24 * HOUR ||
      event.occurredAt > now + 5 * 60_000
    )
      return { status: "invalid" } as const
    const previous = await ctx.db
      .query("calculatorMeasurements")
      .withIndex("by_eventId", (q) => q.eq("eventId", event.eventId))
      .unique()
    if (previous) {
      return {
        status:
          previous.occurredAt === event.occurredAt &&
          previous.type === event.type &&
          previous.version === event.version
            ? "duplicate"
            : "collision",
      } as const
    }
    const budget = await limiter.limit(ctx, "calculator")
    if (!budget.ok)
      return { status: "limited", retryAfter: budget.retryAfter } as const
    const id = await ctx.db.insert("calculatorMeasurements", {
      ...event,
      type: "calculator_completed",
      receivedAt: now,
      expiresAt: now + RETENTION_MS,
    })
    await ctx.scheduler.runAt(
      now + RETENTION_MS,
      internal.calculatorMeasurements.expire,
      { id }
    )
    return { status: "accepted" } as const
  },
})
export const expire = internalMutation({
  args: { id: v.id("calculatorMeasurements") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get("calculatorMeasurements", id)
    if (row && row.expiresAt <= Date.now())
      await ctx.db.delete("calculatorMeasurements", id)
    return null
  },
})
export const purge = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("calculatorMeasurements")
      .withIndex("by_expiresAt", (q) => q.lte("expiresAt", Date.now()))
      .take(PURGE_BATCH)
    for (const row of expired)
      await ctx.db.delete("calculatorMeasurements", row._id)
    if (expired.length === PURGE_BATCH)
      await ctx.scheduler.runAfter(0, internal.calculatorMeasurements.purge, {})
    return expired.length
  },
})
// Somme des comptes de pages à une date de bilan fixée par l'exploitation.
// Aucune enveloppe ni identité n'est exposée dans ce bilan interne.
export const summary = internalQuery({
  args: { asOf: v.number(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { asOf, paginationOpts }) => {
    if (
      !Number.isSafeInteger(asOf) ||
      asOf < 0 ||
      !Number.isInteger(paginationOpts.numItems) ||
      paginationOpts.numItems < 1 ||
      paginationOpts.numItems > 100 ||
      paginationOpts.endCursor !== undefined
    )
      throw new Error("Invalid summary bounds")
    const page = await ctx.db
      .query("calculatorMeasurements")
      .withIndex("by_expiresAt", (q) => q.gt("expiresAt", asOf))
      .paginate(paginationOpts)
    return {
      count: page.page.length,
      isDone: page.isDone,
      continueCursor: page.continueCursor,
    }
  },
})
