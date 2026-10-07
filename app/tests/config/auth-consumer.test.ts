// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest"

// Seule la plomberie des fonctions serveur est isolée ; leurs callbacks,
// le pont auth et ConvexHttpClient restent ceux de l'application.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (callback: unknown) => callback }),
}))
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => new Headers({ cookie: "synthetic-session" }),
}))
import { getCurrentUser } from "../../src/lib/auth.functions"
import { BackendUnavailableError } from "../../src/lib/server-errors"

beforeEach(() => {
  vi.stubEnv("VITE_CONVEX_URL", "https://test.convex.cloud")
  vi.stubEnv("VITE_CONVEX_SITE_URL", "https://test.convex.site")
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

test("consommateur SSR : 401 reste anonyme sans query privée", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 401 }))
  vi.stubGlobal("fetch", fetchMock)
  expect(await getCurrentUser()).toBeNull()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock.mock.calls[0][0]).toBe(
    "https://test.convex.site/api/auth/convex/token"
  )
})

test.each([
  ["token vide", () => Response.json({ token: "" })],
  ["token blanc", () => Response.json({ token: " \t\n" })],
  ["token non-string", () => Response.json({ token: 123 })],
  ["JSON invalide", () => new Response("sensitive-invalid-json")],
  ["HTTP 503", () => new Response("sensitive-http-body", { status: 503 })],
])("consommateur SSR : %s rejette sans query", async (_label, response) => {
  const fetchMock = vi.fn().mockResolvedValue(response())
  vi.stubGlobal("fetch", fetchMock)
  await expect(getCurrentUser()).rejects.toBeInstanceOf(BackendUnavailableError)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

function authenticatedFetch(queryResponse: () => Response) {
  const fetchMock = vi.fn().mockImplementation(async (url: string) => {
    if (url === "https://test.convex.site/api/auth/convex/token") {
      return Response.json({ token: "synthetic-jwt" })
    }
    if (url === "https://test.convex.cloud/api/query") return queryResponse()
    throw new Error("unexpected synthetic endpoint")
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

test("consommateur SSR : résultat et Authorization du vrai client préservés", async () => {
  const user = { name: "Synthetic user", _id: "synthetic-user-id" }
  const fetchMock = authenticatedFetch(() =>
    Response.json({ status: "success", value: user })
  )
  expect(await getCurrentUser()).toEqual(user)
  expect(fetchMock).toHaveBeenCalledTimes(3)
  expect(fetchMock.mock.calls[2][1]).toMatchObject({
    method: "POST",
    headers: { Authorization: "Bearer synthetic-jwt" },
  })
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({
    path: "auth:getCurrentUser",
    args: [{}],
  })
})

test.each([
  ["HTTP", () => new Response("sensitive-http-body", { status: 503 })],
  [
    "Convex avec données et logs",
    () =>
      Response.json({
        status: "error",
        errorMessage: "sensitive-error-message",
        errorData: { private: "sensitive-error-data" },
        logLines: ["[ERROR] sensitive-convex-log"],
      }),
  ],
])("consommateur SSR : erreur query %s sanitizée", async (_label, response) => {
  const logs = ["log", "info", "warn", "error", "debug"] as const
  const spies = logs.map((method) =>
    vi.spyOn(console, method).mockImplementation(() => undefined)
  )
  const fetchMock = authenticatedFetch(response)
  const error = await getCurrentUser().then(
    () => {
      throw new Error("query should reject")
    },
    (failure: unknown) => failure
  )
  expect(error).toBeInstanceOf(BackendUnavailableError)
  expect(error).toMatchObject({
    message: "UNAVAILABLE",
    code: "UNAVAILABLE",
    incidentId: expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    ),
  })
  expect(Object.keys(error as object).sort()).toEqual([
    "code",
    "incidentId",
    "name",
  ])
  expect(error).not.toHaveProperty("cause")
  expect(error).not.toHaveProperty("data")
  expect(String(error)).not.toContain("sensitive")
  expect(JSON.stringify(error)).not.toContain("sensitive")
  expect(fetchMock).toHaveBeenCalledTimes(3)
  for (const spy of spies) expect(spy).not.toHaveBeenCalled()
})
