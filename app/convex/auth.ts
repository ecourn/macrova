import { betterAuth } from "better-auth/minimal"
import { createClient } from "@convex-dev/better-auth"
import type { GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { components } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"
import { env, query } from "./_generated/server"
import authConfig from "./auth.config"

export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const siteUrl = env.SITE_URL
  const secret = env.BETTER_AUTH_SECRET
  if (!siteUrl || !secret) {
    throw new Error("Configurer SITE_URL et BETTER_AUTH_SECRET dans Convex.")
  }
  return betterAuth({
    appName: "Macrova",
    baseURL: siteUrl,
    secret,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex({ authConfig })],
  })
}

// Une session absente ou révoquée est un état normal pour cette lecture.
// Les opérations privées doivent continuer à utiliser getAuthUser.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => (await authComponent.safeGetAuthUser(ctx)) ?? null,
})
