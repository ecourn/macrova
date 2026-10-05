import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start"

// Initialisation différée : le site public reste accessible avant configuration.
function getAuthServer() {
  const convexUrl = process.env.VITE_CONVEX_URL
  const convexSiteUrl = process.env.VITE_CONVEX_SITE_URL
  if (!convexUrl || !convexSiteUrl) {
    throw new Error("Configurer Convex dans .env.local (voir README.md).")
  }
  return convexBetterAuthReactStart({ convexUrl, convexSiteUrl })
}

export const getToken = () => getAuthServer().getToken()
export const fetchAuthQuery: ReturnType<
  typeof convexBetterAuthReactStart
>["fetchAuthQuery"] = (query, ...args) =>
  getAuthServer().fetchAuthQuery(query, ...args)

export async function handler(request: Request) {
  if (!process.env.VITE_CONVEX_URL || !process.env.VITE_CONVEX_SITE_URL) {
    return Response.json(
      { message: "Convex n'est pas configuré. Consulter README.md." },
      { status: 503 }
    )
  }
  return getAuthServer().handler(request)
}
