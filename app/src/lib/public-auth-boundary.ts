import { getAuthToken } from "./auth.functions"

export async function loadRootAuthContext(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/"
  return {
    token:
      normalized === "/login" ||
      normalized === "/dashboard" ||
      normalized === "/aliments"
        ? await getAuthToken()
        : undefined,
  }
}

export function hasRenderedAuthRoute(matches: readonly { routeId: string }[]) {
  return matches.some(
    ({ routeId }) =>
      routeId === "/login" ||
      routeId === "/dashboard" ||
      routeId === "/aliments"
  )
}
