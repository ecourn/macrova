// @vitest-environment node
import { HTTPError } from "nitro"
import { afterEach, expect, test, vi } from "vitest"
import handler from "../../server/error-handler"

const log = vi.spyOn(console, "error").mockImplementation(() => undefined)
afterEach(() => log.mockClear())

async function handle(error: HTTPError) {
  // Le handler ne lit ni événement ni rendu fallback.
  const response = await handler(error, undefined as never, undefined as never)
  expect(response).toBeInstanceOf(Response)
  const result = response as Response
  const body = await result.json()
  expect(body.incidentId).toMatch(/^[a-f0-9-]{36}$/)
  expect(log).toHaveBeenCalledExactlyOnceWith(body.code, body.incidentId)
  return { result, body }
}

test.each([401, 404, 503])(
  "conserve HTTP %s sans message, cause, payload ni headers sensibles",
  async (status) => {
    const secret = "private-password-and-jwt"
    const error = new HTTPError({
      status,
      statusText: secret,
      message: secret,
      cause: new Error(secret),
      data: { token: secret },
      headers: { "x-secret": secret },
    })
    const { result, body } = await handle(error)
    expect(result.status).toBe(status)
    expect(body.code).toBe(status >= 500 ? "UNAVAILABLE" : "HTTP_ERROR")
    expect(JSON.stringify(body)).not.toContain(secret)
    expect(JSON.stringify(log.mock.calls)).not.toContain(secret)
    expect(result.headers.get("x-secret")).toBeNull()
  }
)

test("aborted avec ECONNRESET devient un code technique sans cause ni stack", async () => {
  const aborted = new Error("aborted", {
    cause: Object.assign(new Error("sensitive-request"), {
      code: "ECONNRESET",
    }),
  })
  const { result, body } = await handle(
    new HTTPError({ status: 500, cause: aborted })
  )
  expect(result.status).toBe(500)
  expect(body.code).toBe("ECONNRESET")
  expect(JSON.stringify(log.mock.calls)).not.toContain("sensitive-request")
  expect(body).not.toHaveProperty("cause")
  expect(body).not.toHaveProperty("stack")
})

test("un code libre et un status invalide ne sont pas propagés", async () => {
  const error = new HTTPError({
    status: 500,
    cause: { code: "sensitive-token" },
  })
  Object.assign(error, { status: 700 })
  const { result, body } = await handle(error)
  expect(result.status).toBe(500)
  expect(body.code).toBe("UNAVAILABLE")
})
