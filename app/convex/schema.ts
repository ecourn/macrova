import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { closureValidator, entitlementValidator } from "./contracts/access"

// Les tables d'authentification appartiennent au composant Better Auth.
export default defineSchema({
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
