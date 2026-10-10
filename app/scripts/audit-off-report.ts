import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  mealTotals,
  type ReferenceLine,
  type ReferenceMeal,
} from "./audit-off-meals"
import { referenceProducts, replayProducts } from "./audit-off-products"
import { replay, ROOT, VERSION } from "./audit-off"
export async function report(root = ROOT) {
  const corpus = await replay(root)
  const usable = await referenceProducts(root)
  const unique = usable.filter(
    (p, i, a) => a.findIndex((x) => x.product.code === p.product.code) === i
  )
  // A heterogeneous vector checks exact arithmetic; this is no dietary proposal.
  const preferred = [
    "0745760279005",
    "3350033027046",
    "3270190024309",
    "3168930009078",
    "4792040020235",
    "4056489546092",
    "3421557910203",
    "20003166",
  ]
  const chosen = preferred
    .map((code) => unique.find((x) => x.product.code === code))
    .filter((x) => x !== undefined)
  const meals: ReferenceMeal[] = []
  for (const size of [3, 6]) {
    if (chosen.length < size) continue
    const lines: ReferenceLine[] = chosen.slice(0, size).map((x, i) => ({
      caseId: x.caseId,
      code: x.product.code,
      quantity: "50",
      initial: "50",
      min: "0",
      max: "100",
      step: "10",
      unit:
        x.product.snapshot.basis.kind === "known"
          ? x.product.snapshot.basis.unit
          : "ambiguous",
      locked: i === 0,
      sha256: x.product.snapshot.revision,
    }))
    const totals = mealTotals(lines, (line) => {
      const p = unique.find(
        (x) => x.caseId === line.caseId && x.product.code === line.code
      )
      if (!p) throw Error("MEAL_SOURCE")
      return p.product.snapshot
    })
    meals.push({
      id: `reference-g-${size}`,
      lines,
      totals,
      constraintsSource: "decision.md#portions-techniques",
      purpose:
        "Vecteur technique hétérogène g, état conservé (dont riz cru). Ne démontre ni repas usuel, ni portions plausibles, ni solver. Quantités/bornes/pas décidés par l’agent pour vérifier le contrat.",
    })
  }
  const enriched = await replayProducts(root)
  const counts: Record<string, number> = {}
  for (const c of corpus.cases) counts[c.status] = (counts[c.status] ?? 0) + 1
  const products = corpus.cases.flatMap((c) => c.products)
  const captured = corpus.cases.filter((c) => c.trace !== null)
  const dates = captured.map((c) => c.trace?.capturedAt ?? "").sort()
  const rows = corpus.cases
    .map(
      (c) =>
        `| ${c.id} | ${c.status} | ${c.reasons.join(", ") || "—"} | ${c.products.length} | ${c.trace?.status ?? "non observé"} | ${c.action} |`
    )
    .join("\n")
  const complete = captured.length === 50
  const decision = `# Décision d’audit OFF v1\n\nObservation du ${dates[0] ?? "inconnue"} au ${dates.at(-1) ?? "inconnue"}, normaliseur ${VERSION}, révision initiale a7356935f43691944990d2af45bc20c11ed5bf4d. Corpus technique uniquement.\n\n${captured.length}/50 interrogations réelles conservées ; ${complete ? "la collecte des cinquante requêtes est terminée" : "collecte incomplète : les non observés restent explicites"}. Statuts par cas : ${Object.entries(
    counts
  )
    .map(([k, v]) => `${k} : ${v}`)
    .join(
      " ; "
    )}. ${products.length} occurrences de produits retournées (${new Set(products.map((p) => p.code)).size} identifiants distincts), ${products.filter((p) => p.status === "utilisable").length} occurrences utilisables et ${new Set(products.filter((p) => p.status === "utilisable").map((p) => p.code)).size} produits utilisables distincts. Un cas est utilisable s’il possède au moins un résultat pertinent calculable ; les autres produits et leurs blocages restent visibles. Aucun seuil arbitraire de couverture ne vaut validation.\n\n## Décision et limites\n\nConserver OFF comme source obligatoire, sans catalogue complémentaire. Ne pas geler le catalogue applicatif sur ces seules observations. Legacy cgi/search.pl a reçu des 503 réels et est resté intermittent ; Search-a-licious est une méthode officielle alternative de lecture OFF, pas une rotation d’identité/IP. Ses hits conservent souvent un index ancien (date lastIndexed), des produits obsolete et une base nutritionnelle absente : le suffixe _100g ne distingue pas g/ml à lui seul. Aucune disponibilité actuelle, base, état, densité ni nutrition n’est inventée. Voir les captures, leurs API/version/URL exactes et les premières erreurs dans attempts/. Le constat préparatoire v2/search ignorant search_terms est confirmé par documentation : v2 ne fournit pas texte libre ; aucune adoption implicite.\n\nLes cas incomplets et sans résultat sont des recherches intentionnelles : l’observé prévaut. Un résultat au nom contenant les mots recherchés peut rester un aliment composé ; l’heuristique conservatrice de pertinence et d’état ne démontre pas l’équivalence à un brut. Les mots « grand cru » et plats mixtes ne prouvent pas l’état du riz. Les unités/modificateurs non pris en charge et précision excessive bloquent sans arrondir. La projection de champs limitée et une seule page peuvent manquer d’autres produits disponibles ; aucun taux ne se généralise aux besoins humains. Source exacte et valeurs restent contrôlables par produit dans classification.json.\n\nEnrichissements distincts : ${enriched.length} lectures produit v3.6 réellement capturées dans products/, ${enriched.filter((x) => x.product?.status === "utilisable").length} utilisables. Schéma nutrition.aggregated_set.per explicite et nutrients.value/unit/source ; seules valeurs packaging explicites dans leur source_per correspondant sont retenues, sans value_computed, estimation, conversion ni arrondi. Les amandes sont rejetées pour précision excessive et le yaourt pour obsolete=on si observé ; le tofu complet enrichit les références. Leur filiation renvoie au code et SHA de la recherche source, sans gonfler les cinquante requêtes. Voir enrichment-classification.json.\n\nActions MVP : vérifier l’endpoint texte retenu, résoudre base/état par lecture produit ou source d’étiquette identifiable, garder toute correction privée séparée ; gérer disponibilité, âge, suspension et attribution dans l’adaptateur futur. Les produits obsolètes doivent être écartés et recontrôlés explicitement. Recherche intégrée, corrections privées, identité et isolation Convex, recette cible restent à construire. CAP-3 reste ouvert, tout comme les conditions d’ouverture publique de sources.md.\n\n## Portions techniques\n\n${meals.length} références sourcées de 3 et/ou 6 aliments dans repas-reference.json ; ${meals.length ? "elles sont calculables exactement par calculatePortion v1" : "aucune référence suffisante : blocage documenté"}. Quantité initiale/confirmée 50 g, minimum 0 g, maximum 100 g, pas 10 g, première ligne verrouillée : décisions techniques de l’agent pour exercer le contrat, aucune recommandation alimentaire. Chaque aliment reste dans sa base g et son état source, dont le riz cru : aucune assimilation au riz cuit ni conversion. La sélection privilégie tofu/amandes/yaourt relus en v3.6 lorsqu’ils sont complets ; sinon riz et variantes d’avoine/crackers exercent les nombres ; elle ne prétend pas fournir une démonstration de repas habituels. Une démo produit plausible reste à designer avec ses contraintes confirmées et sources complètes. Totaux rationnels exacts enregistrés, affichage au centième uniquement ; tests revalident sources, bornes, grille, verrous et résultats. Aucun solver livré/validé, ni preuve de cible atteinte/optimalité/impossibilité. Epic démonstration/composition conserve ces vérifications.\n\n## Matrice exhaustive\n\n| Cas | Statut | Raisons | Produits | HTTP | Action |\n| --- | --- | --- | ---: | --- | --- |\n${rows}\n`
  await writeFile(
    resolve(root, "enrichment-classification.json"),
    JSON.stringify(enriched, null, 2) + "\n"
  )
  await writeFile(
    resolve(root, "classification.json"),
    JSON.stringify(corpus, null, 2) + "\n"
  )
  await writeFile(
    resolve(root, "repas-reference.json"),
    JSON.stringify(
      {
        version: 1,
        source: "Open Food Facts — captures locales contrôlées par SHA-256",
        constraintsDecision:
          "Agent, référence technique du 10 octobre 2026 ; aucune recommandation alimentaire",
        meals,
      },
      null,
      2
    ) + "\n"
  )
  await writeFile(resolve(root, "decision.md"), decision)
  return {
    captured: captured.length,
    products: products.length,
    counts,
    meals: meals.length,
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  console.log(JSON.stringify(await report()))
