import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { closureValidator, entitlementValidator } from "./contracts/access"

import { catalogueResultValidator } from "./contracts/catalogue"

// Les tables d'authentification appartiennent au composant Better Auth.
export default defineSchema({
  catalogueJobs: defineTable({
    key: v.string(),
    pending: v.boolean(),
    startedAt: v.number(),
    expiresAt: v.number(),
    result: v.union(catalogueResultValidator, v.null()),
  })
    .index("by_key_and_pending", ["key", "pending"])
    .index("by_startedAt", ["startedAt"]),
  catalogueParticipants: defineTable({
    jobId: v.id("catalogueJobs"),
    ownerId: v.string(),
  }).index("by_jobId", ["jobId"]),
  catalogueSuspensions: defineTable({
    key: v.string(),
    until: v.number(),
  }).index("by_key", ["key"]),
  calculatorMeasurements: defineTable({
    version: v.literal(1),
    eventId: v.string(),
    occurredAt: v.number(),
    type: v.literal("calculator_completed"),
    receivedAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_expiresAt", ["expiresAt"]),
  entitlements: defineTable(
    entitlementValidator.extend({
      ownerId: v.string(),
      metadata: v.optional(v.object({ version: v.literal(1) })),
    })
  ).index("by_ownerId", ["ownerId"]),
  accountClosures: defineTable(
    closureValidator.extend({ ownerId: v.string() })
  ).index("by_ownerId", ["ownerId"]),
})
