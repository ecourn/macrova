import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter"
import { v } from "convex/values"
import {
  SEARCH_BUDGET,
  PRODUCT_BUDGET,
  TRANSIENT_TTL_MS,
} from "../src/domain/catalogue"
import { components, internal } from "./_generated/api"
import { internalMutation } from "./_generated/server"
import { catalogueResultValidator } from "./contracts/catalogue"
import { deny, requirePersonalWrite } from "./lib/access"
const limiter = new RateLimiter(components.rateLimiter, {
  offSearch: {
    kind: "fixed window",
    rate: SEARCH_BUDGET,
    period: MINUTE,
    start: 0,
  },
  offProduct: {
    kind: "fixed window",
    rate: PRODUCT_BUDGET,
    period: MINUTE,
    start: 0,
  },
})
export const reserve = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const ownerId = await requirePersonalWrite(ctx)
    const now = Date.now()
    const suspension = await ctx.db
      .query("catalogueSuspensions")
      .withIndex("by_key", (q) => q.eq("key", "off"))
      .unique()
    if (suspension && suspension.until > now)
      return { kind: "suspended", retryAt: suspension.until } as const
    const previous = await ctx.db
      .query("catalogueJobs")
      .withIndex("by_key_and_pending", (q) =>
        q.eq("key", key).eq("pending", true)
      )
      .unique()
    let jobId = previous && previous.expiresAt > now ? previous._id : null
    const leader = jobId === null
    if (!jobId) {
      // La fenêtre glissante empêche un double budget à la frontière des minutes.
      const recent = await ctx.db
        .query("catalogueJobs")
        .withIndex("by_startedAt", (q) => q.gt("startedAt", now - MINUTE))
        .take(SEARCH_BUDGET)
      if (recent.length >= SEARCH_BUDGET)
        return {
          kind: "limited",
          retryAt: recent[0].startedAt + MINUTE,
        } as const
      const budget = await limiter.limit(ctx, "offSearch")
      if (!budget.ok)
        return { kind: "limited", retryAt: now + budget.retryAfter } as const
      if (previous)
        await ctx.db.patch("catalogueJobs", previous._id, { pending: false })
      jobId = await ctx.db.insert("catalogueJobs", {
        key,
        pending: true,
        startedAt: now,
        expiresAt: now + TRANSIENT_TTL_MS,
        result: null,
      })
      await ctx.scheduler.runAt(
        now + TRANSIENT_TTL_MS,
        internal.catalogueState.expire,
        { jobId }
      )
    }
    const participants = await ctx.db
      .query("catalogueParticipants")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .take(128)
    if (participants.length >= 128)
      return { kind: "limited", retryAt: now + MINUTE } as const
    const participantId = await ctx.db.insert("catalogueParticipants", {
      jobId,
      ownerId,
    })
    return { kind: "attached", jobId, participantId, leader } as const
  },
})
export const receive = internalMutation({
  args: {
    participantId: v.id("catalogueParticipants"),
    beforeNetwork: v.boolean(),
  },
  handler: async (ctx, { participantId, beforeNetwork }) => {
    const ownerId = await requirePersonalWrite(ctx)
    const participant = await ctx.db.get("catalogueParticipants", participantId)
    if (!participant)
      return { kind: "unavailable", reason: "WORK_EXPIRED" } as const
    if (participant.ownerId !== ownerId) deny("ACCESS_DENIED")
    if (beforeNetwork) {
      const suspension = await ctx.db
        .query("catalogueSuspensions")
        .withIndex("by_key", (q) => q.eq("key", "off"))
        .unique()
      if (suspension && suspension.until > Date.now())
        return { kind: "suspended", retryAt: suspension.until } as const
    }
    const job = await ctx.db.get("catalogueJobs", participant.jobId)
    if (!job || job.expiresAt <= Date.now())
      return { kind: "unavailable", reason: "WORK_EXPIRED" } as const
    if (job.result) {
      await ctx.db.delete("catalogueParticipants", participantId)
      return job.result
    }
    return null
  },
})
export const finish = internalMutation({
  args: {
    jobId: v.id("catalogueJobs"),
    result: catalogueResultValidator,
    suspendUntil: v.union(v.number(), v.null()),
  },
  handler: async (ctx, { jobId, result, suspendUntil }) => {
    // L'état partagé de la source doit être enregistré même si la session vient d'expirer.
    if (suspendUntil !== null) {
      const existing = await ctx.db
        .query("catalogueSuspensions")
        .withIndex("by_key", (q) => q.eq("key", "off"))
        .unique()
      if (existing)
        await ctx.db.patch("catalogueSuspensions", existing._id, {
          until: Math.max(existing.until, suspendUntil),
        })
      else
        await ctx.db.insert("catalogueSuspensions", {
          key: "off",
          until: suspendUntil,
        })
    }
    const job = await ctx.db.get("catalogueJobs", jobId)
    if (job && job.pending && job.expiresAt > Date.now())
      await ctx.db.patch("catalogueJobs", jobId, { pending: false, result })
    return null
  },
})
export const expire = internalMutation({
  args: { jobId: v.id("catalogueJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get("catalogueJobs", jobId)
    if (!job || job.expiresAt > Date.now()) return null
    const participants = await ctx.db
      .query("catalogueParticipants")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .take(128)
    for (const participant of participants)
      await ctx.db.delete("catalogueParticipants", participant._id)
    await ctx.db.delete("catalogueJobs", jobId)
    return null
  },
})
