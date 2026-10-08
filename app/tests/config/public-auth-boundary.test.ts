// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router"
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (callback: unknown) => callback }),
}))
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => new Headers({ cookie: "synthetic-session" }),
}))
import {
  hasRenderedAuthRoute,
  loadRootAuthContext,
} from "../../src/lib/public-auth-boundary"

beforeEach(() => {
  vi.stubEnv("VITE_CONVEX_URL", "https://test.convex.cloud")
  vi.stubEnv("VITE_CONVEX_SITE_URL", "https://test.convex.site")
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
function routerAt(initialPath: string, calculatorLoader?: () => Promise<void>) {
  const root = createRootRoute({
    beforeLoad: ({ location }) => loadRootAuthContext(location.pathname),
  })
  const children = ["/", "/login", "/dashboard", "/calculateur"].map((path) =>
    createRoute({
      getParentRoute: () => root,
      path,
      ...(path === "/calculateur" && calculatorLoader
        ? { loader: calculatorLoader }
        : {}),
    })
  )
  return createRouter({
    routeTree: root.addChildren(children),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    isServer: false,
    origin: "http://localhost",
    defaultPendingMs: 60_000,
  })
}
test.each(["/dashboard/", "/login/"])(
  "slash final %s : vrai pont auth et matches privés",
  async (path) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ token: "synthetic-jwt" }))
    vi.stubGlobal("fetch", fetchMock)
    const router = routerAt(path)
    await router.load()
    expect(router.state.matches[0].context).toMatchObject({
      token: "synthetic-jwt",
    })
    expect(hasRenderedAuthRoute(router.state.matches)).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://test.convex.site/api/auth/convex/token"
    )
  }
)
test.each(["/", "/calculateur", "/calculateur/"])(
  "entrée publique %s : aucune lecture auth ni provider",
  async (path) => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new Error("backend-unavailable"))
    vi.stubGlobal("fetch", fetchMock)
    const router = routerAt(path)
    await router.load()
    expect(hasRenderedAuthRoute(router.state.matches)).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  }
)
test("transition privée vers public : provider conservé tant que les matches privés restent rendus", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(Response.json({ token: "synthetic-jwt" }))
  vi.stubGlobal("fetch", fetchMock)
  let release: (() => void) | undefined
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  let entered: (() => void) | undefined
  const loading = new Promise<void>((resolve) => {
    entered = resolve
  })
  const router = routerAt("/dashboard", async () => {
    entered?.()
    await pending
  })
  await router.load()
  const navigation = router.navigate({ to: "/calculateur" })
  await loading
  expect(router.state.location.pathname).toBe("/calculateur")
  expect(
    router.state.matches.some((match) => match.routeId === "/dashboard")
  ).toBe(true)
  expect(hasRenderedAuthRoute(router.state.matches)).toBe(true)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  release?.()
  await navigation
  expect(hasRenderedAuthRoute(router.state.matches)).toBe(false)
  expect(
    router.state.matches.some((match) => match.routeId === "/calculateur")
  ).toBe(true)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
