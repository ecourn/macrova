/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import betterAuth from "@convex-dev/better-auth/test"
import { makeFunctionReference } from "convex/server"
import { expect, test, vi } from "vitest"
import { api } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { authComponent } from "./auth"
import schema from "./schema"
const modules = {
  ...import.meta.glob("./**/*.ts"),
  "./recoveryExercise.ts": () => import("../tests/fixtures/recovery-functions"),
  "./syntheticAccess.ts": () => import("../tests/fixtures/access-functions"),
}
type Account = {
  ownerId: string
  sessionId: string
  referenceId: Id<"entitlements">
}
const seed = makeFunctionReference<
  "mutation",
  Record<string, never>,
  { closed: Account; open: Account }
>("recoveryExercise:seed")
const lose = makeFunctionReference<"mutation">("recoveryExercise:loseRoots")
const enrich = makeFunctionReference<
  "mutation",
  { cursor: string | null },
  { cursor: string; done: boolean; updated: number }
>("recoveryExercise:enrich")
const personal = makeFunctionReference<
  "mutation",
  { referenceId: Id<"entitlements"> }
>("syntheticAccess:personalWrite")
const delayed = makeFunctionReference<
  "mutation",
  { referenceId: Id<"entitlements">; create: boolean }
>("syntheticAccess:delayedWrite")
const read = makeFunctionReference<
  "query",
  { referenceId: Id<"entitlements"> }
>("syntheticAccess:readReference")
const revoke = makeFunctionReference<"mutation", { sessionId: string }>(
  "recoveryExercise:revoke"
)
async function fixture() {
  const t = convexTest(schema, modules)
  betterAuth.register(t)
  const accounts = await t.mutation(seed, {})
  return {
    t,
    accounts,
    open: t.withIdentity({
      subject: accounts.open.ownerId,
      sessionId: accounts.open.sessionId,
    }),
    closed: t.withIdentity({
      subject: accounts.closed.ownerId,
      sessionId: accounts.closed.sessionId,
    }),
  }
}
test("simulation JSON : restauration logique des racines, session et fermeture préservées", async () => {
  const { t, accounts, open, closed } = await fixture()
  const historic = await open.query(api.account.getAccess)
  const closure = await closed.query(api.account.getAccess)
  const snapshot = await t.run(async (ctx) => ({
    entitlements: await ctx.db.query("entitlements").take(20),
    closures: await ctx.db.query("accountClosures").take(20),
  }))
  const serialized = JSON.stringify(snapshot)
  await t.mutation(lose, {})
  expect(await open.query(api.account.getAccess)).toEqual({
    entitlement: null,
    closure: null,
  })
  // convex-test recrée les IDs : leur conservation exige l'import CLI réel.
  const restored = JSON.parse(serialized) as typeof snapshot
  const refs = await t.run(async (ctx) => {
    const ids: Id<"entitlements">[] = []
    for (const { _id, _creationTime, ...doc } of restored.entitlements)
      ids.push(await ctx.db.insert("entitlements", doc))
    for (const { _id, _creationTime, ...doc } of restored.closures)
      await ctx.db.insert("accountClosures", doc)
    return ids
  })
  expect(await open.query(api.account.getAccess)).toEqual(historic)
  expect(await closed.query(api.account.getAccess)).toEqual(closure)
  const closedRef = refs[0]
  await expect(
    open.query(read, { referenceId: closedRef })
  ).rejects.toMatchObject({ data: { code: "ACCESS_DENIED" } })
  await expect(
    closed.mutation(personal, { referenceId: closedRef })
  ).rejects.toMatchObject({ data: { code: "ACCOUNT_CLOSED" } })
  await expect(
    t.mutation(delayed, { referenceId: closedRef, create: true })
  ).rejects.toMatchObject({ data: { code: "ACCOUNT_CLOSED" } })
  await expect(t.query(api.account.getAccess)).rejects.toMatchObject({
    data: { code: "UNAUTHENTICATED" },
  })
  await t.mutation(revoke, { sessionId: accounts.open.sessionId })
  await expect(open.query(api.account.getAccess)).rejects.toMatchObject({
    data: { code: "UNAUTHENTICATED" },
  })
  expect(
    await t.run((ctx) => ctx.db.query("accountClosures").take(20))
  ).toHaveLength(1)
})
test("champ optionnel : consommateur v1 intact et backfill rejouable sans écriture fermée", async () => {
  const { t, accounts, open } = await fixture()
  const historical = await open.query(api.account.getAccess)
  const closedBefore = await t.run((ctx) =>
    ctx.db.get("entitlements", accounts.closed.referenceId)
  )
  expect(await t.mutation(enrich, { cursor: null })).toMatchObject({
    done: true,
    updated: 1,
  })
  expect(await t.mutation(enrich, { cursor: null })).toMatchObject({
    done: true,
    updated: 0,
  })
  expect(await open.query(api.account.getAccess)).toEqual(historical)
  expect(
    (
      await t.run((ctx) =>
        ctx.db.get("entitlements", accounts.open.referenceId)
      )
    )?.metadata
  ).toEqual({ version: 1 })
  expect(
    await t.run((ctx) =>
      ctx.db.get("entitlements", accounts.closed.referenceId)
    )
  ).toEqual(closedBefore)
  await open.mutation(personal, { referenceId: accounts.open.referenceId })
})
test("véritable panne backend reste visible au consommateur historique", async () => {
  const { open } = await fixture()
  const spy = vi
    .spyOn(authComponent, "getAuthUser")
    .mockRejectedValue(new Error("synthetic outage"))
  try {
    await expect(open.query(api.account.getAccess)).rejects.toThrow(
      "synthetic outage"
    )
  } finally {
    spy.mockRestore()
  }
})

test("backfill interrompu : curseur acquitté repris, puis rejeu complet sans nouvelle écriture", async () => {
  const t = convexTest(schema, modules)
  await t.run(async (ctx) => {
    for (let i = 0; i < 14; i++) {
      await ctx.db.insert("entitlements", {
        ownerId: `synthetic-${i}`,
        version: 1,
        enabled: true,
        validUntil: Date.now() + 60_000,
      })
    }
  })
  const first = await t.mutation(enrich, { cursor: null })
  expect(first).toMatchObject({ done: false, updated: 10 })
  const resumed = await t.mutation(enrich, { cursor: first.cursor })
  expect(resumed).toMatchObject({ done: true, updated: 4 })
  const replay = await t.mutation(enrich, { cursor: null })
  expect(replay.updated).toBe(0)
  expect((await t.mutation(enrich, { cursor: replay.cursor })).updated).toBe(0)
})
