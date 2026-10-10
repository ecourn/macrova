/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import betterAuth from "@convex-dev/better-auth/test"
import rateLimiterTest from "@convex-dev/rate-limiter/test"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { ConvexError } from "convex/values"
import { api, components, internal } from "./_generated/api"
import { authComponent } from "./auth"
import schema from "./schema"
import {
  OFF_API_VERSION,
  OFF_ENDPOINT,
  TRANSIENT_TTL_MS,
} from "../src/domain/catalogue"
const modules = import.meta.glob("./**/*.ts")
beforeEach(() => {
  vi.stubEnv("SITE_URL", "http://localhost:3000")
  vi.stubEnv("BETTER_AUTH_SECRET", "synthetic-test-only-secret")
  vi.stubEnv("OFF_SEARCH_ENDPOINT", OFF_ENDPOINT)
  vi.stubEnv("OFF_SEARCH_API_VERSION", OFF_API_VERSION)
  vi.stubEnv("OFF_USER_AGENT", "Macrova/1 (https://github.com/ecourn/macrova)")
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})
async function fixture() {
  const t = convexTest(schema, modules)
  betterAuth.register(t)
  rateLimiterTest.register(t)
  async function account(name: string) {
    const now = Date.now()
    const user = await t.mutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          name,
          email: `${name}@example.test`,
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        },
      },
    })
    const session = await t.mutation(components.betterAuth.adapter.create, {
      input: {
        model: "session",
        data: {
          userId: user._id,
          token: name,
          expiresAt: now + 300000,
          createdAt: now,
          updatedAt: now,
        },
      },
    })
    const entitlement = await t.run((ctx) =>
      ctx.db.insert("entitlements", {
        ownerId: user._id,
        version: 1,
        enabled: true,
        validUntil: now + 300000,
      })
    )
    return {
      user,
      session,
      entitlement,
      client: t.withIdentity({ subject: user._id, sessionId: session._id }),
    }
  }
  return { t, a: await account("a"), b: await account("b") }
}
const empty = () => Response.json({ hits: [] })
function network() {
  const fetchMock = vi.fn().mockImplementation(async () => empty())
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}
async function alter(f: Awaited<ReturnType<typeof fixture>>, kind: string) {
  const { t, a } = f
  if (kind === "expired")
    await t.mutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "session",
        where: [{ field: "_id", value: a.session._id }],
        update: { expiresAt: Date.now() - 1 },
      },
    })
  if (kind === "revoked")
    await t.mutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "session",
        where: [{ field: "_id", value: a.session._id }],
      },
    })
  if (kind === "inactive")
    await t.run((ctx) =>
      ctx.db.patch("entitlements", a.entitlement, { enabled: false })
    )
  if (kind === "closed")
    await a.client.mutation(api.account.close, {
      confirmation: "CLOSE_ACCOUNT",
    })
}
const code = (kind: string) =>
  kind === "inactive"
    ? "ENTITLEMENT_REQUIRED"
    : kind === "closed"
      ? "ACCOUNT_CLOSED"
      : "UNAUTHENTICATED"
