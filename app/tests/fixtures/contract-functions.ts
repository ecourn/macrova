import { v } from "convex/values"
import { mutation } from "../../convex/_generated/server"
import {
  commandIntentValidator,
  commandReceiptValidator,
} from "../../convex/contracts/commands"
import {
  privateEventValidator,
  publicEventValidator,
} from "../../convex/contracts/events"
import { errorValidator } from "../../convex/contracts/food"
import { validateIntent, validateReceipt } from "../../src/domain/commands"
import {
  validatePrivateEvent,
  validatePublicEvent,
} from "../../src/domain/events"
// Fixtures synthétiques hors répertoire déployable, aucun accès DB.
const content = v.object({
  destinations: v.array(v.string()),
  mealId: v.string(),
})
export const intentTransport = mutation({
  args: { input: commandIntentValidator(content) },
  handler: (_ctx, { input }) => validateIntent(input),
})
export const receiptTransport = mutation({
  args: { input: commandReceiptValidator(v.object({ mealId: v.string() })) },
  handler: (_ctx, { input }) => validateReceipt(input),
})
export const privateTransport = mutation({
  args: { input: privateEventValidator },
  handler: (_ctx, { input }) => validatePrivateEvent(input),
})
export const publicTransport = mutation({
  args: { input: publicEventValidator },
  handler: (_ctx, { input }) => validatePublicEvent(input),
})
export const errorTransport = mutation({
  args: { input: errorValidator },
  returns: errorValidator,
  handler: (_ctx, { input }) => input,
})
