import { isUtcTimestamp } from "./access"
import { hasOnlyKeys, isIdentifier, isRecord, sha256 } from "./commands"
import { failure, type Result } from "./contracts"

export const EVENT_VERSION = 1
export const PRIVATE_EVENT_TYPES = [
  "first_personal_meal",
  "meal_reused",
  "payment_settled",
] as const
export const PUBLIC_EVENT_TYPES = [
  "calculator_completed",
  "demo_completed",
] as const
export type PrivateEvent = {
  version: 1
  eventId: string
  ownerId: string
  occurredAt: number
} & (
  | { type: "first_personal_meal" }
  | { type: "meal_reused"; sourceMealId: string }
  | { type: "payment_settled"; paymentId: string }
)
export type PublicEvent = {
  version: 1
  eventId: string
  occurredAt: number
  type: (typeof PUBLIC_EVENT_TYPES)[number]
}
function validateEnvelope(input: unknown): Result<Record<string, unknown>> {
  if (!isRecord(input)) return failure("INVALID_METADATA", "event")
  if (input.version !== EVENT_VERSION)
    return failure("UNSUPPORTED_VERSION", "version")
  if (
    !isIdentifier(input.eventId) ||
    typeof input.occurredAt !== "number" ||
    !isUtcTimestamp(input.occurredAt)
  )
    return failure("INVALID_METADATA", "event")
  return { ok: true, value: input }
}
export function validatePrivateEvent(input: unknown): Result<PrivateEvent> {
  const common = validateEnvelope(input)
  if (!common.ok) return common
  const record = common.value
  const extra =
    record.type === "meal_reused"
      ? ["sourceMealId"]
      : record.type === "payment_settled"
        ? ["paymentId"]
        : []
  if (
    !PRIVATE_EVENT_TYPES.includes(record.type as PrivateEvent["type"]) ||
    !isIdentifier(record.ownerId) ||
    !hasOnlyKeys(record, [
      "version",
      "eventId",
      "ownerId",
      "occurredAt",
      "type",
      ...extra,
    ]) ||
    (extra.length > 0 && !isIdentifier(record[extra[0]]))
  )
    return failure("INVALID_METADATA", "event")
  return { ok: true, value: record as PrivateEvent }
}
export function validatePublicEvent(input: unknown): Result<PublicEvent> {
  const common = validateEnvelope(input)
  if (!common.ok) return common
  const record = common.value
  if (
    !PUBLIC_EVENT_TYPES.includes(record.type as PublicEvent["type"]) ||
    !hasOnlyKeys(record, ["version", "eventId", "occurredAt", "type"])
  )
    return failure("INVALID_METADATA", "event")
  return { ok: true, value: record as PublicEvent }
}
function eventId(
  ownerId: string,
  key: string,
  type: PrivateEvent["type"]
): string {
  return `event:${sha256(JSON.stringify([EVENT_VERSION, ownerId, key, type]))}`
}
// Preuves produites exclusivement après effet par le propriétaire dans sa mutation.
// Ces structures et helpers purs ne prouvent aucune autorisation.
export type MealMutationEvidence = {
  ownerId: string
  operationId: string
  occurredAt: number
  personal: boolean
  confirmed: boolean
  mutationApplied: boolean
  firstPersonalConfirmation: boolean
  destinations: ("favorite" | "journal")[]
  reuse: { kind: "copy" | "resume"; sourceMealId: string } | null
}
export function selectMealEvents(
  proof: MealMutationEvidence
): Result<PrivateEvent[]> {
  if (
    !isIdentifier(proof.ownerId) ||
    !isIdentifier(proof.operationId) ||
    !isUtcTimestamp(proof.occurredAt) ||
    !Array.isArray(proof.destinations) ||
    proof.destinations.some(
      (destination) => destination !== "favorite" && destination !== "journal"
    ) ||
    [
      proof.personal,
      proof.confirmed,
      proof.mutationApplied,
      proof.firstPersonalConfirmation,
    ].some((value) => typeof value !== "boolean")
  )
    return failure("INVALID_METADATA", "proof")
  if (
    proof.reuse !== null &&
    (!isRecord(proof.reuse) ||
      !hasOnlyKeys(proof.reuse, ["kind", "sourceMealId"]) ||
      (proof.reuse.kind !== "copy" && proof.reuse.kind !== "resume") ||
      !isIdentifier(proof.reuse.sourceMealId))
  )
    return failure("INVALID_METADATA", "sourceMealId")
  if (
    !proof.personal ||
    !proof.confirmed ||
    !proof.mutationApplied ||
    proof.destinations.length === 0
  )
    return { ok: true, value: [] }
  const events: PrivateEvent[] = []
  const base = {
    version: EVENT_VERSION,
    ownerId: proof.ownerId,
    occurredAt: proof.occurredAt,
  } as const
  if (proof.firstPersonalConfirmation)
    events.push({
      ...base,
      type: "first_personal_meal",
      eventId: eventId(proof.ownerId, proof.operationId, "first_personal_meal"),
    })
  if (proof.reuse)
    events.push({
      ...base,
      type: "meal_reused",
      sourceMealId: proof.reuse.sourceMealId,
      eventId: eventId(proof.ownerId, proof.operationId, "meal_reused"),
    })
  return { ok: true, value: events }
}
export type PaymentMutationEvidence = {
  ownerId: string
  paymentId: string
  occurredAt: number
  serverConfirmedSettlement: boolean
  mutationApplied: boolean
}
export function selectPaymentEvents(
  proof: PaymentMutationEvidence
): Result<PrivateEvent[]> {
  if (
    !isIdentifier(proof.ownerId) ||
    !isIdentifier(proof.paymentId) ||
    !isUtcTimestamp(proof.occurredAt) ||
    typeof proof.serverConfirmedSettlement !== "boolean" ||
    typeof proof.mutationApplied !== "boolean"
  )
    return failure("INVALID_METADATA", "proof")
  if (!proof.serverConfirmedSettlement || !proof.mutationApplied)
    return { ok: true, value: [] }
  return {
    ok: true,
    value: [
      {
        version: EVENT_VERSION,
        type: "payment_settled",
        eventId: eventId(proof.ownerId, proof.paymentId, "payment_settled"),
        ownerId: proof.ownerId,
        paymentId: proof.paymentId,
        occurredAt: proof.occurredAt,
      },
    ],
  }
}
