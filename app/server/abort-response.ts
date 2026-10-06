import { definePlugin } from "nitro"
import type { ServerRequest } from "srvx"
import { runtimeErrorResponse } from "./error-handler"

export default definePlugin((app) => {
  const fetch = app.fetch
  app.fetch = (request) => {
    const incoming = request as ServerRequest
    const cancellation = new AbortController()
    const abort = () => {
      // Start vérifie le signal avant/après ses middlewares et les enveloppe
      // dans une course à l'abandon. Une Response comme raison conserve cette
      // interruption, mais passe son adaptateur H3 sans exception brute.
      cancellation.abort(runtimeErrorResponse(incoming.signal.reason))
    }
    if (incoming.signal.aborted) abort()
    else incoming.signal.addEventListener("abort", abort, { once: true })
    const normalized = Object.assign(
      new Request(incoming.url, {
        method: incoming.method,
        headers: incoming.headers,
        body: incoming.body,
        signal: cancellation.signal,
        duplex: "half",
      } as RequestInit),
      { context: incoming.context, runtime: incoming.runtime, ip: incoming.ip }
    )
    return fetch(normalized)
  }
})
