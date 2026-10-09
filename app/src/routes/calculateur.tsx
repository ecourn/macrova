import { useEffect, useRef, useState, type FormEvent } from "react"
import { createFileRoute, useHydrated } from "@tanstack/react-router"
import { sendCalculatorMeasurement } from "@/lib/calculator-measurement"
import {
  calculatorTargetFields,
  calculatorTargetLabels,
  calculatorTargetUnit,
} from "@/lib/calculator-presentation"
import { CalculatorTargetEditor } from "@/components/calculator-target-editor"
import { multiply, divide, rational } from "@/domain/decimal"
import { PublicNavigation } from "@/components/public-navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  calculateProfile,
  calculateCalculatorSession,
  changeCalculatorProfile,
  displayCalculatorValue,
  isCalculatorMethodAvailable,
  METHOD_VERSION,
  type CalculatorField,
  type CalculatorSession,
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
      ["5", "Masculin", "Groupe masculin de l'étude (+5)"],
      ["-161", "Féminin", "Groupe féminin de l'étude (−161)"],
      ["incertain", "Incertain", "Applicabilité incertaine"],
    ],
  },
  {
    field: "pal",
    label: "Activité sur toute la journée (PAL)",
    help: "Ces descriptions approximatives ne sont pas des seuils horaires validés. Aucun ajout d'exercice.",
    options: [
      [
        "1.4",
        "1,4",
        "1,4 — Faible : surtout assise, peu de déplacements actifs",
      ],
      ["1.6", "1,6", "1,6 — Modéré : marche et déplacements actifs réguliers"],
      [
        "1.8",
        "1,8",
        "1,8 — Actif : beaucoup de déplacements ou activités physiques",
      ],
      [
        "2.0",
        "2,0",
        "2,0 — Très actif : activité importante une grande partie de la journée, hors sport intensif/compétition",
      ],
    ],
  },
  {
    field: "eligibilite",
    label: "Toutes les conditions d'éligibilité sont-elles satisfaites ?",
    help: "Répondez globalement, sans préciser votre situation médicale.",
    options: [
      ["oui", "Oui, toutes", "Oui, toutes les conditions sont satisfaites"],
      ["non", "Non", "Non"],
      ["incertain", "Incertain", "Incertain"],
    ],
  },
] as const
function Calculator() {
  const context = Route.useRouteContext()
  const [session, setSession] = useState(context.calculatorSession)
  const ready = useHydrated()
  const [online, setOnline] = useState(true)
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    title.current?.focus()
  }, [])
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine)
    connection()
    window.addEventListener("online", connection)
    window.addEventListener("offline", connection)
    return () => {
      window.removeEventListener("online", connection)
      window.removeEventListener("offline", connection)
    }
  }, [])
  function update(next: CalculatorSession) {
    Object.assign(context.calculatorSession, next)
    setSession(next)
  }
  function change(field: CalculatorField, value: string) {
    update(changeCalculatorProfile(session, field, value))
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = calculateCalculatorSession(session, context.calculatorMethod)
    update(next)
    if (next.outcome?.ok) void sendCalculatorMeasurement()
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
      <p role="status" className="mb-4">
        {!online &&
          "Hors ligne : le calcul et les modifications restent disponibles localement sur cette page chargée."}
      </p>
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
        <FieldSet disabled={!ready} className="gap-6">
          <FieldLegend className="mb-4 text-xl font-semibold">
            Votre profil
          </FieldLegend>
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
                aria-describedby={`${field}-help ${field}-choices${field === "eligibilite" ? " exclusions" : ""}${fieldError(field) ? ` ${field}-error` : ""}`}
              >
                <NativeSelectOption value="">Choisir</NativeSelectOption>
                {options.map(([value, text]) => (
                  <NativeSelectOption key={value} value={value}>
                    {text}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription id={`${field}-help`}>{help}</FieldDescription>
              <div
                id={`${field}-choices`}
                className="space-y-2 text-sm text-muted-foreground"
              >
                {options.map(([value, , description]) => (
                  <p key={value}>{description}</p>
                ))}
              </div>
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
        </FieldSet>
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
              {session.currentState === "modified"
                ? "Cible modifiée journalière"
                : "Cible estimative journalière"}
            </h2>
            <p className="mt-2">
              Cible{" "}
              {session.currentState === "modified"
                ? "modifiée et confirmée"
                : "estimée"}{" "}
              pour le profil actuel. Consultez les hypothèses ci-dessus.
            </p>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              {calculatorTargetFields.map((key) => (
                <div key={key}>
                  <dt>{calculatorTargetLabels[key]}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">
                    {displayCalculatorValue(result.target[key])}{" "}
                    <span className="text-base font-normal">
                      {calculatorTargetUnit(key)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm">
              {result.version} · Mifflin × PAL{" "}
              {result.profile.pal.replace(".", ",")} · Répartition actuelle P /
              G / L :{" "}
              {(["P", "G", "L"] as const)
                .map((key) =>
                  displayCalculatorValue(
                    divide(
                      multiply(
                        result.target[key],
                        rational(key === "L" ? 900n : 400n)
                      ),
                      result.target.E
                    )
                  )
                )
                .join(" / ")}{" "}
              %. Affichage arrondi au centième uniquement ; calcul exact
              conservé en mémoire.
            </p>
            <details className="mt-4">
              <summary className="min-h-11 cursor-pointer py-3">
                Consulter la cible courante et l'original exacts
              </summary>
              <dl className="space-y-2 break-all">
                {calculatorTargetFields.map((key) => (
                  <div key={key}>
                    <dt>
                      {key} ({calculatorTargetUnit(key)})
                    </dt>
                    <dd>
                      Courante : {String(result.target[key].numerator)}/
                      {String(result.target[key].denominator)} ; originale :{" "}
                      {String(session.original?.[key].numerator)}/
                      {String(session.original?.[key].denominator)}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          </section>
        )}
      </div>
      {result && (
        <CalculatorTargetEditor
          onConfirmed={() => void sendCalculatorMeasurement()}
          session={session}
          method={context.calculatorMethod}
          ready={ready}
          update={update}
        />
      )}
    </main>
  )
}
