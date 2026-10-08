import { createFileRoute, Link } from "@tanstack/react-router"
import { PublicNavigation } from "@/components/public-navigation"
import { buttonVariants } from "@/components/ui/button"
export const Route = createFileRoute("/")({ component: App })
function App() {
  return (
    <main className="public-page">
      <PublicNavigation />
      <section className="flex max-w-2xl flex-col items-start gap-6 py-8">
        <p className="font-semibold text-primary">Macrova</p>
        <h1 className="text-[1.75rem] font-semibold leading-tight">
          Une première cible, avec ses hypothèses.
        </h1>
        <p>
          Estimez vos calories, protéines, glucides et lipides journaliers pour
          le maintien, gratuitement et sans compte.
        </p>
        <p className="text-muted-foreground">
          Le calcul reste dans votre navigateur. La méthode propose une
          estimation théorique, avec des limites et des situations exclues ;
          elle ne mesure pas vos besoins.
        </p>
        <Link
          className={buttonVariants({ className: "min-h-11" })}
          to="/calculateur"
        >
          Ouvrir le calculateur
        </Link>
      </section>
    </main>
  )
}
