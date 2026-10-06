import { expect, test } from "@playwright/test"
import type { APIRequestContext } from "@playwright/test"
import { loadEnv } from "vite"

const env = loadEnv("development", process.cwd(), "")

// HTTP direct sur le backend réel ; jamais de fixture déployée. Les réponses
// d'erreurs de validation peuvent contenir les arguments : aucune impression.
async function call(
  context: APIRequestContext,
  path: string,
  args: object,
  token?: string
) {
  const response = await context.post(`${env.VITE_CONVEX_URL}/api/${path}`, {
    data: {
      path: path === "query" ? "account:getAccess" : "account:close",
      args,
      format: "json",
    },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return response.json()
}

async function signup(context: APIRequestContext, origin: string) {
  const response = await context.post("/api/auth/sign-up/email", {
    headers: { Origin: origin },
    data: {
      email: `contracts-${crypto.randomUUID()}@example.com`,
      password: crypto.randomUUID(),
      name: "Recette contrats",
    },
  })
  expect(response.ok()).toBe(true)
  const userId = (await response.json()).user.id as string
  const jwt = await context.get("/api/auth/convex/token")
  expect(jwt.ok()).toBe(true)
  const token = (await jwt.json()).token as string
  expect(typeof token).toBe("string")
  return { userId, token }
}

test("contrats réels, fermeture propre et isolation intercompte", async ({
  playwright,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Origine de recette absente")
  const a = await playwright.request.newContext({ baseURL })
  const b = await playwright.request.newContext({ baseURL })
  const anonymous = await playwright.request.newContext({ baseURL })
  try {
    const ownerA = await signup(a, baseURL)
    const ownerB = await signup(b, baseURL)
    const accessA = await call(a, "query", {}, ownerA.token)
    const accessB = await call(b, "query", {}, ownerB.token)
    expect(accessA.status === "success" && accessA.value.closure === null).toBe(
      true
    )
    expect(accessB.status === "success" && accessB.value.closure === null).toBe(
      true
    )
    const closed = await call(
      a,
      "mutation",
      { confirmation: "CLOSE_ACCOUNT" },
      ownerA.token
    )
    expect(
      closed.status === "success" && Number.isSafeInteger(closed.value.closedAt)
    ).toBe(true)
    const again = await call(a, "query", {}, ownerA.token)
    expect(again.value.closure.closedAt === closed.value.closedAt).toBe(true)
    const isolated = await call(b, "query", {}, ownerB.token)
    expect(
      isolated.status === "success" && isolated.value.closure === null
    ).toBe(true)
    const spoof = await call(
      b,
      "query",
      { ownerId: ownerA.userId },
      ownerB.token
    )
    expect(spoof.status === "error").toBe(true)
    expect(
      typeof spoof.errorMessage === "string" &&
        spoof.errorMessage.includes("extra field")
    ).toBe(true)
    const spoofClose = await call(
      b,
      "mutation",
      { confirmation: "CLOSE_ACCOUNT", ownerId: ownerA.userId },
      ownerB.token
    )
    expect(spoofClose.status === "error").toBe(true)
    expect(
      (await call(b, "query", {}, ownerB.token)).value.closure === null
    ).toBe(true)
    const denied = await call(anonymous, "query", {})
    expect(
      denied.status === "error" && denied.errorData?.code === "UNAUTHENTICATED"
    ).toBe(true)
    const nutrition = await anonymous.post(`${env.VITE_CONVEX_URL}/api/query`, {
      data: {
        path: "nutrition:normalizeInput",
        args: { input: "1,2.3" },
        format: "json",
      },
    })
    const invalid = await nutrition.json()
    expect(
      invalid.status === "success" &&
        invalid.value.error.code === "INVALID_DECIMAL"
    ).toBe(true)
    const revoked = await a.post("/api/auth/sign-out", {
      headers: { Origin: baseURL },
      data: {},
    })
    expect(revoked.ok()).toBe(true)
    const afterRevocation = await call(a, "query", {}, ownerA.token)
    expect(
      afterRevocation.status === "error" &&
        afterRevocation.errorData?.code === "UNAUTHENTICATED"
    ).toBe(true)
  } finally {
    await a.dispose()
    await b.dispose()
    await anonymous.dispose()
  }
})
