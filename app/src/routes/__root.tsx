import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import type { ConvexReactClient } from "convex/react"
import { authClient } from "@/lib/auth-client"
import { getAuthToken } from "@/lib/auth.functions"
import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{
  convexClient: ConvexReactClient | null
}>()({
  beforeLoad: async () => ({ token: await getAuthToken() }),
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
        title: "TanStack Start Starter",
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
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { convexClient, token } = Route.useRouteContext()
  const content = <TooltipProvider>{children}</TooltipProvider>
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {convexClient ? (
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
