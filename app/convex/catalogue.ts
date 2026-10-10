import { v } from "convex/values"
import {
  type CatalogueResult,
  NETWORK_TIMEOUT_MS,
  OFF_API_VERSION,
  OFF_ENDPOINT,
  normalizeSearch,
  normalizeSearchBody,
  searchUrl,
  suspensionDeadline,
} from "../src/domain/catalogue"
import { internal } from "./_generated/api"
import { action, env } from "./_generated/server"
import { catalogueResultValidator } from "./contracts/catalogue"

export const search = action({
  args: { query: v.string() },
  returns: catalogueResultValidator,
  handler: async (ctx, { query }): Promise<CatalogueResult> => {
    const normalized = normalizeSearch(query)
    const reservation = await ctx.runMutation(internal.catalogueState.reserve, {
      key: JSON.stringify([normalized, "fr", OFF_API_VERSION]),
    })
    if (reservation.kind !== "attached") return reservation
    if (reservation.leader) {
      const blocked = await ctx.runMutation(internal.catalogueState.receive, {
        participantId: reservation.participantId,
        beforeNetwork: true,
      })
      if (blocked) {
        await ctx.runMutation(internal.catalogueState.finish, {
          jobId: reservation.jobId,
          result: blocked,
          suspendUntil: null,
        })
        return blocked
      }
      let result: CatalogueResult
      let suspendUntil: number | null = null
      const endpoint = env.OFF_SEARCH_ENDPOINT
      const userAgent = env.OFF_USER_AGENT
      if (
        endpoint !== OFF_ENDPOINT ||
        env.OFF_SEARCH_API_VERSION !== OFF_API_VERSION ||
        !userAgent?.startsWith("Macrova/") ||
        !/https:\/\//.test(userAgent)
      ) {
        result = { kind: "unavailable", reason: "CONFIGURATION" }
      } else {
        // Ce catch ne couvre que la source distante ; les pannes Convex restent originales.
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS)
        try {
          const response = await fetch(searchUrl(normalized, endpoint), {
            method: "GET",
            headers: { "User-Agent": userAgent, Accept: "application/json" },
            credentials: "omit",
            redirect: "error",
            signal: controller.signal,
          })
          const capturedAt = Date.now()
          if (response.status === 429 || response.status === 503) {
            suspendUntil = suspensionDeadline(
              response.headers.get("Retry-After"),
              capturedAt
            )
            result = { kind: "suspended", retryAt: suspendUntil }
          } else if (!response.ok)
            result = { kind: "unavailable", reason: `HTTP_${response.status}` }
          else {
            // Lecture bornée, y compris lorsque Content-Length est absent.
            const reader = response.body?.getReader()
            if (!reader) throw new Error("EMPTY_BODY")
            const chunks: Uint8Array[] = []
            let size = 0
            try {
              while (true) {
                const chunk = await reader.read()
                if (chunk.done) break
                size += chunk.value.byteLength
                if (size > 256_000) throw new Error("RESPONSE_TOO_LARGE")
                chunks.push(chunk.value)
              }
            } finally {
              await reader.cancel()
            }
            const bytes = new Uint8Array(size)
            let offset = 0
            for (const chunk of chunks) {
              bytes.set(chunk, offset)
              offset += chunk.length
            }
            const digest = await crypto.subtle.digest("SHA-256", bytes)
            const revision = Array.from(new Uint8Array(digest), (byte) =>
              byte.toString(16).padStart(2, "0")
            ).join("")
            result = normalizeSearchBody(
              new TextDecoder().decode(bytes),
              capturedAt,
              revision
            )
          }
        } catch (error) {
          result = {
            kind: "unavailable",
            reason: controller.signal.aborted
              ? "TIMEOUT"
              : error instanceof Error && error.message === "RESPONSE_TOO_LARGE"
                ? "RESPONSE_TOO_LARGE"
                : "NETWORK_ERROR",
          }
        } finally {
          clearTimeout(timeout)
        }
      }
      await ctx.runMutation(internal.catalogueState.finish, {
        jobId: reservation.jobId,
        result,
        suspendUntil,
      })
    }
    // Participants rattachés pendant l'appel uniquement ; aucune lecture de cache.
    const deadline = Date.now() + NETWORK_TIMEOUT_MS + 5000
    while (Date.now() < deadline) {
      const result = await ctx.runMutation(internal.catalogueState.receive, {
        participantId: reservation.participantId,
        beforeNetwork: false,
      })
      if (result) return result
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return { kind: "unavailable", reason: "WORK_EXPIRED" }
  },
})
