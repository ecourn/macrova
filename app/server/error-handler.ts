import { defineErrorHandler } from "nitro"

const transportCodes = new Set([
  "ECONNRESET",
  "ECONNABORTED",
  "EPIPE",
  "ETIMEDOUT",
])

function technicalCode(error: unknown, status: number): string {
  // H3 peut envelopper l'erreur Node : ne lire que les codes connus de la
  // chaîne de causes, jamais les messages, payloads ou en-têtes.
  let current = error
  for (let depth = 0; depth < 4; depth++) {
    if (!current || typeof current !== "object") break
    if (
      "code" in current &&
      typeof current.code === "string" &&
      transportCodes.has(current.code)
    ) {
      return current.code
    }
    current = "cause" in current ? current.cause : undefined
  }
  return status >= 500 ? "UNAVAILABLE" : "HTTP_ERROR"
}

export default defineErrorHandler((error) => {
  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
      ? error.status
      : 500
  const code = technicalCode(error, status)
  const incidentId = crypto.randomUUID()
  console.error(code, incidentId)
  // Une réponse explicite empêche le fallback Nitro de journaliser l'erreur
  // brute. Le status utile reste présent, sans cause, stack ou payload.
  return Response.json({ code, incidentId }, { status })
})
