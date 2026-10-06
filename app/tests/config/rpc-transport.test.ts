// @vitest-environment node
import { defaultSerovalDeserializerPlugins } from "@tanstack/react-start"
import { toJSON } from "seroval"
import { afterEach, expect, test, vi } from "vitest"
import { validateRpcGet } from "../../server/rpc-transport"

const logs = vi.spyOn(console, "error").mockImplementation(() => undefined)
afterEach(() => logs.mockClear())
function request(payload?: string, options?: RequestInit) {
  const url = new URL("http://localhost/_serverFn/existing")
  if (payload !== undefined) url.searchParams.set("payload", payload)
  return new Request(url, options)
}

test.each([
  "synthetic-private-token",
  '{"private":"synthetic-private-token"',
  JSON.stringify({ syntheticPrivate: "synthetic-private-token" }),
  JSON.stringify({ t: "synthetic-private-token", v: {}, f: 0, m: [] }),
])("transport invalide refusé sans détails sensibles", async (payload) => {
  const response = validateRpcGet(request(payload))
  expect(response?.status).toBe(400)
  const body = await response?.json()
  expect(body.code).toBe("HTTP_ERROR")
  expect(body.incidentId).toMatch(/^[a-f0-9-]{36}$/)
  expect(JSON.stringify(body)).not.toContain("synthetic-private-token")
  expect(logs).toHaveBeenCalledExactlyOnceWith(body.code, body.incidentId)
})

test.each([
  undefined,
  "",
  JSON.stringify(
    toJSON(
      { data: undefined, context: {} },
      { plugins: defaultSerovalDeserializerPlugins }
    )
  ),
])("préserve les transports GET valides", (payload) => {
  expect(validateRpcGet(request(payload))).toBeUndefined()
  expect(logs).not.toHaveBeenCalled()
})

test("préserve la limite GET et ne lit pas le transport d'une autre méthode", () => {
  expect(validateRpcGet(request("x".repeat(1_000_001)))?.status).toBe(413)
  expect(
    validateRpcGet(request("synthetic-private-token", { method: "POST" }))
  ).toBeUndefined()
})

test("refuse le FormData GET invalide avant son exception framework", () => {
  expect(
    validateRpcGet(
      request(undefined, { headers: { "content-type": "multipart/form-data" } })
    )?.status
  ).toBe(400)
})
