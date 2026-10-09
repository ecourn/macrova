/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test"
import { convexTest } from "convex-test"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { internal } from "./_generated/api"
import {
  GLOBAL_HOURLY_BUDGET,
  PURGE_BATCH,
  RETENTION_MS,
  summary,
} from "./calculatorMeasurements"
import schema from "./schema"
const modules = import.meta.glob("./**/*.ts")
function setup() {
  const t = convexTest(schema, modules)
  rateLimiterTest.register(t)
  return t
}
const event = (id: string = crypto.randomUUID(), occurredAt = Date.now()) => ({
  version: 1 as const,
  eventId: id,
  occurredAt,
  type: "calculator_completed" as const,
})
const summaryArgs = (asOf = Date.now(), cursor: string | null = null) => ({
  asOf,
  paginationOpts: { numItems: 100, cursor },
})
beforeEach(() => {
  vi.useFakeTimers()
  vi.stubEnv("SITE_URL", "http://localhost:3000")
  vi.stubEnv("BETTER_AUTH_SECRET", "synthetic-test-only-secret-for-http")
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})
test("retries concurrents : une enveloppe, collision refusée et rétention serveur", async () => {
  const t = setup()
  const input = event()
  const results = await Promise.all(
    Array.from({ length: 5 }, () =>
      t.mutation(internal.calculatorMeasurements.collect, { event: input })
    )
  )
  expect(results.filter((result) => result.status === "accepted")).toHaveLength(
    1
  )
  expect(
    results.filter((result) => result.status === "duplicate")
  ).toHaveLength(4)
  expect(
    await t.mutation(internal.calculatorMeasurements.collect, {
      event: { ...input, occurredAt: input.occurredAt + 1 },
    })
  ).toEqual({ status: "collision" })
  const rows = await t.run((ctx) =>
    ctx.db.query("calculatorMeasurements").take(10)
  )
  expect(rows).toHaveLength(1)
  expect(rows[0].expiresAt - rows[0].receivedAt).toBe(RETENTION_MS)
  expect(
    await t.query(internal.calculatorMeasurements.summary, summaryArgs())
  ).toMatchObject({ count: 1, isDone: true })
})
test("refus transport fermé et horloges hostiles sans écriture", async () => {
  const t = setup()
  for (const patch of [
    { profile: {} },
    { ownerId: "owner" },
    { macros: {} },
    { version: 2 },
    { type: "other" },
  ]) {
    await expect(
      t.mutation(internal.calculatorMeasurements.collect, {
        event: { ...event(), ...patch } as ReturnType<typeof event>,
      })
    ).rejects.toThrow()
  }
  for (const input of [
    event(""),
    event("mail@example.com"),
    event(undefined, -1),
    event(undefined, Number.NaN),
    event(undefined, Date.now() - 86400001),
    event(undefined, Date.now() + 300001),
    { ...event(), type: "demo_completed" as const },
  ]) {
    expect(
      await t.mutation(internal.calculatorMeasurements.collect, {
        event: input,
      })
    ).toEqual({ status: "invalid" })
  }
  expect(
    await t.query(internal.calculatorMeasurements.summary, summaryArgs())
  ).toMatchObject({ count: 0 })
})
test("quota global transactionnel, reprise à la fenêtre suivante", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(3600000)
  const t = setup()
  for (let i = 0; i < GLOBAL_HOURLY_BUDGET - 1; i += 1) {
    expect(
      (
        await t.mutation(internal.calculatorMeasurements.collect, {
          event: event(),
        })
      ).status
    ).toBe("accepted")
  }
  const results = await Promise.all([
    t.mutation(internal.calculatorMeasurements.collect, { event: event() }),
    t.mutation(internal.calculatorMeasurements.collect, { event: event() }),
  ])
  expect(results.map((result) => result.status).sort()).toEqual([
    "accepted",
    "limited",
  ])
  expect(
    (
      await t.fetch("/measurements/calculator", {
        method: "POST",
        body: JSON.stringify(event()),
      })
    ).status
  ).toBe(429)
  vi.setSystemTime(7200000)
  expect(
    (
      await t.mutation(internal.calculatorMeasurements.collect, {
        event: event(),
      })
    ).status
  ).toBe("accepted")
})
test("expiration exacte, bilan excluant les expirés et rattrapage > lot", async () => {
  vi.useFakeTimers()
  const now = 1800000000000
  vi.setSystemTime(now)
  const t = setup()
  const input = event(undefined, now + 300000)
  await t.mutation(internal.calculatorMeasurements.collect, { event: input })
  expect(
    await t.query(
      internal.calculatorMeasurements.summary,
      summaryArgs(now + RETENTION_MS - 1)
    )
  ).toMatchObject({ count: 1 })
  expect(
    await t.query(
      internal.calculatorMeasurements.summary,
      summaryArgs(now + RETENTION_MS)
    )
  ).toMatchObject({ count: 0 })
  const row = await t.run((ctx) =>
    ctx.db.query("calculatorMeasurements").first()
  )
  if (!row) throw new Error("Missing measurement")
  const scheduled = await t.run((ctx) =>
    ctx.db.system.query("_scheduled_functions").take(1)
  )
  expect(scheduled[0].scheduledTime).toBe(now + RETENTION_MS)
  vi.setSystemTime(now + RETENTION_MS)
  await t.mutation(internal.calculatorMeasurements.expire, { id: row._id })
  expect(
    await t.run((ctx) => ctx.db.query("calculatorMeasurements").take(1))
  ).toHaveLength(0)
  await t.run(async (ctx) => {
    for (let i = 0; i < PURGE_BATCH + 7; i += 1)
      await ctx.db.insert("calculatorMeasurements", {
        ...event(),
        receivedAt: now,
        expiresAt: now + RETENTION_MS,
      })
  })
  expect(await t.mutation(internal.calculatorMeasurements.purge, {})).toBe(
    PURGE_BATCH
  )
  await t.finishAllScheduledFunctions(() => {
    vi.advanceTimersByTime(1)
  })
  expect(
    await t.run((ctx) => ctx.db.query("calculatorMeasurements").take(1))
  ).toHaveLength(0)
})
test("HTTP public minimal, champs privés et bilan inaccessible avec ou sans identité", async () => {
  const t = setup()
  expect(summary.isInternal).toBe(true)
  const response = await t.fetch("/measurements/calculator", {
    method: "POST",
    body: JSON.stringify(event()),
  })
  expect(response.status).toBe(200)
  const same = event()
  expect(
    (
      await t.fetch("/measurements/calculator", {
        method: "POST",
        body: JSON.stringify(same),
      })
    ).status
  ).toBe(200)
  expect(
    (
      await t.fetch("/measurements/calculator", {
        method: "POST",
        body: JSON.stringify({ ...same, occurredAt: same.occurredAt + 1 }),
      })
    ).status
  ).toBe(409)
  expect(
    (
      await t.fetch("/measurements/calculator", {
        method: "POST",
        body: JSON.stringify(event(undefined, Date.now() + 300001)),
      })
    ).status
  ).toBe(400)
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*")
  expect(
    (
      await t.fetch("/measurements/calculator", {
        method: "POST",
        body: JSON.stringify({ ...event(), profile: { weight: 70 } }),
      })
    ).status
  ).toBe(400)
  expect(
    (
      await t.fetch("/measurements/calculator", {
        method: "POST",
        body: "x".repeat(1025),
      })
    ).status
  ).toBe(413)
  for (const client of [
    t,
    t.withIdentity({ subject: "test", issuer: "https://test.example" }),
  ]) {
    // Le transport public refuse une fonction dont la visibilité est internal.
    const result = await client.fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({
        path: "calculatorMeasurements:summary",
        args: summaryArgs(),
        format: "json",
      }),
    })
    expect(result.status).toBeGreaterThanOrEqual(400)
  }
})

test("bilan borné paginé, seulement les événements non expirés", async () => {
  const t = setup()
  const now = Date.now()
  await t.run(async (ctx) => {
    for (let i = 0; i < 105; i += 1)
      await ctx.db.insert("calculatorMeasurements", {
        ...event(),
        receivedAt: now,
        expiresAt: now + RETENTION_MS,
      })
    await ctx.db.insert("calculatorMeasurements", {
      ...event(),
      receivedAt: now - RETENTION_MS,
      expiresAt: now,
    })
  })
  const first = await t.query(
    internal.calculatorMeasurements.summary,
    summaryArgs(now)
  )
  expect(first.count).toBe(100)
  expect(first.isDone).toBe(false)
  const last = await t.query(
    internal.calculatorMeasurements.summary,
    summaryArgs(now, first.continueCursor)
  )
  expect(last).toMatchObject({ count: 5, isDone: true })
  await expect(
    t.query(internal.calculatorMeasurements.summary, {
      asOf: now,
      paginationOpts: { numItems: 101, cursor: null },
    })
  ).rejects.toThrow("Invalid summary bounds")
})
