import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { ConvexHttpClient } from "convex/browser"
import { backendOperation, BackendUnavailableError } from "./server-errors"

// Initialisation différée : le site public reste accessible avant configuration.
function getAuthServer() {
  const convexUrl = process.env.VITE_CONVEX_URL
  const convexSiteUrl = process.env.VITE_CONVEX_SITE_URL
  if (!convexUrl || !convexSiteUrl) throw new BackendUnavailableError()
  return convexBetterAuthReactStart({ convexUrl, convexSiteUrl })
}

export const getToken = () =>
  backendOperation(async () => {
    const siteUrl = process.env.VITE_CONVEX_SITE_URL
    if (!siteUrl) throw new BackendUnavailableError()
    const headers = new Headers(getRequestHeaders())
    headers.delete("content-length")
    headers.delete("transfer-encoding")
    headers.delete("connection")
    headers.set("host", new URL(siteUrl).host)
    headers.set("accept-encoding", "identity")
    // Le helper du SDK ignore actuellement les erreurs HTTP de betterFetch.
    // Seul 401 signifie une absence de session ; 5xx et transport restent pannes.
    const response = await fetch(`${siteUrl}/api/auth/convex/token`, {
      headers,
    })
    if (response.status === 401) return null
    if (!response.ok) throw new BackendUnavailableError()
    const payload: unknown = await response.json()
    if (!payload || typeof payload !== "object" || !("token" in payload)) {
      throw new BackendUnavailableError()
    }
    const token = payload.token
    if (typeof token !== "string" || !token.trim()) {
      throw new BackendUnavailableError()
    }
    return token
  })

export const fetchAuthQuery: ReturnType<
  typeof convexBetterAuthReactStart
>["fetchAuthQuery"] = (query, ...args) =>
  backendOperation(async () => {
    const url = process.env.VITE_CONVEX_URL
    if (!url) throw new BackendUnavailableError()
    const client = new ConvexHttpClient(url, { logger: false })
    const token = await getToken()
    if (token) client.setAuth(token)
    return client.query(query, ...args)
  })

export async function handler(request: Request) {
  if (!process.env.VITE_CONVEX_URL || !process.env.VITE_CONVEX_SITE_URL) {
    return Response.json(
      { message: "Convex n'est pas configuré. Consulter README.md." },
      { status: 503 }
    )
  }
  try {
    return await backendOperation(async () => {
      const response = await getAuthServer().handler(request)
      if (response.status >= 500) throw new BackendUnavailableError()
      return response
    })
  } catch (failure) {
    const error =
      failure instanceof BackendUnavailableError
        ? failure
        : new BackendUnavailableError()
    console.error(error.code, error.incidentId)
    return Response.json(
      { code: error.code, incidentId: error.incidentId },
      { status: 503 }
    )
  }
}
