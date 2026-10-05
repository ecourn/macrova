import { failure, type Result } from "./contracts"
import { isUtcTimestamp } from "./access"

export const COMMAND_VERSION = 1
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }
export type CommandIntent<T extends JsonValue = JsonValue> = {
  version: 1
  operationId: string
  content: T
  contentDigest: string
  expectedRevision: string | null
}
export type CommandReceipt<T extends JsonValue = JsonValue> = {
  version: 1
  ownerId: string
  operationId: string
  contentDigest: string
  acquiredAt: number
  result: T
}
export function isIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,255}$/.test(value)
  )
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  )
}
export function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: string[]
): boolean {
  return Object.keys(value).every((key) => keys.includes(key))
}
// JSON v1 : objets simples, clés triées par unités UTF-16, tableaux ordonnés,
// nombres finis sérialisés par JSON.stringify (-0 devient 0), aucun undefined.
// Refuse cycles, trous, accesseurs, symboles et prototypes non JSON.
export function canonicalize(value: unknown): Result<string> {
  const parents = new Set<object>()
  function visit(input: unknown): string | null {
    if (
      input === null ||
      typeof input === "boolean" ||
      typeof input === "string"
    )
      return JSON.stringify(input)
    if (typeof input === "number")
      return Number.isFinite(input) ? JSON.stringify(input) : null
    if (
      typeof input !== "object" ||
      input === null ||
      parents.has(input) ||
      Object.getOwnPropertySymbols(input).length
    )
      return null
    if (!Array.isArray(input) && !isRecord(input)) return null
    parents.add(input)
    const parts: string[] = []
    const keys = Array.isArray(input)
      ? Array.from({ length: input.length }, (_, index) => String(index))
      : Object.keys(input).sort()
    if (Array.isArray(input) && Object.keys(input).length !== input.length)
      return null
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(input, key)
      if (!descriptor || !("value" in descriptor)) return null
      const part = visit(descriptor.value)
      if (part === null) return null
      parts.push(Array.isArray(input) ? part : `${JSON.stringify(key)}:${part}`)
    }
    parents.delete(input)
    return Array.isArray(input)
      ? `[${parts.join(",")}]`
      : `{${parts.join(",")}}`
  }
  const canonical = visit(value)
  return canonical === null
    ? failure("INVALID_METADATA", "content")
    : { ok: true, value: canonical }
}

// SHA-256 FIPS 180-4, UTF-8 via TextEncoder ; sortie hex minuscule.
// Aucun BigInt, API crypto, réseau ou horloge implicite.
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]
function rotate(value: number, shift: number): number {
  return (value >>> shift) | (value << (32 - shift))
}
export function sha256(text: string): string {
  const bytes = new TextEncoder().encode(text)
  const buffer = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64)
  buffer.set(bytes)
  buffer[bytes.length] = 0x80
  const view = new DataView(buffer.buffer)
  view.setUint32(buffer.length - 8, Math.floor(bytes.length / 0x20000000))
  view.setUint32(buffer.length - 4, bytes.length * 8)
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]
  for (let offset = 0; offset < buffer.length; offset += 64) {
    const words = new Uint32Array(64)
    for (let index = 0; index < 64; index++) {
      if (index < 16) words[index] = view.getUint32(offset + index * 4)
      else {
        const x = words[index - 15],
          y = words[index - 2]
        words[index] =
          words[index - 16] +
          (rotate(x, 7) ^ rotate(x, 18) ^ (x >>> 3)) +
          words[index - 7] +
          (rotate(y, 17) ^ rotate(y, 19) ^ (y >>> 10))
      }
    }
    let [a, b, c, d, e, f, g, h] = hash
    for (let index = 0; index < 64; index++) {
      const t1 =
        (h +
          (rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25)) +
          ((e & f) ^ (~e & g)) +
          K[index] +
          words[index]) |
        0
      const t2 =
        ((rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)) +
          ((a & b) ^ (a & c) ^ (b & c))) |
        0
      h = g
      g = f
      f = e
      e = (d + t1) | 0
      d = c
      c = b
      b = a
      a = (t1 + t2) | 0
    }
    const state = [a, b, c, d, e, f, g, h]
    for (let index = 0; index < 8; index++)
      hash[index] = (hash[index] + state[index]) >>> 0
  }
  return hash.map((word) => word.toString(16).padStart(8, "0")).join("")
}
export function digestContent(
  content: unknown,
  expectedRevision: string | null
): Result<string> {
  const canonical = canonicalize({ content, expectedRevision })
  return canonical.ok
    ? { ok: true, value: `sha256:${sha256(canonical.value)}` }
    : canonical
}
export function validateIntent(input: unknown): Result<CommandIntent> {
  if (!isRecord(input)) return failure("INVALID_METADATA", "intent")
  if (input.version !== COMMAND_VERSION)
    return failure("UNSUPPORTED_VERSION", "version")
  if (
    !hasOnlyKeys(input, [
      "version",
      "operationId",
      "content",
      "contentDigest",
      "expectedRevision",
    ]) ||
    !isIdentifier(input.operationId) ||
    !(input.expectedRevision === null || isIdentifier(input.expectedRevision))
  )
    return failure("INVALID_METADATA", "intent")
  const digest = digestContent(input.content, input.expectedRevision)
  if (!digest.ok) return digest
  if (digest.value !== input.contentDigest)
    return failure("INVALID_METADATA", "contentDigest")
  return { ok: true, value: input as CommandIntent }
}
export function validateReceipt(input: unknown): Result<CommandReceipt> {
  if (!isRecord(input)) return failure("INVALID_METADATA", "receipt")
  if (input.version !== COMMAND_VERSION)
    return failure("UNSUPPORTED_VERSION", "version")
  if (
    !hasOnlyKeys(input, [
      "version",
      "ownerId",
      "operationId",
      "contentDigest",
      "acquiredAt",
      "result",
    ]) ||
    !isIdentifier(input.ownerId) ||
    !isIdentifier(input.operationId) ||
    typeof input.contentDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(input.contentDigest) ||
    typeof input.acquiredAt !== "number" ||
    !isUtcTimestamp(input.acquiredAt) ||
    !canonicalize(input.result).ok
  )
    return failure("INVALID_METADATA", "receipt")
  return { ok: true, value: input as CommandReceipt }
}
// L'identité fournie ici est déjà dérivée et autorisée par le propriétaire serveur.
// Le replay précède la révision : le résultat acquis survit aux révisions suivantes.
export function decideReplay<T extends JsonValue>(
  ownerId: string,
  intent: CommandIntent,
  receipt: CommandReceipt<T> | null,
  currentRevision: string | null
): Result<{ kind: "execute" } | { kind: "replay"; result: T }> {
  const valid = validateIntent(intent)
  if (!valid.ok) return valid
  if (
    !isIdentifier(ownerId) ||
    !(currentRevision === null || isIdentifier(currentRevision))
  )
    return failure("INVALID_METADATA", "revision")
  if (receipt) {
    const checked = validateReceipt(receipt)
    if (!checked.ok) return checked
    if (receipt.ownerId !== ownerId) return failure("ACCESS_DENIED", "ownerId")
    if (
      receipt.operationId !== intent.operationId ||
      receipt.contentDigest !== intent.contentDigest
    )
      return failure("CONFLICT", "operationId")
    return { ok: true, value: { kind: "replay", result: receipt.result } }
  }
  if (intent.expectedRevision !== currentRevision)
    return failure("CONFLICT", "expectedRevision")
  return { ok: true, value: { kind: "execute" } }
}
