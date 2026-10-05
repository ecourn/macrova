/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import { makeFunctionReference } from "convex/server"
import { expect, test } from "vitest"
import {
  intent,
  receipt,
  privateEvent,
  publicEvent,
} from "../tests/fixtures/measurement-contracts"
import { validateIntent, validateReceipt } from "../src/domain/commands"
import { ERROR_CODES, failure } from "../src/domain/contracts"
import { validatePrivateEvent, validatePublicEvent } from "../src/domain/events"
import schema from "./schema"
const modules = {
  ...import.meta.glob("./**/*.ts"),
  "./syntheticContracts.ts": () =>
    import("../tests/fixtures/contract-functions"),
}
const reference = (name: string) =>
  makeFunctionReference<"mutation", { input: unknown }>(
    `syntheticContracts:${name}`
  )
test("fixtures JSON : même résultat domaine et transport Convex avec validation sémantique", async () => {
  const t = convexTest(schema, modules)
  const fixtures = [
    ["intentTransport", intent, validateIntent],
    ["receiptTransport", receipt, validateReceipt],
    ["privateTransport", privateEvent, validatePrivateEvent],
    ["publicTransport", publicEvent, validatePublicEvent],
  ] as const
  for (const [name, input, validate] of fixtures) {
    expect(
      await t.mutation(reference(name), {
        input: JSON.parse(JSON.stringify(input)),
      })
    ).toEqual(validate(input))
    for (const extra of [
      { version: 2 },
      { profile: {} },
      { email: "x@example.com" },
    ]) {
      const invalid = { ...input, ...extra }
      expect(validate(invalid).ok).toBe(false)
      await expect(
        t.mutation(reference(name), { input: invalid })
      ).rejects.toThrow()
    }
  }
  for (const invalid of [
    { ...publicEvent, ownerId: "owner-1" },
    { ...publicEvent, type: "first_personal_meal" },
    { ...publicEvent, profile: { weight: 70 } },
  ])
    await expect(
      t.mutation(reference("publicTransport"), { input: invalid })
    ).rejects.toThrow()
  for (const input of [
    { ...privateEvent, occurredAt: -1 },
    { ...privateEvent, ownerId: "" },
    { ...privateEvent, eventId: "" },
  ])
    expect(await t.mutation(reference("privateTransport"), { input })).toEqual(
      validatePrivateEvent(input)
    )
  const invalidIntent = { ...intent, contentDigest: "fake" }
  expect(
    await t.mutation(reference("intentTransport"), { input: invalidIntent })
  ).toEqual(validateIntent(invalidIntent))
})
test("erreurs transport : retryable lié au code, compatibilité nutrition/access", async () => {
  const t = convexTest(schema, modules)
  for (const code of ERROR_CODES) {
    const result = failure(code, "field")
    if (result.ok) throw new Error("fixture")
    expect(
      await t.mutation(reference("errorTransport"), { input: result.error })
    ).toEqual(result.error)
    await expect(
      t.mutation(reference("errorTransport"), {
        input: { ...result.error, retryable: !result.error.retryable },
      })
    ).rejects.toThrow()
  }
})
