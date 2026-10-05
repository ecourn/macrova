import { v, type Validator } from "convex/values"
import type { PrivateEvent, PublicEvent } from "../../src/domain/events"
const envelope = {
  version: v.literal(1),
  eventId: v.string(),
  occurredAt: v.number(),
}
const privateEnvelope = { ...envelope, ownerId: v.string() }
export const privateEventValidator: Validator<
  PrivateEvent,
  "required",
  string
> = v.union(
  v.object({ ...privateEnvelope, type: v.literal("first_personal_meal") }),
  v.object({
    ...privateEnvelope,
    type: v.literal("meal_reused"),
    sourceMealId: v.string(),
  }),
  v.object({
    ...privateEnvelope,
    type: v.literal("payment_settled"),
    paymentId: v.string(),
  })
)
export const publicEventValidator: Validator<PublicEvent, "required", string> =
  v.object({
    ...envelope,
    type: v.union(
      v.literal("calculator_completed"),
      v.literal("demo_completed")
    ),
  })
