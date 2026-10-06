// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest"
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => new Headers({ cookie: "synthetic-session" }),
}))
import { getToken, handler } from "../../src/lib/auth-server"
import { BackendUnavailableError } from "../../src/lib/server-errors"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function configure() {
  vi.stubEnv("VITE_CONVEX_URL", "https://test.convex.cloud")
  vi.stubEnv("VITE_CONVEX_SITE_URL", "https://test.convex.site")
}

test("JWT SSR : seule une réponse 401 signifie session absente", async () => {
  configure()
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
  )
  expect(await getToken()).toBeNull()
})

test.each([403, 429, 500, 503])(
  "JWT SSR : HTTP %s reste une panne sans fuite",
  async (status) => {
    configure()
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("sensitive-backend-body", { status }))
    )
    await expect(getToken()).rejects.toBeInstanceOf(BackendUnavailableError)
    await expect(getToken()).rejects.toThrow("UNAVAILABLE")
  }
)

test("JWT SSR : réponse valide conservée, format invalide refusé", async () => {
  configure()
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ token: "synthetic-jwt" }))
    .mockResolvedValueOnce(Response.json({ message: "sensitive" }))
  vi.stubGlobal("fetch", fetchMock)
  expect(await getToken()).toBe("synthetic-jwt")
  await expect(getToken()).rejects.toBeInstanceOf(BackendUnavailableError)
})

test("relais : panne réseau explicite, logs sans credentials", async () => {
  configure()
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new Error("private-password-and-jwt"))
  )
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined)
  try {
    const response = await handler(
      new Request("https://macrova-test.example/api/auth/get-session")
    )
    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body.code).toBe("UNAVAILABLE")
    expect(JSON.stringify(body)).not.toContain("private-password-and-jwt")
    expect(log).toHaveBeenCalledWith("UNAVAILABLE", body.incidentId)
  } finally {
    log.mockRestore()
  }
})
