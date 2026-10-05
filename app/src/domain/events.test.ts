import { expect, test } from "vitest"
import {
  mealProof,
  paymentProof,
  privateEvent,
  publicEvent,
} from "../../tests/fixtures/measurement-contracts"
import {
  selectMealEvents,
  selectPaymentEvents,
  validatePrivateEvent,
  validatePublicEvent,
} from "./events"

test("premier repas : favori, journal ou double destination comptent une occurrence stable", () => {
  const first = selectMealEvents(mealProof)
  expect(first).toMatchObject({
    ok: true,
    value: [{ type: "first_personal_meal" }],
  })
  if (!first.ok) throw new Error("proof")
  expect(first.value).toHaveLength(1)
  for (const destinations of [
    ["favorite"],
    ["journal"],
    ["favorite", "journal"],
  ] as const)
    expect(
      selectMealEvents({ ...mealProof, destinations: [...destinations] })
    ).toEqual(first)
  expect(
    selectMealEvents({ ...mealProof, firstPersonalConfirmation: false })
  ).toEqual({ ok: true, value: [] })
})
test.each(["copy", "resume"] as const)(
  "réutilisation %s : filiation et confirmation, original indépendant",
  (kind) => {
    const proof = { ...mealProof, reuse: { kind, sourceMealId: "original-1" } }
    const snapshot = structuredClone(proof)
    const selected = selectMealEvents(proof)
    expect(selected).toMatchObject({
      ok: true,
      value: [
        { type: "first_personal_meal" },
        { type: "meal_reused", sourceMealId: "original-1" },
      ],
    })
    expect(proof).toEqual(snapshot)
    expect(
      selectMealEvents({ ...proof, reuse: { kind, sourceMealId: "" } })
    ).toMatchObject({ ok: false, error: { code: "INVALID_METADATA" } })
  }
)
test("démo, absence de confirmation/d'effet/destination : aucune mesure personnelle", () => {
  for (const extra of [
    { personal: false },
    { confirmed: false },
    { mutationApplied: false },
    { destinations: [] },
  ])
    expect(selectMealEvents({ ...mealProof, ...extra })).toEqual({
      ok: true,
      value: [],
    })
})
test("paiement : seul l'encaissement serveur appliqué compte, ID stable par paiement", () => {
  expect(selectPaymentEvents(paymentProof)).toMatchObject({
    ok: true,
    value: [{ type: "payment_settled" }],
  })
  for (const extra of [
    { serverConfirmedSettlement: false },
    { mutationApplied: false },
  ])
    expect(selectPaymentEvents({ ...paymentProof, ...extra })).toEqual({
      ok: true,
      value: [],
    })
  expect(selectPaymentEvents(paymentProof)).toEqual(
    selectPaymentEvents({ ...paymentProof })
  )
  expect(
    selectPaymentEvents({ ...paymentProof, paymentId: "payment-2" })
  ).not.toEqual(selectPaymentEvents(paymentProof))
})
test("transport minimal : séparation public/privé, versions, identifiants, dates et données privées", () => {
  expect(validatePrivateEvent(privateEvent).ok).toBe(true)
  expect(validatePublicEvent(publicEvent).ok).toBe(true)
  expect(
    validatePublicEvent({ ...publicEvent, type: "calculator_completed" }).ok
  ).toBe(true)
  expect(validatePrivateEvent(publicEvent).ok).toBe(false)
  expect(validatePublicEvent(privateEvent).ok).toBe(false)
  for (const extra of [
    { version: 2 },
    { eventId: "" },
    { occurredAt: -1 },
    { occurredAt: 0.5 },
    { occurredAt: Infinity },
    { occurredAt: 8_640_000_000_000_001 },
    { email: "x@example.com" },
    { profile: {} },
    { ownerId: "owner-1" },
  ])
    expect(validatePublicEvent({ ...publicEvent, ...extra }).ok).toBe(false)
  for (const extra of [
    { ownerId: "" },
    { profile: {} },
    { sourceMealId: "unexpected" },
  ])
    expect(validatePrivateEvent({ ...privateEvent, ...extra }).ok).toBe(false)
  expect(
    validatePrivateEvent({ ...privateEvent, type: "meal_reused" }).ok
  ).toBe(false)
  expect(
    validatePrivateEvent({ ...privateEvent, type: "payment_settled" }).ok
  ).toBe(false)
})
