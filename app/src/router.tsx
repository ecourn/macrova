import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { ConvexReactClient } from "convex/react"
import { adoptedMethod, createCalculatorSession } from "./domain/calculator"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null
  const router = createTanStackRouter({
    routeTree,
    context: {
      convexClient,
      calculatorSession: createCalculatorSession(),
      calculatorMethod: adoptedMethod,
    },

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
