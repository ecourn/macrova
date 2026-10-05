import { expect, test } from "vitest"
import { requireActiveEntitlement } from "./access"
const active = { version: 1, enabled: true, validUntil: 1001 }
test("un droit confirmé futur est actif", () => {
  expect(requireActiveEntitlement(active, 1000)).toEqual({
    ok: true,
    value: active,
  })
})
test.each([
  null,
  { ...active, enabled: false },
  { ...active, version: 2 },
  ...[999, 1000, NaN, Infinity, -1, 1.5, 8_640_000_000_000_001].map(
    (validUntil) => ({ ...active, validUntil })
  ),
])("droit absent, désactivé, expiré ou invalide : %j", (entitlement) => {
  expect(requireActiveEntitlement(entitlement, 1000)).toEqual({
    ok: false,
    error: {
      code: "ENTITLEMENT_REQUIRED",
      fields: ["entitlement"],
      retryable: false,
    },
  })
})
test.each([NaN, Infinity, -1, 1.5])("horloge invalide : %s", (now) => {
  expect(requireActiveEntitlement(active, now).ok).toBe(false)
})
