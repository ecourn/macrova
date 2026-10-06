// @vitest-environment node
import { expect, test } from "vitest"
import {
  backendOperation,
  BackendUnavailableError,
} from "../../src/lib/server-errors"

test("une panne reste rejetée sans message, cause ou secret backend", async () => {
  const secret = "private-password-and-jwt"
  const original = new Error(secret, { cause: { token: secret } })
  try {
    await backendOperation(async () => {
      throw original
    })
    throw new Error("La panne aurait dû remonter")
  } catch (error) {
    expect(error).toBeInstanceOf(BackendUnavailableError)
    const safe = error as BackendUnavailableError
    expect(safe.code).toBe("UNAVAILABLE")
    expect(safe.incidentId).toMatch(/^[a-f0-9-]{36}$/)
    expect(String(safe)).not.toContain(secret)
    expect(JSON.stringify(safe)).not.toContain(secret)
    expect(safe.cause).toBeUndefined()
  }
})

test("session absente et données valides restent inchangées", async () => {
  expect(await backendOperation(async () => null)).toBeNull()
  expect(await backendOperation(async () => ({ value: "ok" }))).toEqual({
    value: "ok",
  })
})
