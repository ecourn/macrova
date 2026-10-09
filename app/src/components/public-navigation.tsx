import { Link } from "@tanstack/react-router"
export function PublicNavigation() {
  return (
    <nav
      aria-label="Navigation publique"
      className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4"
    >
      <Link
        to="/"
        activeProps={{
          "aria-current": "page",
          className: "font-semibold underline text-primary",
        }}
        activeOptions={{ exact: true }}
      >
        Accueil
      </Link>
      <Link
        to="/calculateur"
        activeProps={{
          "aria-current": "page",
          className: "font-semibold underline text-primary",
        }}
      >
        Calculateur
      </Link>
      <Link to="/login" preload={false}>
        Se connecter ou créer un compte
      </Link>
      <Link to="/dashboard" preload={false}>
        Mon espace
      </Link>
    </nav>
  )
}
