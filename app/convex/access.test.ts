/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import betterAuth from "@convex-dev/better-auth/test"
import { makeFunctionReference } from "convex/server"
import { ConvexError } from "convex/values"
import { expect, test, vi } from "vitest"
import { api, components } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { authComponent } from "./auth"
import schema from "./schema"
const modules = {
  ...import.meta.glob("./**/*.ts"),
  "./syntheticAccess.ts": () => import("../tests/fixtures/access-functions"),
}
const read = makeFunctionReference<
  "query",
  { referenceId: Id<"entitlements"> }
>("syntheticAccess:readReference")
const write = makeFunctionReference<
  "mutation",
  { referenceId: Id<"entitlements"> }
>("syntheticAccess:personalWrite")
const delayed = makeFunctionReference<
  "mutation",
  { referenceId: Id<"entitlements">; create: boolean }
>("syntheticAccess:delayedWrite")
async function fixture() {
  const t = convexTest(schema, modules)
  betterAuth.register(t)
  const now = Date.now()
  async function account(name: string) {
    const user = await t.mutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          name,
          email: `${name}@example.com`,
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
          expiresAt: now + 60_000,
          createdAt: now,
          updatedAt: now,
        },
      },
    })
    const client = t.withIdentity({ subject: user._id, sessionId: session._id })
    const referenceId = await t.run((ctx) =>
      ctx.db.insert("entitlements", {
        ownerId: user._id,
        version: 1,
        enabled: true,
        validUntil: now + 60_000,
      })
    )
    return { user, session, client, referenceId }
  }
  return { t, a: await account("a"), b: await account("b") }
}
async function denied(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({
    data: { code, fields: expect.any(Array), retryable: false },
  })
}
test("références privées : propriété vérifiée également par ID", async () => {
  const { t, a, b } = await fixture()
  expect(
    await a.client.query(read, { referenceId: a.referenceId })
  ).toMatchObject({ ownerId: a.user._id })
  expect(
    await b.client.query(read, { referenceId: b.referenceId })
  ).toMatchObject({ ownerId: b.user._id })
  await denied(
    a.client.query(read, { referenceId: b.referenceId }),
    "ACCESS_DENIED"
  )
  await denied(
    b.client.query(read, { referenceId: a.referenceId }),
    "ACCESS_DENIED"
  )
  await denied(
    a.client.mutation(write, { referenceId: b.referenceId }),
    "ACCESS_DENIED"
  )
  await t.run((ctx) => ctx.db.delete("entitlements", b.referenceId))
  await denied(
    b.client.query(read, { referenceId: b.referenceId }),
    "NOT_FOUND"
  )
})
test.each(["anonymous", "expired", "revoked"])(
  "session %s : lecture, écriture et fermeture refusées",
  async (kind) => {
    const { t, a } = await fixture()
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
    const client = kind === "anonymous" ? t : a.client
    await denied(client.query(api.account.getAccess), "UNAUTHENTICATED")
    await denied(
      client.query(read, { referenceId: a.referenceId }),
      "UNAUTHENTICATED"
    )
    await denied(
      client.mutation(write, { referenceId: a.referenceId }),
      "UNAUTHENTICATED"
    )
    await denied(
      client.mutation(api.account.close, { confirmation: "CLOSE_ACCOUNT" }),
      "UNAUTHENTICATED"
    )
  }
)
test.each([
  "absent",
  "disabled",
  "expired",
  "boundary",
  "invalid",
  "unknown-version",
])(
  "droit %s : état lisible, écriture refusée, fermeture accessible",
  async (kind) => {
    const { t, a } = await fixture()
    const now = Date.now()
    vi.spyOn(Date, "now").mockReturnValue(now)
    try {
      await t.run(async (ctx) => {
        if (kind === "absent")
          await ctx.db.delete("entitlements", a.referenceId)
        else
          await ctx.db.patch("entitlements", a.referenceId, {
            enabled: kind !== "disabled",
            validUntil:
              kind === "invalid"
                ? NaN
                : kind === "expired"
                  ? now - 1
                  : kind === "boundary"
                    ? now
                    : now + 1000,
            version: kind === "unknown-version" ? 2 : 1,
          })
      })
      expect(
        (await a.client.query(api.account.getAccess)).entitlement === null
      ).toBe(kind === "absent")
      await denied(
        a.client.mutation(write, { referenceId: a.referenceId }),
        "ENTITLEMENT_REQUIRED"
      )
      expect(
        await a.client.mutation(api.account.close, {
          confirmation: "CLOSE_ACCOUNT",
        })
      ).toEqual({ closedAt: now })
    } finally {
      vi.restoreAllMocks()
    }
  }
)
test("droit actif puis fermeture durable idempotente", async () => {
  const { t, a, b } = await fixture()
  await a.client.mutation(write, { referenceId: a.referenceId })
  const first = await a.client.mutation(api.account.close, {
    confirmation: "CLOSE_ACCOUNT",
  })
  expect(
    await a.client.mutation(api.account.close, {
      confirmation: "CLOSE_ACCOUNT",
    })
  ).toEqual(first)
  expect((await a.client.query(api.account.getAccess)).closure).toEqual(first)
  expect((await b.client.query(api.account.getAccess)).closure).toBeNull()
  await denied(
    a.client.mutation(write, { referenceId: a.referenceId }),
    "ACCOUNT_CLOSED"
  )
  expect(
    await t.run((ctx) => ctx.db.query("accountClosures").take(10))
  ).toHaveLength(1)
})
test("confirmation distincte requise", async () => {
  const { a } = await fixture()
  await expect(
    a.client.mutation(api.account.close, {
      confirmation: "wrong" as "CLOSE_ACCOUNT",
    })
  ).rejects.toThrow()
  expect((await a.client.query(api.account.getAccess)).closure).toBeNull()
})
test("travail interne : aucune recréation ou modification après fermeture et suppression auth", async () => {
  const { t, a } = await fixture()
  await t.mutation(delayed, { referenceId: a.referenceId, create: false })
  await a.client.mutation(api.account.close, { confirmation: "CLOSE_ACCOUNT" })
  await t.mutation(components.betterAuth.adapter.deleteOne, {
    input: { model: "user", where: [{ field: "_id", value: a.user._id }] },
  })
  const before = await t.run((ctx) => ctx.db.query("entitlements").take(10))
  await denied(
    t.mutation(delayed, { referenceId: a.referenceId, create: false }),
    "ACCOUNT_CLOSED"
  )
  await denied(
    t.mutation(delayed, { referenceId: a.referenceId, create: true }),
    "ACCOUNT_CLOSED"
  )
  expect(await t.run((ctx) => ctx.db.query("entitlements").take(10))).toEqual(
    before
  )
  expect(
    await t.run((ctx) => ctx.db.query("accountClosures").take(10))
  ).toHaveLength(1)
})
test("panne backend : erreur originale conservée, aucune écriture", async () => {
  const { t, a } = await fixture()
  const spy = vi
    .spyOn(authComponent, "getAuthUser")
    .mockRejectedValue(new ConvexError("backend unavailable"))
  try {
    await expect(a.client.query(api.account.getAccess)).rejects.toMatchObject({
      data: "backend unavailable",
    })
    await expect(
      a.client.mutation(write, { referenceId: a.referenceId })
    ).rejects.toMatchObject({ data: "backend unavailable" })
    await expect(
      a.client.mutation(api.account.close, { confirmation: "CLOSE_ACCOUNT" })
    ).rejects.toMatchObject({ data: "backend unavailable" })
    expect(
      await t.run((ctx) => ctx.db.query("accountClosures").take(10))
    ).toEqual([])
  } finally {
    spy.mockRestore()
  }
})

