import { httpRouter } from "convex/server"
import { authComponent, createAuth } from "./auth"

import { validatePublicEvent } from "../src/domain/events"
import { internal } from "./_generated/api"
import { httpAction } from "./_generated/server"
const measurementHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
}
const http = httpRouter()
authComponent.registerRoutes(http, createAuth)
http.route({
  path: "/measurements/calculator",
  method: "OPTIONS",
  handler: httpAction(
    async () => new Response(null, { status: 204, headers: measurementHeaders })
  ),
})
http.route({
  path: "/measurements/calculator",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const respond = (status: number, outcome: string) =>
      new Response(JSON.stringify({ status: outcome }), {
        status,
        headers: measurementHeaders,
      })
    // Lecture bornée avant décodage : jamais de profil ou corps hostile conservé.
    const reader = request.body?.getReader()
    if (!reader) return respond(400, "invalid")
    let text = ""
    let bytes = 0
    const decoder = new TextDecoder()
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      bytes += chunk.value.byteLength
      if (bytes > 1024) {
        await reader.cancel()
        return respond(413, "invalid")
      }
      text += decoder.decode(chunk.value, { stream: true })
    }
    text += decoder.decode()
    let input: unknown
    try {
      input = JSON.parse(text)
    } catch {
      return respond(400, "invalid")
    }
    const valid = validatePublicEvent(input)
    if (!valid.ok || valid.value.type !== "calculator_completed")
      return respond(400, "invalid")
    const result = await ctx.runMutation(
      internal.calculatorMeasurements.collect,
      { event: valid.value }
    )
    const code =
      result.status === "invalid"
        ? 400
        : result.status === "collision"
          ? 409
          : result.status === "limited"
            ? 429
            : 200
    return respond(code, result.status)
  }),
})
export default http
