import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { FoodSnapshot } from "../src/domain/contracts"
import { checkCalculability } from "../src/domain/food"
export const VERSION = "macrova-off-audit/1"
export const ROOT = resolve(
  import.meta.dirname,
  "../../_bmad-output/initiative-macrova/epic-catalogue/audit-off-v1"
)
export type AuditCase = {
  id: string
  query: string
  categories: string[]
  brand: string | null
  state: string
  basis: string
  justification: string
  source: string
  expected: string
}
export type Capture = {
  version: string
  revision: string
  id: string
  query: string
  url: string
  capturedAt: string
  status: number | null
  reason: string | null
  retryAfter: string | null
  sha256: string
  bodyFile: string
  userAgent: string
  apiVersion?: string
}
export const hash = (body: string) =>
  createHash("sha256").update(body).digest("hex")
export function validateManifest(value: unknown): AuditCase[] {
  if ((value as { version?: unknown })?.version !== 1)
    throw Error("MANIFEST: version inconnue")
  const cases = (value as { cases?: AuditCase[] })?.cases
  if (!Array.isArray(cases) || cases.length !== 50)
    throw Error("MANIFEST: exactement 50 cas requis")
  for (const key of ["id", "query"] as const)
    if (new Set(cases.map((c) => c[key])).size !== 50)
      throw Error(`MANIFEST: ${key} non unique`)
  for (const c of cases)
    if (
      !/^OFF-\d{2}$/.test(c.id) ||
      !c.query?.trim() ||
      !c.justification?.trim() ||
      !c.source?.trim() ||
      !c.expected?.trim() ||
      !["raw", "cooked", "unknown"].includes(c.state) ||
      !["g", "ml", "unknown"].includes(c.basis) ||
      !(c.brand === null || typeof c.brand === "string") ||
      !Array.isArray(c.categories)
    )
      throw Error("MANIFEST: cas invalide")
  for (const category of [
    "brut",
    "produit-france",
    "liquide",
    "incomplet-recherche",
    "sans-resultat-recherche",
  ])
    if (!cases.some((c) => c.categories.includes(category)))
      throw Error(`MANIFEST: catégorie ${category} absente`)
  for (const basis of ["g", "ml"])
    if (!cases.some((x) => x.basis === basis))
      throw Error("MANIFEST: base absente")
  for (const state of ["raw", "cooked", "unknown"])
    if (!cases.some((c) => c.state === state))
      throw Error("MANIFEST: état absent")
  return cases
}
/** Preserve numeric JSON lexemes before JSON.parse can round them. */
export function parseLossless(body: string): unknown {
  // Validate the original grammar only; discard rounded numbers from this pass.
  JSON.parse(body)
  return JSON.parse(
    body.replace(
      /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
      (token) => (token.startsWith('"') ? token : JSON.stringify(token))
    )
  )
}
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
const string = (v: unknown) => (typeof v === "string" ? v : "")
export function sourceDecimal(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const raw = string(value)
  if (!/^\d+(?:\.\d{1,6})?$/.test(raw)) return raw || "INVALID"
  const [whole, fraction = ""] = raw.split(".")
  const tail = fraction.replace(/0+$/, "")
  return `${whole.replace(/^0+(?=\d)/, "")}${tail ? `.${tail}` : ""}`
}
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
export function normalizeProduct(input: unknown, c: AuditCase, cap: Capture) {
  const p = record(input)
  const aggregate = record(record(p.nutrition).aggregated_set)
  const fromV3 =
    cap.apiVersion === "OFF v3.6" && Object.keys(aggregate).length > 0
  const preparationSupported = !fromV3 || aggregate.preparation === "as_sold"
  let n = record(p.nutriments)
  if (fromV3) {
    n = {}
    const nutrients = record(aggregate.nutrients)
    for (const key of ["proteins", "carbohydrates", "fat", "energy-kcal"]) {
      const nutrient = record(nutrients[key])
      n[`${key}_100g`] =
        preparationSupported &&
        nutrient.source === "packaging" &&
        nutrient.source_per === aggregate.per &&
        nutrient.unit === (key === "energy-kcal" ? "kcal" : "g")
          ? nutrient.value
          : null
      n[`${key}_unit`] = nutrient.unit
      if (nutrient.modifier !== undefined)
        n[`${key}_modifier`] = nutrient.modifier
    }
  }
  const name = string(p.product_name_fr) || string(p.product_name)
  const brands = Array.isArray(p.brands)
    ? p.brands.map(string).filter(Boolean).join(", ")
    : string(p.brands)
  const evidence = fold(
    `${name} ${string(p.categories)} ${Array.isArray(p.categories_tags) ? p.categories_tags.join(" ") : ""}`
  )
  const raw = /\b(cru|crue|crues|raw|uncooked)\b/.test(evidence),
    cooked = /\b(cuit|cuite|cuits|cuites|cooked)\b/.test(evidence)
  const mixed =
    /\b(grand cru|bowl|poke|salade|chocolat|sur lit|avec|sauce|preparation)\b/.test(
      evidence
    )
  const state = !mixed && raw !== cooked ? (raw ? "raw" : "cooked") : "unknown"
  const sourceUnit = string(fromV3 ? aggregate.per : p.nutrition_data_per)
  const unit =
    sourceUnit === "100g" && string(p.product_quantity_unit) !== "ml"
      ? "g"
      : sourceUnit === "100ml"
        ? "ml"
        : null
  const snapshot: FoodSnapshot = {
    version: 1,
    revision: cap.sha256,
    sourceId: string(p.code),
    name,
    ...(brands ? { brand: brands } : {}),
    provenance: {
      name: "Open Food Facts",
      reference: `https://world.openfoodfacts.org/product/${string(p.code)}`,
    },
    capturedAt: Date.parse(cap.capturedAt),
    state,
    basis: unit
      ? { kind: "known", unit }
      : { kind: "ambiguous", sourceField: "nutrition_data_per" },
    nutrition: {
      protein: sourceDecimal(n.proteins_100g),
      carbohydrate: sourceDecimal(n.carbohydrates_100g),
      fat: sourceDecimal(n.fat_100g),
      energy: sourceDecimal(n["energy-kcal_100g"]),
    },
  }
  const relevant = fold(c.query)
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .every((t) => fold(`${name} ${brands} ${string(p.categories)}`).includes(t))
  const valid = checkCalculability(snapshot),
    reasons: string[] = []
  if (!preparationSupported) reasons.push("UNSUPPORTED_PREPARATION")
  if (p.obsolete === true || ["on", "1", "true"].includes(string(p.obsolete)))
    reasons.push("SOURCE_OBSOLETE")
  if (!relevant) reasons.push("IRRELEVANT_RESULT")
  if (c.state !== "unknown" && state !== c.state)
    reasons.push(state === "unknown" ? "STATE_UNPROVEN" : "STATE_MISMATCH")
  if (!valid.ok) reasons.push(valid.error.code)
  const missing = Object.entries(snapshot.nutrition)
    .filter(([, v]) => v === null)
    .map(([k]) => k)
  if (missing.length && !reasons.includes("MISSING_NUTRITION"))
    reasons.push("MISSING_NUTRITION")
  for (const [key, expectedUnit] of [
    ["proteins", "g"],
    ["carbohydrates", "g"],
    ["fat", "g"],
    ["energy-kcal", "kcal"],
  ]) {
    if (n[`${key}_unit`] !== undefined && n[`${key}_unit`] !== expectedUnit)
      reasons.push(`UNSUPPORTED_NUTRIENT_UNIT:${key}`)
    if (n[`${key}_modifier`] !== undefined && n[`${key}_modifier`] !== "=")
      reasons.push(`UNSUPPORTED_NUTRIENT_MODIFIER:${key}`)
  }
  if (unit && c.basis !== "unknown" && unit !== c.basis)
    reasons.push("MISSING_DENSITY")
  const status =
    reasons.length === 0
      ? "utilisable"
      : reasons.every((r) =>
            [
              "MISSING_NUTRITION",
              "AMBIGUOUS_BASIS",
              "STATE_UNPROVEN",
              "MISSING_DENSITY",
            ].includes(r)
          )
        ? "complétion privée sourcée nécessaire"
        : "non pris en charge"
  return {
    code: snapshot.sourceId,
    status,
    reasons,
    snapshot,
    sourceFields: {
      nutrition_data_per: p.nutrition_data_per ?? null,
      aggregatePer: fromV3 ? aggregate.per : null,
      nutritionSource: fromV3 ? p.nutrition : null,
      product_quantity_unit: p.product_quantity_unit ?? null,
      nutriments: n,
      missing,
      validationError: valid.ok ? null : valid.error,
      stateEvidence: evidence,
      lastIndexed: p.last_indexed_datetime ?? null,
      obsolete: p.obsolete ?? null,
    },
    action:
      status === "utilisable"
        ? "Utiliser dans la base et l’état déclarés."
        : "Confirmer la pertinence et compléter avec une source identifiable avant tout calcul.",
  }
}
export function classify(c: AuditCase, cap: Capture, body: string) {
  if (
    cap.id !== c.id ||
    cap.query !== c.query ||
    cap.version !== VERSION ||
    !Number.isFinite(Date.parse(cap.capturedAt)) ||
    !cap.revision?.trim() ||
    !cap.userAgent?.trim() ||
    cap.bodyFile !== `${c.id}.body.json` ||
    (cap.status !== null &&
      (!Number.isInteger(cap.status) ||
        cap.status < 100 ||
        cap.status > 599)) ||
    hash(body) !== cap.sha256
  )
    throw Error(`INTEGRITY: ${c.id}`)
  const endpoint = new URL(cap.url)
  const sal = cap.apiVersion === "Search-a-licious 0.1.0"
  if (
    endpoint.protocol !== "https:" ||
    endpoint.hostname !==
      (sal ? "search.openfoodfacts.org" : "world.openfoodfacts.org") ||
    endpoint.pathname !== (sal ? "/search" : "/cgi/search.pl") ||
    endpoint.searchParams.get(sal ? "q" : "search_terms") !== c.query
  )
    throw Error(`INTEGRITY: endpoint ${c.id}`)
  const trace = {
    query: c.query,
    url: cap.url,
    capturedAt: cap.capturedAt,
    status: cap.status,
    sha256: cap.sha256,
    bodyFile: cap.bodyFile,
    version: cap.version,
    revision: cap.revision,
    source: "Open Food Facts",
    apiVersion: cap.apiVersion ?? "legacy cgi/search.pl",
  }
  if (cap.status !== 200 || cap.reason)
    return {
      id: c.id,
      trace,
      status: "indisponible",
      reasons: [cap.reason || `HTTP_${cap.status}`],
      products: [],
      action: "Contrôle explicite ultérieur ; aucun retry automatique.",
    }
  try {
    const data = record(parseLossless(body))
    if (
      data.timed_out === true ||
      (Array.isArray(data.errors) && data.errors.length)
    )
      throw Error("source error")
    const sourceProducts =
      cap.apiVersion === "Search-a-licious 0.1.0" ? data.hits : data.products
    if (!Array.isArray(sourceProducts)) throw Error("products absent")
    const products = sourceProducts.map((p) => normalizeProduct(p, c, cap))
    const status = products.some((p) => p.status === "utilisable")
      ? "utilisable"
      : products.some(
            (p) => p.status === "complétion privée sourcée nécessaire"
          )
        ? "complétion privée sourcée nécessaire"
        : "non pris en charge"
    return {
      id: c.id,
      trace,
      status,
      reasons: products.length
        ? [...new Set(products.flatMap((p) => p.reasons))]
        : ["NO_RESULTS"],
      products,
      action: products.length
        ? "Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé."
        : "Liste vide, distincte d’une panne.",
    }
  } catch {
    return {
      id: c.id,
      trace,
      status: "indisponible",
      reasons: ["MALFORMED_RESPONSE"],
      products: [],
      action: "Conserver la réponse et examiner le contrat source.",
    }
  }
}
export function freshness(capturedAt: string, now: string, maxAgeMs: number) {
  return Date.parse(now) - Date.parse(capturedAt) > maxAgeMs
    ? "ancien"
    : "courant"
}
export async function replay(root = ROOT) {
  const cases = validateManifest(
      JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"))
    ),
    result = []
  for (const c of cases) {
    let metadata: string
    try {
      metadata = await readFile(
        resolve(root, "captures", `${c.id}.json`),
        "utf8"
      )
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e
      result.push({
        id: c.id,
        status: "indisponible",
        reasons: ["NOT_OBSERVED"],
        trace: null,
        products: [],
        action: "Collecte suspendue : aucune disponibilité inférée.",
      })
      continue
    }
    const cap: Capture = JSON.parse(metadata)
    if (cap.bodyFile !== `${c.id}.body.json`) throw Error("INTEGRITY: chemin")
    result.push(
      classify(
        c,
        cap,
        await readFile(resolve(root, "captures", cap.bodyFile), "utf8")
      )
    )
  }
  return { version: VERSION, cases: result }
}
export function buildUrl(c: AuditCase, sal = false) {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl")
  for (const [k, v] of Object.entries({
    search_terms: c.query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "3",
    fields: "code,product_name,nutriments,nutrition_data_per,quantity,brands",
  }))
    url.searchParams.set(k, v)
  if (sal) {
    url.href = "https://search.openfoodfacts.org/search"
    url.searchParams.set("q", c.query)
    url.searchParams.set("page_size", "3")
    url.searchParams.set("langs", "fr")
    url.searchParams.set(
      "fields",
      [
        "code",
        "product_name",
        "product_name_fr",
        "brands",
        "categories",
        "categories_tags",
        "nutriments",
        "nutrition_data_per",
        "product_quantity_unit",
        "last_indexed_datetime",
        "obsolete",
        "countries_tags",
      ].join(",")
    )
  }

  return url
}
export async function capture(root = ROOT, sal = false) {
  try {
    await readFile(resolve(root, "suspension.json"))
    throw Error(
      "SUSPENDED: lire suspension.json et attendre une reprise manuelle documentée"
    )
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e
  }
  const cases = validateManifest(
    JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"))
  )
  const userAgent = "MacrovaAudit/1 (https://github.com/ecourn/macrova)",
    revision = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim()
  await mkdir(resolve(root, "captures"), { recursive: true })
  for (const c of cases) {
    try {
      await readFile(resolve(root, "captures", `${c.id}.json`))
      continue
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    }
    const url = buildUrl(c, sal)
    const capturedAt = new Date().toISOString()
    let body = "",
      status: number | null = null,
      reason: string | null = null,
      retryAfter: string | null = null
    try {
      const response = await fetch(
        url.toString().replace(/\+/g, "%20").replace(/%2C/g, ","),
        {
          headers: { "User-Agent": userAgent },
          signal: AbortSignal.timeout(45000),
        }
      )
      status = response.status
      retryAfter = response.headers.get("retry-after")
      body = await response.text()
    } catch (e) {
      reason = e instanceof Error ? e.name : "NETWORK_ERROR"
    }
    const cap: Capture = {
      version: VERSION,
      apiVersion: sal ? "Search-a-licious 0.1.0" : "legacy cgi/search.pl",
      revision,
      id: c.id,
      query: c.query,
      url: url.toString().replace(/\+/g, "%20").replace(/%2C/g, ","),
      capturedAt,
      status,
      reason,
      retryAfter,
      sha256: hash(body),
      bodyFile: `${c.id}.body.json`,
      userAgent,
    }
    await writeFile(resolve(root, "captures", cap.bodyFile), body)
    await writeFile(
      resolve(root, "captures", `${c.id}.json`),
      JSON.stringify(cap, null, 2) + "\n"
    )
    console.log(`${c.id} ${status ?? reason}`)
    if (status === 429 || status === 503) {
      await writeFile(
        resolve(root, "suspension.json"),
        JSON.stringify(
          {
            id: c.id,
            status,
            retryAfter,
            capturedAt,
            action:
              "Pas de reprise automatique. Documenter la décision et respecter Retry-After avant retrait manuel de ce verrou.",
          },
          null,
          2
        ) + "\n"
      )
      throw Error(
        `SUSPENDED: HTTP ${status}; Retry-After=${retryAfter ?? "absent"}; reprise manuelle après délai`
      )
    }
    await new Promise((r) => setTimeout(r, 8000))
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const mode = process.argv[2]
  if (mode === "capture") await capture()
  else if (mode === "capture-sal") await capture(ROOT, true)
  else if (mode === "replay")
    console.log(JSON.stringify(await replay(), null, 2))
  else if (mode === "validate")
    console.log(
      `${validateManifest(JSON.parse(await readFile(resolve(ROOT, "manifest.json"), "utf8"))).length} cas validés`
    )
  else throw Error("Usage: bun scripts/audit-off.ts validate|capture|replay")
}
