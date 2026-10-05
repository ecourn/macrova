/// <reference types="vite/client" />
import { convexTest } from "convex-test"
import betterAuth from "@convex-dev/better-auth/test"
import { expect, test } from "vitest"
import { api, components } from "./_generated/api"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")

async function sessionFixture(expiresAt = Date.now() + 60_000) {
  const t = convexTest(schema, modules)
  betterAuth.register(t)
  const now = Date.now()
  const user = await t.mutation(components.betterAuth.adapter.create, {
    input: {
      model: "user",
      data: {
        name: "Compte de test",
        email: "auth@example.com",
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
        token: "test-session",
        expiresAt,
        createdAt: now,
        updatedAt: now,
      },
    },
  })
  const authenticated = t.withIdentity({
    subject: user._id,
    sessionId: session._id,
  })
  return { t, authenticated, user, session }
}

test("un visiteur anonyme reçoit null", async () => {
  const t = convexTest(schema, modules)
  expect(await t.query(api.auth.getCurrentUser)).toBeNull()
})

test("une session valide retourne son utilisateur", async () => {
  const { authenticated, user } = await sessionFixture()
  expect(await authenticated.query(api.auth.getCurrentUser)).toEqual(user)
})

test("une session révoquée retourne null même avec un JWT", async () => {
  const { t, authenticated, session } = await sessionFixture()
  await t.mutation(components.betterAuth.adapter.deleteOne, {
    input: { model: "session", where: [{ field: "_id", value: session._id }] },
  })
  expect(await authenticated.query(api.auth.getCurrentUser)).toBeNull()
})

test("une session expirée retourne null", async () => {
  const { authenticated } = await sessionFixture(Date.now() - 60_000)
  expect(await authenticated.query(api.auth.getCurrentUser)).toBeNull()
})

test("un utilisateur supprimé retourne null", async () => {
  const { t, authenticated, user } = await sessionFixture()
  await t.mutation(components.betterAuth.adapter.deleteOne, {
    input: { model: "user", where: [{ field: "_id", value: user._id }] },
  })
  expect(await authenticated.query(api.auth.getCurrentUser)).toBeNull()
})

test("une erreur backend réelle reste une erreur", async () => {
  const t = convexTest(schema, modules).withIdentity({
    subject: "missing-user",
    sessionId: "missing-session",
  })
  await expect(t.query(api.auth.getCurrentUser)).rejects.toThrow()
})
