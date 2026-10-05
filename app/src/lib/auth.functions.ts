import { createServerFn } from "@tanstack/react-start"
import { fetchAuthQuery, getToken } from "./auth-server"
import { api } from "../../convex/_generated/api"

export const getAuthToken = createServerFn({ method: "GET" }).handler(
  async () => {
    if (!process.env.VITE_CONVEX_URL || !process.env.VITE_CONVEX_SITE_URL) {
      return null
    }
    return (await getToken()) ?? null
  }
)

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    if (!(await getAuthToken())) return null
    return fetchAuthQuery(api.auth.getCurrentUser, {})
  }
)
