import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import type { ConvexReactClient } from "convex/react"
import { authClient } from "@/lib/auth-client"
import {
  hasRenderedAuthRoute,
  loadRootAuthContext,
} from "@/lib/public-auth-boundary"
import type { CalculatorMethod, CalculatorSession } from "@/domain/calculator"
import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{
  convexClient: ConvexReactClient | null
  calculatorSession: CalculatorSession
  calculatorMethod: CalculatorMethod | null | undefined
}>()({
  beforeLoad: ({ location }) => loadRootAuthContext(location.pathname),
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Macrova",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>La page demandée est introuvable.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { convexClient, token } = Route.useRouteContext()
  const privateRoute = useRouterState({
    select: (state) => hasRenderedAuthRoute(state.matches),
  })
  const content = <TooltipProvider>{children}</TooltipProvider>
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {convexClient && privateRoute ? (
          <ConvexBetterAuthProvider
            client={convexClient}
            authClient={authClient}
            initialToken={token}
          >
            {content}
          </ConvexBetterAuthProvider>
        ) : (
          content
        )}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
