import type { CommandIntent, CommandReceipt } from "../../src/domain/commands"
import { digestContent } from "../../src/domain/commands"
import type {
  MealMutationEvidence,
  PaymentMutationEvidence,
  PrivateEvent,
  PublicEvent,
} from "../../src/domain/events"
export const content = {
  destinations: ["favorite", "journal"],
  mealId: "meal-1",
}
const digest = digestContent(content, "r1")
if (!digest.ok) throw new Error("Fixture invalide")
export const intent: CommandIntent<typeof content> = {
  version: 1,
  operationId: "op-1",
  content,
  contentDigest: digest.value,
  expectedRevision: "r1",
}
export const receipt: CommandReceipt<{ mealId: string }> = {
  version: 1,
  ownerId: "owner-1",
  operationId: intent.operationId,
  contentDigest: intent.contentDigest,
  acquiredAt: 1000,
  result: { mealId: "meal-1" },
}
export const mealProof: MealMutationEvidence = {
  ownerId: "owner-1",
  operationId: "op-1",
  occurredAt: 1000,
  personal: true,
  confirmed: true,
  mutationApplied: true,
  firstPersonalConfirmation: true,
  destinations: ["favorite", "journal"],
  reuse: null,
}
export const paymentProof: PaymentMutationEvidence = {
  ownerId: "owner-1",
  paymentId: "payment-1",
  occurredAt: 1000,
  serverConfirmedSettlement: true,
  mutationApplied: true,
}
export const privateEvent: PrivateEvent = {
  version: 1,
  eventId: "event-1",
  ownerId: "owner-1",
  occurredAt: 1000,
  type: "first_personal_meal",
}
export const publicEvent: PublicEvent = {
  version: 1,
  eventId: "event-2",
  occurredAt: 1000,
  type: "demo_completed",
}
