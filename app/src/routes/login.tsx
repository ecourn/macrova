import { useState } from "react"
import type { FormEvent } from "react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { getCurrentUser } from "@/lib/auth.functions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (await getCurrentUser()) throw redirect({ to: "/dashboard" })
  },
  component: Login,
})

function Login() {
  const { convexClient } = Route.useRouteContext()
  const [signUp, setSignUp] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    const data = new FormData(event.currentTarget)
    const email = String(data.get("email"))
    const password = String(data.get("password"))
    try {
      const result = signUp
        ? await authClient.signUp.email({
            email,
            password,
            name: String(data.get("name")).trim(),
          })
        : await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message ?? "La connexion a échoué.")
      } else {
        window.location.assign("/dashboard")
      }
    } catch {
      setError("Connexion impossible. Réessaie dans quelques instants.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 p-6">
      <Link to="/">← Accueil</Link>
      <h1 className="text-2xl font-semibold">
        {signUp ? "Créer un compte" : "Se connecter"}
      </h1>
      {!convexClient ? (
        <p>La connexion sera disponible après la configuration de Convex.</p>
      ) : (
        <>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {signUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={signUp ? "new-password" : "current-password"}
                minLength={8}
                maxLength={128}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy
                ? "Veuillez patienter…"
                : signUp
                  ? "Créer mon compte"
                  : "Se connecter"}
            </Button>
          </form>
          <Button
            variant="link"
            disabled={busy}
            onClick={() => {
              setSignUp(!signUp)
              setError("")
            }}
          >
            {signUp ? "J’ai déjà un compte" : "Créer un compte"}
          </Button>
        </>
      )}
    </main>
  )
}
