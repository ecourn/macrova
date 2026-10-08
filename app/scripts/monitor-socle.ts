import { pathToFileURL } from "node:url"

export const monitorDefaults = {
  frontend: "https://macrova-socle-test.onrender.com",
  backend: "https://dazzling-puffin-856.convex.cloud",
  timeoutMs: 80_000,
}
type Service = "SSR" | "CONVEX"
type Failure = "TIMEOUT" | "TRANSPORT" | "HTTP" | "INVALID_RESPONSE" | "CONFIG"
export type ProbeResult = { service: Service; code: "OK" | Failure }
type Options = typeof monitorDefaults & { fetcher?: typeof fetch }

// Ne transporte jamais URL, corps, message d'exception ou données auth.
export function formatAlert(result: ProbeResult): string {
  return result.code === "OK"
    ? `SOCLE_${result.service}_OK`
    : `::error title=SOCLE_${result.service}::SOCLE_${result.service}_${result.code}`
}
function origin(value: string): URL {
  const url = new URL(value)
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("CONFIG")
  return url
}
async function limitedBody(response: Response): Promise<string> {
  if (!response.body) throw new Error("INVALID_RESPONSE")
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 262_144) throw new Error("INVALID_RESPONSE")
      chunks.push(value)
    }
  } finally {
    await reader.cancel().catch(() => {
      /* Annulation locale : aucun détail du transport conservé. */
    })
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return new TextDecoder().decode(bytes)
}
async function probe(service: Service, options: Options): Promise<ProbeResult> {
  let url: URL
  try {
    url = origin(service === "SSR" ? options.frontend : options.backend)
    if (
      !Number.isInteger(options.timeoutMs) ||
      options.timeoutMs < 1 ||
      options.timeoutMs > 90_000
    )
      throw new Error("CONFIG")
    if (service === "CONVEX" && !url.hostname.endsWith(".convex.cloud"))
      throw new Error("CONFIG")
  } catch {
    return { service, code: "CONFIG" }
  }
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<ProbeResult>((resolve) => {
    timer = setTimeout(() => {
      controller.abort()
      resolve({ service, code: "TIMEOUT" })
    }, options.timeoutMs)
  })
  const request = (async (): Promise<ProbeResult> => {
    try {
      const response = await (options.fetcher ?? fetch)(
        service === "SSR" ? url : new URL("/api/query", url),
        {
          method: service === "SSR" ? "GET" : "POST",
          redirect: "error",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          ...(service === "CONVEX"
            ? {
                body: JSON.stringify({
                  path: "nutrition:normalizeInput",
                  args: { input: "12,50" },
                  format: "json",
                }),
              }
            : {}),
        }
      )
      if (response.status !== 200) return { service, code: "HTTP" }
      try {
        const body = await limitedBody(response)
        if (service === "SSR") {
          if (
            !response.headers.get("content-type")?.includes("text/html") ||
            !/href=["']\/login["']/.test(body) ||
            !/href=["']\/dashboard["']/.test(body) ||
            !/href=["']\/calculateur["']/.test(body) ||
            !/<html[\s>]/i.test(body)
          )
            return { service, code: "INVALID_RESPONSE" }
        } else {
          const result = JSON.parse(body)
          if (
            result?.status !== "success" ||
            result?.value?.ok !== true ||
            result?.value?.value !== "12.5"
          )
            return { service, code: "INVALID_RESPONSE" }
        }
        return { service, code: "OK" }
      } catch {
        return { service, code: "INVALID_RESPONSE" }
      }
    } catch {
      return { service, code: "TRANSPORT" }
    }
  })()
  try {
    return await Promise.race([request, timeout])
  } finally {
    clearTimeout(timer)
    controller.abort()
  }
}
export async function monitorSocle(
  options: Partial<Options> = {}
): Promise<ProbeResult[]> {
  const config = { ...monitorDefaults, ...options }
  return Promise.all([probe("SSR", config), probe("CONVEX", config)])
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const results = await monitorSocle({
    frontend: process.env.SOCLE_FRONTEND_URL ?? monitorDefaults.frontend,
    backend: process.env.SOCLE_BACKEND_URL ?? monitorDefaults.backend,
    timeoutMs: Number(
      process.env.SOCLE_TIMEOUT_MS ?? monitorDefaults.timeoutMs
    ),
  })
  for (const result of results) console.log(formatAlert(result))
  process.exitCode = results.every((result) => result.code === "OK") ? 0 : 1
}
