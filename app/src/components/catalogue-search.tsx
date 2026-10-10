import { useEffect, useRef, useState, type FormEvent } from "react"
import { ConvexError } from "convex/values"
import { useHydrated } from "@tanstack/react-router"
import {
  type CatalogueHit,
  type CatalogueResult,
  normalizeSearch,
} from "@/domain/catalogue"
import { ERROR_MESSAGES, NUTRIENTS, type ErrorCode } from "@/domain/contracts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
const names = {
  protein: "Protéines",
  carbohydrate: "Glucides",
  fat: "Lipides",
  energy: "Calories",
}
const date = (value: number) =>
  new Date(value).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })
const reasonText = (reason: string) => {
  if (reason.startsWith("UNSUPPORTED_NUTRIENT_UNIT:"))
    return "Unité nutritionnelle non prise en charge"
  if (reason.startsWith("UNSUPPORTED_NUTRIENT_MODIFIER:"))
    return "Valeur approximative ou bornée non prise en charge"
  return (
    (
      {
        MISSING_NUTRITION: "Valeurs nutritionnelles manquantes",
        AMBIGUOUS_BASIS: "Base nutritionnelle à confirmer",
        INVALID_DECIMAL: "Valeur ou précision nutritionnelle invalide",
        INVALID_METADATA: "Métadonnées de la source invalides",
        STATE_UNPROVEN: "État de préparation non établi",
        STATE_MISMATCH: "État de préparation différent",
        MISSING_DENSITY: "Densité sourcée requise pour convertir la base",
        UNSUPPORTED_PREPARATION: "Préparation non prise en charge",
      } as Record<string, string>
    )[reason] || "Donnée de la source non prise en charge"
  )
}
const sourceErrorText = (reason: string) => {
  if (reason.startsWith("HTTP_"))
    return "La source a refusé ou n’a pas pu traiter la demande."
  return (
    (
      {
        TIMEOUT: "La source n’a pas répondu à temps.",
        MALFORMED_RESPONSE: "La réponse de la source n’est pas exploitable.",
        SOURCE_ERROR: "La source signale une erreur de recherche.",
        NETWORK_ERROR: "La connexion à la source a échoué.",
        RESPONSE_TOO_LARGE:
          "La réponse de la source dépasse les limites de recherche.",
        WORK_EXPIRED:
          "La recherche n’a pas pu se terminer dans le délai prévu.",
        CONFIGURATION: "Le service de recherche n’est pas encore disponible.",
      } as Record<string, string>
    )[reason] || "La source est temporairement indisponible."
  )
}
export function CatalogueFood({
  hit,
  detail = false,
}: {
  hit: CatalogueHit
  detail?: boolean
}) {
  const food = hit.snapshot
  return (
    <div className="space-y-3">
      {food.brand && <p>{food.brand}</p>}
      <p>
        {food.state === "raw"
          ? "Cru"
          : food.state === "cooked"
            ? "Cuit"
            : "État inconnu"}{" "}
        ·{" "}
        {food.basis.kind === "known"
          ? `Pour 100 ${food.basis.unit}`
          : "Base nutritionnelle ambiguë"}
      </p>
      <dl className="grid grid-cols-2 gap-4">
        {NUTRIENTS.map((key) => (
          <div key={key}>
            <dt>{names[key]}</dt>
            <dd className="font-semibold tabular-nums">
              {food.nutrition[key] === null
                ? "Manquant"
                : `${food.nutrition[key]} ${key === "energy" ? "kcal" : "g"}`}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-sm">
        Source :{" "}
        <a
          className="underline"
          href={food.provenance.reference}
          target="_blank"
          rel="noreferrer"
        >
          Open Food Facts
        </a>{" "}
        · Consulté le {date(food.capturedAt)}
      </p>
      <p className="text-sm">
        Index :{" "}
        {hit.indexedAt ? date(Date.parse(hit.indexedAt)) : "date inconnue"}
      </p>
      {detail && (
        <>
          <p className="break-all text-sm">Identifiant OFF : {food.sourceId}</p>
          <p>
            Ce détail affiche le résultat de recherche reçu. L’index peut
            différer de la fiche actuelle ; aucune relecture du produit n’a été
            effectuée.
          </p>
          {hit.reasons.length > 0 && (
            <Alert>
              <AlertDescription>
                Données à vérifier :{" "}
                {[...new Set(hit.reasons.map(reasonText))].join(" ; ")}. Ces
                limites empêchent de présumer une donnée calculable.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}
export function catalogueMessage(result: CatalogueResult): string {
  if (result.kind === "results")
    return result.hits.length
      ? `${result.hits.length} résultat${result.hits.length > 1 ? "s" : ""}.`
      : "Aucun résultat. Essayez une autre recherche."
  if (result.kind === "limited")
    return `Budget de recherche atteint. Nouvelle soumission possible après le ${date(result.retryAt)}.`
  if (result.kind === "suspended")
    return `Open Food Facts est suspendu temporairement. Nouvelle soumission possible après le ${date(result.retryAt)}.`
  return `La source Open Food Facts est indisponible. ${sourceErrorText(result.reason)} Réessayez explicitement.`
}
export function CatalogueSearch({
  search,
}: {
  search: (query: string) => Promise<CatalogueResult>
}) {
  const ready = useHydrated()
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")
  const [busy, setBusy] = useState(false)
  const [online, setOnline] = useState(true)
  const [message, setMessage] = useState(
    "Saisissez un aliment puis lancez la recherche."
  )
  const [result, setResult] = useState<CatalogueResult | null>(null)
  const [selected, setSelected] = useState<CatalogueHit | null>(null)
  const detailHeading = useRef<HTMLHeadingElement>(null)
  const resultButtons = useRef(new Map<number, HTMLButtonElement>())
  const selectedResultIndex = useRef<number | null>(null)
  useEffect(() => {
    if (selected) detailHeading.current?.focus()
    else if (selectedResultIndex.current !== null) {
      resultButtons.current.get(selectedResultIndex.current)?.focus()
      selectedResultIndex.current = null
    }
  }, [selected])
  const latest = useRef(0)
  const activeQuery = useRef<string | null>(null)
  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine)
      if (!navigator.onLine) {
        latest.current += 1
        activeQuery.current = null
        setBusy(false)
      }
    }
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      latest.current += 1
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ready || !online || (busy && submitted === query)) return
    let text: string
    try {
      text = normalizeSearch(query)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Recherche invalide.")
      return
    }
    if (activeQuery.current === text) return
    activeQuery.current = text
    const generation = ++latest.current
    setSubmitted(query)
    setBusy(true)
    selectedResultIndex.current = null
    setSelected(null)
    setResult(null)
    setMessage("Recherche en cours…")
    try {
      const response = await search(text)
      if (generation !== latest.current) return
      setResult(response)
      setMessage(catalogueMessage(response))
    } catch (error) {
      if (generation !== latest.current) return
      const code =
        error instanceof ConvexError &&
        error.data &&
        typeof error.data === "object" &&
        "code" in error.data
          ? String(error.data.code)
          : ""
      setMessage(
        code in ERROR_MESSAGES
          ? ERROR_MESSAGES[code as ErrorCode]
          : "Le service applicatif a rencontré une erreur. Réessayez explicitement."
      )
    } finally {
      if (generation === latest.current) {
        activeQuery.current = null
        setBusy(false)
      }
    }
  }
  return (
    <section className="space-y-6" aria-label="Recherche d’aliments">
      <form onSubmit={submit} method="post" className="space-y-3">
        <Label htmlFor="food-query">Aliment à rechercher</Label>
        <Input
          id="food-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={120}
          className="min-h-11"
          aria-describedby="catalogue-status"
        />
        <Button
          type="submit"
          className="min-h-11"
          disabled={!ready || !online || (busy && submitted === query)}
        >
          {busy ? "Recherche en cours…" : "Rechercher"}
        </Button>
      </form>
      {!online && (
        <Alert>
          <AlertDescription>
            Vous êtes hors ligne. Vos saisies sont conservées. Reconnectez-vous
            puis soumettez à nouveau.
          </AlertDescription>
        </Alert>
      )}
      <p id="catalogue-status" role="status" aria-live="polite">
        {message}
      </p>
      {selected ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 ref={detailHeading} tabIndex={-1}>
                {selected.snapshot.name}
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CatalogueFood hit={selected} detail />
            <Button
              className="min-h-11"
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Retour aux résultats
            </Button>
          </CardContent>
        </Card>
      ) : (
        result?.kind === "results" && (
          <ul className="space-y-4" aria-label="Résultats de recherche">
            {result.hits.map((hit, index) => (
              <li key={`${hit.snapshot.sourceId}-${index}`}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h2>{hit.snapshot.name}</h2>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CatalogueFood hit={hit} />
                    <Button
                      className="min-h-11"
                      variant="outline"
                      ref={(button) => {
                        if (button) resultButtons.current.set(index, button)
                        else resultButtons.current.delete(index)
                      }}
                      onClick={() => {
                        selectedResultIndex.current = index
                        setSelected(hit)
                      }}
                    >
                      Voir le détail de {hit.snapshot.name}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )
      )}
      <p className="text-sm">
        Données{" "}
        <a className="underline" href="https://world.openfoodfacts.org">
          Open Food Facts
        </a>{" "}
        : base sous{" "}
        <a
          className="underline"
          href="https://opendatacommons.org/licenses/odbl/1-0/"
        >
          ODbL
        </a>
        , contenus sous{" "}
        <a
          className="underline"
          href="https://opendatacommons.org/licenses/dbcl/1-0/"
        >
          DbCL
        </a>
        .
      </p>
    </section>
  )
}