test("confirmation absente ou false et ownerId client refusés avant fermeture", async () => {
  const { a, b } = await fixture()
  for (const args of [
    {},
    { confirmation: false },
    { confirmation: "CLOSE_ACCOUNT", ownerId: b.user._id },
  ]) {
    await expect(
      a.client.mutation(
        api.account.close,
        args as { confirmation: "CLOSE_ACCOUNT" }
      )
    ).rejects.toThrow()
  }
  await expect(
    a.client.query(api.account.getAccess, {
      ownerId: b.user._id,
    } as unknown as Record<string, never>)
  ).rejects.toThrow()
  expect((await a.client.query(api.account.getAccess)).closure).toBeNull()
})

test("fermeture répétée sans aucun droit : même marqueur durable", async () => {
  const { t, a } = await fixture()
  await t.run((ctx) => ctx.db.delete("entitlements", a.referenceId))
  const first = await a.client.mutation(api.account.close, {
    confirmation: "CLOSE_ACCOUNT",
  })
  expect(
    await a.client.mutation(api.account.close, {
      confirmation: "CLOSE_ACCOUNT",
    })
  ).toEqual(first)
  expect(await a.client.query(api.account.getAccess)).toEqual({
    entitlement: null,
    closure: first,
  })
})

test("une incohérence DB reste une panne et ne permet aucune écriture", async () => {
  const { t, a } = await fixture()
  await t.run((ctx) =>
    ctx.db.insert("entitlements", {
      ownerId: a.user._id,
      version: 1,
      enabled: true,
      validUntil: Date.now() + 60_000,
    })
  )
  const before = await t.run((ctx) => ctx.db.get("entitlements", a.referenceId))
  await expect(a.client.query(api.account.getAccess)).rejects.toThrow(/unique/)
  await expect(
    a.client.mutation(write, { referenceId: a.referenceId })
  ).rejects.toThrow(/unique/)
  expect(
    await t.run((ctx) => ctx.db.get("entitlements", a.referenceId))
  ).toEqual(before)
})
