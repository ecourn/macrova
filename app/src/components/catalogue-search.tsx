import { useEffect, useRef, useState, type FormEvent } from "react"
import { ConvexError } from "convex/values"
import { useHydrated } from "@tanstack/react-router"
import {
  type CatalogueHit,
  type CatalogueResult,
  type ProductResult,
  type ProductDetail,
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
  const [code, nutrient] = reason.split(":")
  const targeted = (
    {
      INVALID_DECIMAL: "Valeur ou précision nutritionnelle invalide",
      UNSUPPORTED_NUTRIENT_SOURCE:
        "Valeur absente de l’étiquette : estimation ou calcul refusé",
      INCOMPATIBLE_SOURCE_PER:
        "Base de la valeur différente de la base déclarée",
      UNSUPPORTED_NUTRIENT_UNIT: "Unité nutritionnelle non prise en charge",
      UNSUPPORTED_NUTRIENT_MODIFIER:
        "Valeur approximative ou bornée non prise en charge",
    } as Record<string, string>
  )[code]
  if (nutrient && targeted) {
    const label =
      (
        {
          proteins: names.protein,
          carbohydrates: names.carbohydrate,
          fat: names.fat,
          "energy-kcal": names.energy,
        } as Record<string, string>
      )[nutrient] || nutrient
    return `${label} : ${targeted}`
  }
  return (
    (
      {
        SOURCE_OBSOLETE: "Produit déclaré obsolète",
        MISSING_AGGREGATE: "Données nutritionnelles produit absentes",
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
  origin = "search",
}: {
  hit: CatalogueHit
  detail?: boolean
  origin?: "search" | "product"
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
        · {origin === "product" ? "Produit consulté" : "Recherche consultée"} le{" "}
        {date(food.capturedAt)}
      </p>
      <p className="text-sm">
        Index :{" "}
        {hit.indexedAt ? date(Date.parse(hit.indexedAt)) : "date inconnue"}
      </p>
      {detail && origin === "search" && (
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
  product,
}: {
  search: (query: string) => Promise<CatalogueResult>
  product?: (code: string) => Promise<ProductResult>
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
  const [readings, setReadings] = useState<ProductDetail[]>([])
  const [productBusy, setProductBusy] = useState(false)
  const [productMessage, setProductMessage] = useState("")
  const productGeneration = useRef(0)
  function resetProduct() {
    productGeneration.current += 1
    setReadings([])
    setProductMessage("")
    setProductBusy(false)
  }
  async function readProduct() {
    if (!selected || !product || !ready || !online || productBusy) return
    const generation = ++productGeneration.current
    setProductBusy(true)
    setProductMessage("Consultation du produit en cours…")
    try {
      const response = await product(selected.snapshot.sourceId)
      if (generation !== productGeneration.current) return
      if (response.kind === "product") {
        setReadings((previous) => [...previous, response.detail])
        setProductMessage(
          response.detail.status === "ready"
            ? "Nouvelle consultation disponible. Instantané v1 valide."
            : "Nouvelle consultation disponible. Produit bloqué pour le calcul."
        )
      } else if (response.kind === "missing")
        setProductMessage(
          "Ce produit est absent de la source. Le résultat de recherche daté reste lisible."
        )
      else if (response.kind === "limited")
        setProductMessage(
          `Budget de consultation produit atteint. Réessayez explicitement après le ${date(response.retryAt)}.`
        )
      else setProductMessage(catalogueMessage(response))
    } catch (error) {
      if (generation !== productGeneration.current) return
      const data = error instanceof ConvexError ? error.data : null
      const code =
        data && typeof data === "object" && "code" in data
          ? String(data.code)
          : ""
      setProductMessage(
        code in ERROR_MESSAGES
          ? ERROR_MESSAGES[code as ErrorCode]
          : "Le service applicatif a rencontré une erreur. Réessayez explicitement."
      )
    } finally {
      if (generation === productGeneration.current) setProductBusy(false)
    }
  }
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
        productGeneration.current += 1
        setProductBusy(false)
        setProductMessage(
          "Consultation interrompue. Réessayez explicitement après reconnexion."
        )
        latest.current += 1
        activeQuery.current = null
        setBusy(false)
      }
    }
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      productGeneration.current += 1
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
    resetProduct()
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
            {product && (
              <>
                <Button
                  className="min-h-11"
                  disabled={!ready || !online || productBusy}
                  onClick={readProduct}
                >
                  {productBusy
                    ? "Consultation en cours…"
                    : "Consulter le produit actuel"}
                </Button>
                <p role="status" aria-live="polite">
                  {productMessage}
                </p>
                {readings.map((reading, index) => (
                  <section
                    key={`${reading.snapshot.revision}-${index}`}
                    aria-label={`Consultation produit ${index + 1}`}
                    className="space-y-3 border-t pt-4"
                  >
                    <h3 className="font-semibold">
                      Consultation produit {index + 1} : {reading.snapshot.name}
                    </h3>
                    <CatalogueFood
                      origin="product"
                      hit={{
                        snapshot: reading.snapshot,
                        indexedAt: selected.indexedAt,
                        reasons: reading.reasons,
                      }}
                    />
                    <p>
                      {reading.status === "ready"
                        ? "Instantané v1 valide dans la base et l’état indiqués."
                        : `Calcul bloqué : ${[...new Set(reading.reasons.map(reasonText))].join(" ; ")}.`}
                    </p>
                    <ProductSource detail={reading} />
                  </section>
                ))}
              </>
            )}
            <Button
              className="min-h-11"
              variant="outline"
              onClick={() => {
                resetProduct()
                setSelected(null)
              }}
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
                        resetProduct()
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

function ProductSource({ detail }: { detail: ProductDetail }) {
  const fields = detail.sourceFields
  return (
    <div className="space-y-2 text-sm">
      <h4 className="font-semibold">Données déclarées par la source</h4>
      <p>
        Préparation :{" "}
        {fields.preparation === "as_sold"
          ? "tel que vendu"
          : fields.preparation || "absente"}{" "}
        · Base : {fields.aggregatePer || "absente"} · Unité du produit :{" "}
        {fields.productQuantityUnit || "absente"}
      </p>
      <p>Éléments décrivant l’état : {fields.stateEvidence || "absents"}</p>
      <p>Obsolescence déclarée : {fields.obsolete || "non indiquée"}</p>
      <dl className="space-y-2">
        {Object.entries(fields.nutrients).map(([key, value]) => (
          <div key={key}>
            <dt className="font-semibold">
              {
                (
                  {
                    proteins: "Protéines",
                    carbohydrates: "Glucides",
                    fat: "Lipides",
                    "energy-kcal": "Calories",
                  } as Record<string, string>
                )[key]
              }
            </dt>
            <dd className="break-words">
              Valeur source : {value.value ?? "absente"} {value.unit ?? ""} ·
              Origine :{" "}
              {value.source === "packaging"
                ? "étiquette"
                : value.source || "absente"}{" "}
              · Pour : {value.source_per || "absent"} · Qualificatif :{" "}
              {value.modifier || "non indiqué"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
