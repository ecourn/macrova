import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  hash,
  normalizeProduct,
  parseLossless,
  replay,
  ROOT,
  validateManifest,
  VERSION,
  type Capture,
} from "./audit-off"
export const REFERENCES = [
  { caseId: "OFF-23", code: "0745760279005" },
  { caseId: "OFF-24", code: "3350033027046" },
  { caseId: "OFF-31", code: "3270190024309" },
]
type ProductCapture = Capture & {
  caseId: string
  code: string
  sourceCaptureSha256: string
  apiVersion: "OFF v3.6"
}
export async function replayProducts(root = ROOT) {
  const corpus = await replay(root)
  const cases = validateManifest(
    JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"))
  )
  const results = []
  for (const ref of REFERENCES) {
    let saved: string
    try {
      saved = await readFile(
        resolve(root, "products", `${ref.code}.json`),
        "utf8"
      )
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e
      continue
    }
    const cap: ProductCapture = JSON.parse(saved)
    const source = corpus.cases.find((candidate) => candidate.id === ref.caseId)
    const c = cases.find((candidate) => candidate.id === ref.caseId)
    if (
      !source?.trace ||
      !c ||
      cap.caseId !== ref.caseId ||
      cap.code !== ref.code ||
      cap.sourceCaptureSha256 !== source.trace.sha256 ||
      !source.products.some((p) => p.code === ref.code) ||
      cap.bodyFile !== `${ref.code}.body.json` ||
      cap.apiVersion !== "OFF v3.6" ||
      cap.version !== VERSION ||
      cap.query !== c.query ||
      !Number.isFinite(Date.parse(cap.capturedAt))
    )
      throw Error("PRODUCT_INTEGRITY")
    const body = await readFile(resolve(root, "products", cap.bodyFile), "utf8")
    if (
      hash(body) !== cap.sha256 ||
      cap.url !==
        `https://world.openfoodfacts.org/api/v3.6/product/${ref.code}.json`
    )
      throw Error("PRODUCT_INTEGRITY")
    if (cap.status !== 200 || cap.reason) {
      results.push({
        caseId: c.id,
        trace: cap,
        product: null,
        reasons: [cap.reason ?? `HTTP_${cap.status}`],
      })
      continue
    }
    try {
      const data = parseLossless(body) as { product?: unknown }
      if (!data.product) throw Error("PRODUCT_MALFORMED")
      const product = normalizeProduct(data.product, c, cap)
      if (product.code !== ref.code) throw Error("PRODUCT_MALFORMED")
      results.push({
        caseId: c.id,
        trace: cap,
        product,
        reasons: product.reasons,
      })
    } catch {
      results.push({
        caseId: c.id,
        trace: cap,
        product: null,
        reasons: ["PRODUCT_MALFORMED"],
      })
    }
  }
  return results
}
export async function referenceProducts(root = ROOT) {
  const corpus = await replay(root),
    enriched = await replayProducts(root)
  return [
    ...enriched
      .filter((x) => x.product?.status === "utilisable")
      .flatMap((x) =>
        x.product ? [{ caseId: x.caseId, product: x.product }] : []
      ),
    ...corpus.cases.flatMap((c) =>
      c.products
        .filter((p) => p.status === "utilisable")
        .map((product) => ({ caseId: c.id, product }))
    ),
  ]
}
export async function captureProducts(root = ROOT) {
  try {
    await readFile(resolve(root, "suspension.json"))
    throw Error("SUSPENDED")
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e
  }
  const corpus = await replay(root)
  await mkdir(resolve(root, "products"), { recursive: true })
  for (const ref of REFERENCES) {
    try {
      await readFile(resolve(root, "products", `${ref.code}.json`))
      continue
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e
    }
    const source = corpus.cases.find((candidate) => candidate.id === ref.caseId)
    if (!source?.trace || !source.products.some((p) => p.code === ref.code))
      throw Error("PRODUCT_NOT_RETURNED")
    const url = `https://world.openfoodfacts.org/api/v3.6/product/${ref.code}.json`,
      capturedAt = new Date().toISOString()
    const userAgent = "MacrovaAudit/1 (https://github.com/ecourn/macrova)"
    let body = "",
      status: number | null = null,
      reason: string | null = null,
      retryAfter: string | null = null
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(45000),
      })
      status = response.status
      retryAfter = response.headers.get("retry-after")
      body = await response.text()
    } catch (e) {
      reason = e instanceof Error ? e.name : "NETWORK_ERROR"
    }
    const cap: ProductCapture = {
      version: VERSION,
      revision: source.trace.revision,
      id: ref.caseId,
      caseId: ref.caseId,
      code: ref.code,
      query: source.trace.query,
      url,
      capturedAt,
      status,
      reason,
      retryAfter,
      sha256: hash(body),
      bodyFile: `${ref.code}.body.json`,
      userAgent,
      apiVersion: "OFF v3.6",
      sourceCaptureSha256: source.trace.sha256,
    }
    await writeFile(resolve(root, "products", cap.bodyFile), body)
    await writeFile(
      resolve(root, "products", `${ref.code}.json`),
      JSON.stringify(cap, null, 2) + "\n"
    )
    console.log(`${ref.code} ${status ?? reason}`)
    if (status === 429 || status === 503) {
      await writeFile(
        resolve(root, "suspension.json"),
        JSON.stringify(
          { code: ref.code, status, retryAfter, capturedAt },
          null,
          2
        ) + "\n"
      )
      throw Error(
        "SUSPENDED: lecture produit ; reprendre manuellement après délai sans écraser"
      )
    }
    await new Promise((r) => setTimeout(r, 8000))
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv[2] === "capture") await captureProducts()
  else if (process.argv[2] === "replay")
    console.log(JSON.stringify(await replayProducts(), null, 2))
  else throw Error("Usage: bun scripts/audit-off-products.ts capture|replay")
}