test("action minimale : zéro/absence sourcés, aucune donnée privée ; nouvelle soumission sans cache", async () => {
  const { a } = await fixture()
  const fetchMock = network()
  fetchMock.mockImplementation(async () =>
    Response.json({
      hits: [
        {
          code: "123456789",
          product_name_fr: "Riz",
          nutriments: { proteins_100g: 0 },
        },
      ],
    })
  )
  expect(
    await a.client.action(api.catalogue.search, { query: "riz" })
  ).toMatchObject({
    kind: "results",
    hits: [{ snapshot: { nutrition: { protein: "0", fat: null } } }],
  })
  await a.client.action(api.catalogue.search, { query: "riz" })
  expect(fetchMock).toHaveBeenCalledTimes(2)
  const [request, options] = fetchMock.mock.calls[0]
  expect(request.toString()).toContain(OFF_ENDPOINT)
  expect([...request.searchParams.keys()]).toEqual([
    "q",
    "page_size",
    "langs",
    "fields",
  ])
  expect(options).toMatchObject({
    credentials: "omit",
    redirect: "error",
    headers: {
      "User-Agent": "Macrova/1 (https://github.com/ecourn/macrova)",
      Accept: "application/json",
    },
  })
  expect(JSON.stringify(options)).not.toMatch(
    /cookie|authorization|ownerId|example.test/i
  )
})
test.each(["anonymous", "expired", "revoked", "inactive", "closed"])(
  "accès %s refusé avant réseau",
  async (kind) => {
    const f = await fixture()
    const fetchMock = network()
    await alter(f, kind)
    await expect(
      (kind === "anonymous" ? f.t : f.a.client).action(api.catalogue.search, {
        query: "riz",
      })
    ).rejects.toMatchObject({ data: { code: code(kind) } })
    expect(fetchMock).not.toHaveBeenCalled()
  }
)
test("panne backend originale et args privés refusés", async () => {
  const { a } = await fixture()
  const fetchMock = network()
  vi.spyOn(authComponent, "getAuthUser").mockRejectedValue(
    new ConvexError("backend unavailable")
  )
  await expect(
    a.client.action(api.catalogue.search, { query: "riz" })
  ).rejects.toMatchObject({ data: "backend unavailable" })
  await expect(
    a.client.action(api.catalogue.search, {
      query: "riz",
      ownerId: "private",
    } as { query: string })
  ).rejects.toThrow()
  expect(fetchMock).not.toHaveBeenCalled()
})
test("déduplication intercomptes durable : participants isolés, aucun cache après terminaison", async () => {
  const { t, a, b } = await fixture()
  const first = await a.client.mutation(internal.catalogueState.reserve, {
    key: "riz",
  })
  const second = await b.client.mutation(internal.catalogueState.reserve, {
    key: "riz",
  })
  if (first.kind !== "attached" || second.kind !== "attached")
    throw Error("attached")
  expect(first.leader).toBe(true)
  expect(second.leader).toBe(false)
  expect(second.jobId).toBe(first.jobId)
  await expect(
    b.client.mutation(internal.catalogueState.receive, {
      participantId: first.participantId,
      beforeNetwork: false,
    })
  ).rejects.toMatchObject({ data: { code: "ACCESS_DENIED" } })
  await t.mutation(internal.catalogueState.finish, {
    jobId: first.jobId,
    result: { kind: "results", hits: [], capturedAt: Date.now() },
    suspendUntil: null,
  })
  for (const [client, participantId] of [
    [a.client, first.participantId],
    [b.client, second.participantId],
  ] as const)
    expect(
      await client.mutation(internal.catalogueState.receive, {
        participantId,
        beforeNetwork: false,
      })
    ).toMatchObject({ kind: "results", hits: [] })
  expect(
    await a.client.mutation(internal.catalogueState.reserve, { key: "riz" })
  ).toMatchObject({ kind: "attached", leader: true })
  expect(
    await t.run((ctx) => ctx.db.query("catalogueJobs").take(10))
  ).toHaveLength(2)
})
test("deux actions réellement en vol : un fetch pour deux comptes", async () => {
  const { t, a, b } = await fixture()
  let release: (() => void) | undefined
  const hold = new Promise<void>((resolve) => {
    release = resolve
  })
  const fetchMock = network()
  fetchMock.mockImplementation(async () => {
    await hold
    return empty()
  })
  const first = a.client.action(api.catalogue.search, { query: "riz" })
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  const second = b.client.action(api.catalogue.search, { query: "riz" })
  await vi.waitFor(async () =>
    expect(
      await t.run((ctx) => ctx.db.query("catalogueParticipants").take(10))
    ).toHaveLength(2)
  )
  release?.()
  expect(await Promise.all([first, second])).toMatchObject([
    { kind: "results" },
    { kind: "results" },
  ])
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
test.each(["expired", "revoked", "inactive", "closed"])(
  "accès %s relu avant remise",
  async (kind) => {
    const f = await fixture()
    const fetchMock = network()
    fetchMock.mockImplementation(async () => {
      await alter(f, kind)
      return empty()
    })
    await expect(
      f.a.client.action(api.catalogue.search, { query: "riz" })
    ).rejects.toMatchObject({ data: { code: code(kind) } })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
)
test("quota partagé : échecs consomment leur réservation, neuvième refusée, frontière glissante", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(59999)
  const { a, b } = await fixture()
  const fetchMock = network()
  fetchMock.mockRejectedValue(new Error("source unavailable"))
  for (let index = 0; index < 8; index++)
    expect(
      await (index % 2 ? a : b).client.action(api.catalogue.search, {
        query: `riz ${index}`,
      })
    ).toEqual({ kind: "unavailable", reason: "NETWORK_ERROR" })
  vi.setSystemTime(60001)
  expect(
    await a.client.action(api.catalogue.search, { query: "neuvième" })
  ).toMatchObject({ kind: "limited", retryAt: 119999 })
  expect(fetchMock).toHaveBeenCalledTimes(8)
  vi.setSystemTime(120001)
  expect(
    await a.client.action(api.catalogue.search, { query: "reprise" })
  ).toMatchObject({ kind: "unavailable" })
  expect(fetchMock).toHaveBeenCalledTimes(9)
})
test.each([429, 503])(
  "HTTP %s : suspension globale, sans retry, jamais raccourcie, nettoyage borné",
  async (status) => {
    vi.useFakeTimers()
    vi.setSystemTime(1800000000000)
    const { t, a, b } = await fixture()
    const fetchMock = network()
    fetchMock.mockResolvedValue(
      new Response("", { status, headers: { "Retry-After": "120" } })
    )
    const retryAt = Date.now() + 120000
    expect(
      await a.client.action(api.catalogue.search, { query: "riz" })
    ).toEqual({ kind: "suspended", retryAt })
    expect(
      await b.client.action(api.catalogue.search, { query: "pâtes" })
    ).toEqual({ kind: "suspended", retryAt })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const job = await t.run((ctx) => ctx.db.query("catalogueJobs").first())
    if (!job) throw Error("job")
    await t.mutation(internal.catalogueState.finish, {
      jobId: job._id,
      result: { kind: "unavailable", reason: "LATE" },
      suspendUntil: Date.now() + 60000,
    })
    expect(
      (await t.run((ctx) => ctx.db.query("catalogueSuspensions").first()))
        ?.until
    ).toBe(retryAt)
    vi.setSystemTime(job.startedAt + TRANSIENT_TTL_MS)
    await t.mutation(internal.catalogueState.expire, { jobId: job._id })
    expect(await t.run((ctx) => ctx.db.query("catalogueJobs").take(1))).toEqual(
      []
    )
    expect(
      await t.run((ctx) => ctx.db.query("catalogueParticipants").take(1))
    ).toEqual([])
  }
)
test.each([
  [() => new Response("{", { status: 200 }), "MALFORMED_RESPONSE"],
  [() => new Response("", { status: 502 }), "HTTP_502"],
  [() => new Response("x".repeat(256001)), "RESPONSE_TOO_LARGE"],
])("pannes HTTP/JSON/taille distinctes", async (response, reason) => {
  const { a } = await fixture()
  const fetchMock = network()
  fetchMock.mockImplementation(async () => response())
  expect(await a.client.action(api.catalogue.search, { query: "riz" })).toEqual(
    { kind: "unavailable", reason }
  )
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
test("configuration fermée sans endpoint de repli", async () => {
  const { a } = await fixture()
  vi.stubEnv("OFF_SEARCH_ENDPOINT", "https://evil.example/search")
  const fetchMock = network()
  expect(await a.client.action(api.catalogue.search, { query: "riz" })).toEqual(
    { kind: "unavailable", reason: "CONFIGURATION" }
  )
  expect(fetchMock).not.toHaveBeenCalled()
})
test("timeout borné sans retry automatique et réservation consommée", async () => {
  vi.useFakeTimers()
  const { t, a } = await fixture()
  const fetchMock = network()
  fetchMock.mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () =>
          reject(new Error("aborted"))
        )
      })
  )
  const pending = a.client.action(api.catalogue.search, { query: "riz" })
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  await vi.advanceTimersByTimeAsync(15000)
  expect(await pending).toEqual({ kind: "unavailable", reason: "TIMEOUT" })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(
    await t.run((ctx) => ctx.db.query("catalogueJobs").take(10))
  ).toHaveLength(1)
})
test("suspension ajoutée entre réservation et fetch : garde commune empêche le réseau", async () => {
  const { t, a } = await fixture()
  const reservation = await a.client.mutation(internal.catalogueState.reserve, {
    key: "riz",
  })
  if (reservation.kind !== "attached") throw Error("attached")
  const retryAt = Date.now() + 60000
  await t.run((ctx) =>
    ctx.db.insert("catalogueSuspensions", { key: "off", until: retryAt })
  )
  expect(
    await a.client.mutation(internal.catalogueState.receive, {
      participantId: reservation.participantId,
      beforeNetwork: true,
    })
  ).toEqual({ kind: "suspended", retryAt })
})
