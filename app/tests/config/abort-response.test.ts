// @vitest-environment node
import { expect, test, vi } from "vitest"
import plugin from "../../server/abort-response"
import { runtimeErrorResponse } from "../../server/error-handler"

test("un abandon garde sa propagation avec une Response safe avant le middleware Start", async () => {
  const logs = vi.spyOn(console, "error").mockImplementation(() => undefined)
  const source = new AbortController()
  let normalized: Request | undefined
  const app = {
    fetch: (request: Request) => {
      normalized = request
      return Response.json({ ok: true })
    },
    hooks: undefined as never,
  }
  plugin(app)
  try {
    await app.fetch(
      new Request("http://localhost/api/auth/sign-up/email", {
        signal: source.signal,
      })
    )
    const original = Object.assign(new Error("sensitive-password"), {
      code: "ECONNRESET",
      cause: "sensitive-token",
    })
    source.abort(original)
    expect(normalized?.signal.aborted).toBe(true)
    const reason = normalized?.signal.reason
    expect(reason).toBeInstanceOf(Response)
    expect(reason.status).toBe(500)
    const body = await reason.clone().json()
    expect(body.code).toBe("ECONNRESET")
    expect(JSON.stringify(logs.mock.calls)).not.toContain("sensitive-password")
    expect(logs).toHaveBeenCalledExactlyOnceWith(body.code, body.incidentId)
    // handleResponseError de Start préserve une Response rejetée.
    expect(runtimeErrorResponse(reason)).toBe(reason)
  } finally {
    logs.mockRestore()
  }
})

test("un signal déjà abandonné reste abandonné à l'entrée Start", async () => {
  const logs = vi.spyOn(console, "error").mockImplementation(() => undefined)
  const source = new AbortController()
  source.abort(Object.assign(new Error("aborted"), { code: "ECONNRESET" }))
  const app = {
    fetch: (request: Request) => {
      request.signal.throwIfAborted()
      return Response.json({ ok: true })
    },
    hooks: undefined as never,
  }
  plugin(app)
  try {
    expect(() =>
      app.fetch(
        new Request("http://localhost/login", { signal: source.signal })
      )
    ).toThrow(Response)
  } finally {
    logs.mockRestore()
  }
})
