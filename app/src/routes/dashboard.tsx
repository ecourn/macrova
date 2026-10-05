import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Authenticated, AuthLoading, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { getCurrentUser } from "@/lib/auth.functions"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: "/login" })
    return { user }
  },
  component: Dashboard,
})

function CurrentUser() {
  const user = useQuery(api.auth.getCurrentUser)
  return (
    <p>
      {user ? `Connecté à Convex : ${user.email}` : "Chargement du compte…"}
    </p>
  )
}

function Dashboard() {
  const { user } = Route.useRouteContext()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function signOut() {
    setBusy(true)
    setError("")
    try {
      const result = await authClient.signOut()
      if (result.error) throw new Error(result.error.message)
      window.location.assign("/login")
    } catch {
      setError("La déconnexion a échoué. Réessaie.")
      setBusy(false)
    }
  }
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Bienvenue, {user.name}</h1>
      <AuthLoading>
        <p>Connexion à Convex…</p>
      </AuthLoading>
      <Authenticated>
        <CurrentUser />
      </Authenticated>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Button onClick={signOut} disabled={busy}>
        {busy ? "Déconnexion…" : "Se déconnecter"}
      </Button>
    </main>
  )
}
