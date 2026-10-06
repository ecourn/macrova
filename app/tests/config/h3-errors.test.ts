// @vitest-environment node
import { createConnection } from "node:net"
import { setTimeout } from "node:timers/promises"
import { H3, serve } from "nitro/h3"
import { expect, test, vi } from "vitest"
import plugin from "../../server/h3-errors"
import handler from "../../server/error-handler"

// Véritable socket HTTP, vraie lecture H3 du corps puis interruption client.
// Sans le plugin, H3 émet Error: aborted avant le handler personnalisé.
test("un client interrompu ne produit que le log technique, puis le serveur reste utilisable", async () => {
  const logs = vi.spyOn(console, "error").mockImplementation(() => undefined)
  const app = new H3({
    onError: (error, event) => handler(error, event, undefined as never),
  })
  await plugin({ h3: app, fetch: app.fetch, hooks: undefined as never })
  let readingBody: () => void = () => undefined
  const bodyStarted = new Promise<void>((resolve) => {
    readingBody = resolve
  })
  app.post("/partial", async (event) => {
    readingBody()
    await event.req.json()
    return Response.json({ ok: true })
  })
  app.get("/healthy", () => Response.json({ ok: true }))
  const server = serve(app, { port: 0, hostname: "127.0.0.1", silent: true })
  await server.ready()
  const address = new URL(server.url!)
  const socket = createConnection({
    host: address.hostname,
    port: Number(address.port),
  })
  try {
    await new Promise<void>((resolve, reject) => {
      socket.once("connect", resolve)
      socket.once("error", reject)
    })
    socket.write(
      'POST /partial HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: 10000\r\n\r\n{"password":"sensitive-password'
    )
    await bodyStarted
    socket.destroy()
    for (
      let attempt = 0;
      attempt < 50 && logs.mock.calls.length === 0;
      attempt++
    )
      await setTimeout(10)
    expect(logs.mock.calls).toHaveLength(1)
    expect(logs.mock.calls[0][0]).toBe("ECONNRESET")
    expect(logs.mock.calls[0][1]).toMatch(/^[a-f0-9-]{36}$/)
    expect(JSON.stringify(logs.mock.calls)).not.toContain("sensitive-password")
    const response = await fetch(new URL("/healthy", server.url!))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  } finally {
    socket.destroy()
    await server.close()
    logs.mockRestore()
  }
})
