import { useEffect, useRef, useState, type FormEvent } from "react"
import { createFileRoute, useHydrated } from "@tanstack/react-router"
import { PublicNavigation } from "@/components/public-navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  calculateProfile,
  changeCalculatorProfile,
  displayCalculatorValue,
  isCalculatorMethodAvailable,
  METHOD_VERSION,
  type CalculatorField,
} from "@/domain/calculator"
export const Route = createFileRoute("/calculateur")({ component: Calculator })
const numbers = [
  { field: "age", label: "Âge (ans)", help: "Un entier entre 19 et 64 ans." },
  { field: "taille_cm", label: "Taille (cm)", help: "Entre 120 et 220 cm." },
  { field: "poids_kg", label: "Poids (kg)", help: "Entre 30 et 200 kg." },
] as const
const choices = [
  {
    field: "coefficient",
    label: "Coefficient de l'étude",
    help: "Choisissez le groupe de l'étude dont le coefficient s'applique avec certitude à votre situation. Ce choix ne décrit pas votre identité de genre.",
    options: [
      ["5", "Groupe masculin de l'étude (+5)"],
      ["-161", "Groupe féminin de l'étude (−161)"],
      ["incertain", "Applicabilité incertaine"],
    ],
  },
  {
    field: "pal",
    label: "Activité sur toute la journée (PAL)",
    help: "Ces descriptions approximatives ne sont pas des seuils horaires validés. Aucun ajout d'exercice.",
    options: [
      ["1.4", "1,4 — Faible : surtout assise, peu de déplacements actifs"],
      ["1.6", "1,6 — Modéré : marche et déplacements actifs réguliers"],
      ["1.8", "1,8 — Actif : beaucoup de déplacements ou activités physiques"],
      [
        "2.0",
        "2,0 — Très actif : activité importante une grande partie de la journée, hors sport intensif/compétition",
      ],
    ],
  },
  {
    field: "eligibilite",
    label: "Toutes les conditions d'éligibilité sont-elles satisfaites ?",
    help: "Répondez globalement, sans préciser votre situation médicale.",
    options: [
      ["oui", "Oui, toutes les conditions sont satisfaites"],
      ["non", "Non"],
      ["incertain", "Incertain"],
    ],
  },
] as const
function Calculator() {
  const context = Route.useRouteContext()
  const [session, setSession] = useState(context.calculatorSession)
  const ready = useHydrated()
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    title.current?.focus()
  }, [])
  function change(field: CalculatorField, value: string) {
    const next = changeCalculatorProfile(session, field, value)
    Object.assign(context.calculatorSession, next)
    setSession(next)
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = {
      ...session,
      outcome: calculateProfile(session.profile, context.calculatorMethod),
      changed: false,
    }
    Object.assign(context.calculatorSession, next)
    setSession(next)
  }
  const outcome = isCalculatorMethodAvailable(context.calculatorMethod)
    ? session.outcome
    : calculateProfile(session.profile, context.calculatorMethod)
  const errors = outcome && !outcome.ok ? outcome.errors : []
  const fieldError = (field: CalculatorField) =>
    errors.find((error) => error.field === field)
  const result = outcome?.ok ? outcome : null
  return (
    <main className="public-page">
      <PublicNavigation />
      <header className="space-y-4 py-8">
        <h1
          ref={title}
          tabIndex={-1}
          className="text-[1.75rem] font-semibold leading-tight"
        >
          Calculateur de cible estimative
        </h1>
        <p>
          Maintien théorique, sans compte. Vos six entrées restent en mémoire
          dans ce parcours jusqu'au rechargement ou à la fermeture de la page.
        </p>
      </header>
      <section
        aria-labelledby="hypotheses"
        className="mb-8 max-w-3xl space-y-4"
      >
        <h2 id="hypotheses" className="text-xl font-semibold">
          Hypothèses, exclusions et limites
        </h2>
        <p>
          Méthode : <strong>{METHOD_VERSION}</strong>, adoptée pour construction
          le 8 octobre 2026. Cette décision produit ne constitue pas une
          validation clinique.
        </p>
        <p>
          Mifflin × PAL estime une dépense journalière ; cet assemblage est un
          choix Macrova. Répartition théorique protéines / glucides / lipides :
          15 / 45 / 40 % de l'énergie, avec facteurs 4 / 4 / 9 kcal/g. Aucun
          objectif de perte ou prise de poids.
        </p>
        <p>
          Le domaine proposé exige 19–64 ans et un IMC calculé entre 18,5 inclus
          et 30 exclu. Le seuil protéique de 0,83 g/kg/jour est une garde de la
          cible, sans garantie de sécurité individuelle.
        </p>
        <p id="exclusions">
          Toutes les conditions suivantes doivent être satisfaites : absence de
          grossesse ou allaitement ; absence de trouble alimentaire actuel ou
          antérieur ; absence de pathologie ou traitement influençant les
          besoins ou le poids ; absence de prescription nutritionnelle ; absence
          de sport intensif ou compétition ; applicabilité certaine du
          coefficient de l'étude, notamment hors contexte hormonal non couvert.
        </p>
        <p>
          Une réponse non ou incertain refuse le calcul. Des erreurs
          individuelles restent possibles même dans le périmètre. Cette
          estimation n'est ni une prescription, ni un diagnostic, ni une
          garantie de santé.
        </p>
      </section>
      <form
        method="post"
        onSubmit={submit}
        autoComplete="off"
        className="max-w-2xl space-y-6"
      >
        <fieldset disabled={!ready} className="space-y-6">
          <legend className="mb-4 text-xl font-semibold">Votre profil</legend>
          {numbers.map(({ field, label, help }) => (
            <Field key={field} data-invalid={!!fieldError(field)}>
              <FieldLabel htmlFor={field}>{label}</FieldLabel>
              <Input
                id={field}
                inputMode="decimal"
                value={session.profile[field]}
                onChange={(event) => change(field, event.target.value)}
                aria-invalid={!!fieldError(field)}
                aria-describedby={`${field}-help${fieldError(field) ? ` ${field}-error` : ""}`}
              />
              <FieldDescription id={`${field}-help`}>
                {help} Virgule ou point accepté, au plus six décimales.
              </FieldDescription>
              {fieldError(field) && (
                <FieldError id={`${field}-error`} role="presentation">
                  {fieldError(field)?.message}
                </FieldError>
              )}
            </Field>
          ))}
          {choices.map(({ field, label, help, options }) => (
            <Field key={field} data-invalid={!!fieldError(field)}>
              <FieldLabel htmlFor={field}>{label}</FieldLabel>
              <NativeSelect
                id={field}
                value={session.profile[field]}
                onChange={(event) => change(field, event.target.value)}
                aria-invalid={!!fieldError(field)}
                aria-describedby={`${field}-help${field === "eligibilite" ? " exclusions" : ""}${fieldError(field) ? ` ${field}-error` : ""}`}
              >
                <NativeSelectOption value="">
                  Choisir explicitement
                </NativeSelectOption>
                {options.map(([value, text]) => (
                  <NativeSelectOption key={value} value={value}>
                    {text}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription id={`${field}-help`}>{help}</FieldDescription>
              {fieldError(field) && (
                <FieldError id={`${field}-error`} role="presentation">
                  {fieldError(field)?.message}
                </FieldError>
              )}
            </Field>
          ))}
          <Button type="submit" className="min-h-11">
            Calculer ma cible estimative
          </Button>
        </fieldset>
        {!ready && (
          <p>Le calcul sera disponible dès le chargement de l'interface.</p>
        )}
        <noscript>
          JavaScript est nécessaire au calcul local. Aucune saisie transmise.
        </noscript>
      </form>
      <div className="mt-8 max-w-3xl" aria-live="polite" aria-atomic="true">
        {errors.length > 0 && (
          <Alert
            variant="destructive"
            role="group"
            aria-labelledby="error-title"
          >
            <AlertTitle id="error-title">Aucune estimation</AlertTitle>
            <AlertDescription>
              <p>
                Vos saisies sont conservées. Les limites de la méthode restent
                applicables.
                {errors.some((error) => error.field) &&
                  " Les liens ci-dessous permettent de vérifier les champs concernés."}
                {isCalculatorMethodAvailable(context.calculatorMethod) &&
                  " Après toute modification, demandez un nouveau calcul explicitement."}
              </p>
              <ul className="space-y-2">
                {errors.map((error) => (
                  <li key={`${error.code}-${error.field ?? "global"}`}>
                    {error.field ? (
                      <Button
                        variant="link"
                        role="link"
                        nativeButton={false}
                        render={<a href={`#${error.field}`} />}
                        className="h-auto min-h-11 justify-start whitespace-normal px-0 text-left text-destructive underline"
                        onClick={(event) => {
                          event.preventDefault()
                          event.currentTarget.ownerDocument
                            .getElementById(error.field ?? "")
                            ?.focus()
                        }}
                      >
                        {error.message}
                      </Button>
                    ) : (
                      error.message
                    )}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {!session.outcome && session.changed && (
          <p>
            Profil changé : aucun résultat actuel. Un nouveau calcul explicite
            est nécessaire.
          </p>
        )}
        {result && (
          <section
            aria-labelledby="result-title"
            className="rounded-xl bg-muted p-6"
          >
            <h2 id="result-title" className="text-xl font-semibold">
              Cible estimative journalière
            </h2>
            <p className="mt-2">
              Estimation calculée pour le profil actuel. Consultez les
              hypothèses ci-dessus.
            </p>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              {(
                [
                  ["E", "Calories", "kcal/jour"],
                  ["P", "Protéines", "g/jour"],
                  ["G", "Glucides", "g/jour"],
                  ["L", "Lipides", "g/jour"],
                ] as const
              ).map(([key, label, unit]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">
                    {displayCalculatorValue(result.target[key])}{" "}
                    <span className="text-base font-normal">{unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm">
              {result.version} · Mifflin × PAL{" "}
              {result.profile.pal.replace(".", ",")} · 15 / 45 / 40 %. Affichage
              arrondi au centième uniquement ; calcul exact conservé en mémoire.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
