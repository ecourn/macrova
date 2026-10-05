import { createHash } from "node:crypto"
import { expect, test } from "vitest"
import { intent, receipt } from "../../tests/fixtures/measurement-contracts"
import {
  canonicalize,
  decideReplay,
  digestContent,
  sha256,
  validateIntent,
  validateReceipt,
} from "./commands"
import { ERROR_CODES, failure } from "./contracts"

test.each([
  "",
  "abc",
  "é😀",
  "a".repeat(55),
  "a".repeat(56),
  "a".repeat(64),
  "a".repeat(1000),
])("SHA-256 vecteurs et plusieurs blocs (%s)", (text) => {
  expect(sha256(text)).toBe(createHash("sha256").update(text).digest("hex"))
})
test("canonicalisation récursive, JSON transportable et contenu distinct", () => {
  expect(canonicalize({ b: [1, { z: null, a: -0 }], a: "é" })).toEqual(
    canonicalize({ a: "é", b: [1, { a: 0, z: null }] })
  )
  expect(digestContent({ a: 1, b: 2 }, null)).toEqual(
    digestContent({ b: 2, a: 1 }, null)
  )
  expect(digestContent([1, 2], null)).not.toEqual(digestContent([2, 1], null))
  expect(digestContent(intent.content, "r2")).not.toEqual(
    digestContent(intent.content, "r1")
  )
  expect(validateIntent(JSON.parse(JSON.stringify(intent))).ok).toBe(true)
})
test("valeurs non JSON, cycles et accesseurs refusés", () => {
  const cycle: unknown[] = []
  cycle.push(cycle)
  const accessor = Object.defineProperty({}, "secret", {
    enumerable: true,
    get() {
      throw new Error("ne pas lire")
    },
  })
  for (const value of [
    1n,
    undefined,
    NaN,
    Infinity,
    new Date(),
    new Array(1),
    cycle,
    accessor,
    { a: undefined },
    { [Symbol("x")]: 1 },
    () => null,
  ])
    expect(canonicalize(value).ok).toBe(false)
})
test("exécution, reçu acquis au retry après changement de révision, conflit et refus intercompte", () => {
  expect(decideReplay("owner-1", intent, null, "r1")).toEqual({
    ok: true,
    value: { kind: "execute" },
  })
  expect(decideReplay("owner-1", intent, receipt, "r2")).toEqual({
    ok: true,
    value: { kind: "replay", result: receipt.result },
  })
  expect(decideReplay("owner-1", intent, null, "r2")).toEqual(
    failure("CONFLICT", "expectedRevision")
  )
  expect(decideReplay("owner-2", intent, receipt, "r1")).toEqual(
    failure("ACCESS_DENIED", "ownerId")
  )
  const changed = { ...intent, content: { changed: true } }
  const digest = digestContent(changed.content, changed.expectedRevision)
  if (!digest.ok) throw new Error("digest")
  expect(
    decideReplay(
      "owner-1",
      { ...changed, contentDigest: digest.value },
      receipt,
      "r1"
    )
  ).toEqual(failure("CONFLICT", "operationId"))
  expect(
    decideReplay("owner-1", { ...intent, operationId: "op-2" }, null, "r1")
  ).toMatchObject({ ok: true, value: { kind: "execute" } })
})
test("intentions/reçus refusent versions, dates, identifiants, digest falsifié et clés supplémentaires", () => {
  for (const extra of [
    { version: 2 },
    { operationId: "" },
    { ownerId: "owner-2" },
    { profile: {} },
    { contentDigest: "fake" },
    { expectedRevision: undefined },
  ])
    expect(validateIntent({ ...intent, ...extra }).ok).toBe(false)
  for (const extra of [
    { version: 2 },
    { ownerId: "" },
    { acquiredAt: -1 },
    { acquiredAt: NaN },
    { acquiredAt: 8_640_000_000_000_001 },
    { result: 1n },
    { email: "test@example.com" },
  ])
    expect(validateReceipt({ ...receipt, ...extra }).ok).toBe(false)
})
test("seule l'indisponibilité explicitement transitoire est réessayable", () => {
  for (const code of ERROR_CODES)
    expect(failure(code, "field")).toEqual({
      ok: false,
      error: { code, fields: ["field"], retryable: code === "UNAVAILABLE" },
    })
})

test("vecteurs SHA-256 standard", () => {
  expect(sha256("")).toBe(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  )
  expect(sha256("abc")).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  )
})
