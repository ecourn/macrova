import { defineApp } from "convex/server"
import { v } from "convex/values"
import betterAuth from "@convex-dev/better-auth/convex.config"

import rateLimiter from "@convex-dev/rate-limiter/convex.config"

const app = defineApp({
  env: {
    SITE_URL: v.string(),
    OFF_SEARCH_ENDPOINT: v.optional(v.string()),
    OFF_SEARCH_API_VERSION: v.optional(v.string()),
    OFF_USER_AGENT: v.optional(v.string()),
    BETTER_AUTH_SECRET: v.string(),
  },
})
app.use(betterAuth)
app.use(rateLimiter)
export default app
