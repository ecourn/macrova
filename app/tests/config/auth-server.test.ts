// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest"
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => new Headers({ cookie: "synthetic-session" }),
}))
import { getToken, handler } from "../../src/lib/auth-server"
import { BackendUnavailableError } from "../../src/lib/server-errors"

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

test.each(["", " \t\n", null, 123, {}, []])(
  "JWT SSR : token malformé %j refusé",
  async (token) => {
    configure()
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ token })))
    await expect(getToken()).rejects.toBeInstanceOf(BackendUnavailableError)
  }
)

test("JWT SSR : JSON invalide et panne transport sanitizés", async () => {
  configure()
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(new Response("sensitive-invalid-json"))
      .mockRejectedValueOnce(new Error("sensitive-transport"))
  )
  await expect(getToken()).rejects.toThrow("UNAVAILABLE")
  await expect(getToken()).rejects.toThrow("UNAVAILABLE")
})

test.each([500, 503])(
  "relais : HTTP %s sanitizé, corps et en-têtes backend supprimés",
  async (status) => {
    configure()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("sensitive-body", {
          status,
          headers: {
            "x-backend-detail": "sensitive-header",
            "set-cookie": "sensitive-cookie",
            location: "https://sensitive.example/",
          },
        })
      )
    )
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const response = await handler(
      new Request("https://macrova-test.example/api/auth/get-session")
    )
    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body).toEqual({
      code: "UNAVAILABLE",
      incidentId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      ),
    })
    expect([...response.headers.keys()]).toEqual(["content-type"])
    expect(log.mock.calls).toEqual([["UNAVAILABLE", body.incidentId]])
  }
)

test.each([200, 302, 400, 401])(
  "relais : réponse SDK HTTP %s préservée intégralement",
  async (status) => {
    configure()
    const upstream = new Response("synthetic-business-body", {
      status,
      headers: {
        "set-cookie": "synthetic-cookie; HttpOnly",
        location: "https://macrova-test.example/account",
        "x-business-detail": "synthetic-detail",
      },
    })
    const fetchMock = vi.fn().mockResolvedValue(upstream)
    vi.stubGlobal("fetch", fetchMock)
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const response = await handler(
      new Request("https://macrova-test.example/api/auth/get-session")
    )
    expect(response).toBe(upstream)
    expect(await response.text()).toBe("synthetic-business-body")
    expect(response.headers.get("set-cookie")).toBe(
      "synthetic-cookie; HttpOnly"
    )
    expect(response.headers.get("location")).toBe(
      "https://macrova-test.example/account"
    )
    expect(fetchMock.mock.calls[0][1].redirect).toBe("manual")
    expect(log).not.toHaveBeenCalled()
  }
)

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
