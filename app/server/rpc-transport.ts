import { defaultSerovalDeserializerPlugins } from "@tanstack/react-start"
import { fromJSON } from "seroval"
import { runtimeErrorResponse } from "./error-handler"

// Même limite GET que handleServerAction. Nos RPC auth sont GET uniquement,
// et startInstance ne déclare aucun adaptateur de sérialisation additionnel.
const maxPayloadSize = 1_000_000

export function validateRpcGet(request: Request): Response | undefined {
  if (request.method !== "GET") return undefined
  const contentType = request.headers.get("content-type") ?? ""
  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    return runtimeErrorResponse({ status: 400 })
  }
  const payload = new URL(request.url).searchParams.get("payload")
  if (!payload) return undefined
  if (payload.length > maxPayloadSize)
    return runtimeErrorResponse({ status: 413 })
  try {
    // Décoder avant le catch interne Start, qui journalise les erreurs brutes.
    // Le handler conserve ensuite sa propre validation et son décodage normal.
    fromJSON(JSON.parse(payload), {
      plugins: defaultSerovalDeserializerPlugins,
    })
  } catch {
    return runtimeErrorResponse({ status: 400 })
  }
}
