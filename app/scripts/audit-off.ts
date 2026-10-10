import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  normalizeProduct,
  parseLossless,
} from "../src/domain/off-normalization"
export {
  normalizeProduct,
  parseLossless,
  sourceDecimal,
} from "../src/domain/off-normalization"
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
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
