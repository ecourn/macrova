import { useEffect, useRef } from "react"
import {
  createFileRoute,
  Link,
  Navigate,
  redirect,
} from "@tanstack/react-router"
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useAction,
} from "convex/react"
import { api } from "../../convex/_generated/api"
import { CatalogueSearch } from "@/components/catalogue-search"
import { getCurrentUser } from "@/lib/auth.functions"
export const Route = createFileRoute("/aliments")({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: "/login" })
    return { user }
  },
  component: Aliments,
})
function Search() {
  const search = useAction(api.catalogue.search)
  return <CatalogueSearch search={(query) => search({ query })} />
}
function Aliments() {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    title.current?.focus()
  }, [])
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <nav aria-label="Navigation personnelle">
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center underline"
        >
          Compte
        </Link>
      </nav>
      <h1 ref={title} tabIndex={-1} className="text-3xl font-semibold">
        Aliments
      </h1>
      <p>
        Recherchez dans Open Food Facts et consultez les données disponibles et
        leur provenance.
      </p>
      <AuthLoading>
        <p role="status">Vérification de la session…</p>
      </AuthLoading>
      <Authenticated>
        <Search />
      </Authenticated>
      <Unauthenticated>
        <Navigate to="/login" replace />
      </Unauthenticated>
    </main>
  )
}
