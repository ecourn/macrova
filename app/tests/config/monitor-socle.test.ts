// @vitest-environment node
import { expect, test, vi } from "vitest"
import { formatAlert, monitorSocle } from "../../scripts/monitor-socle"
const success = () =>
  vi.fn<typeof fetch>().mockImplementation(async (_url, options) =>
    options?.method === "POST"
      ? Response.json({
          status: "success",
          value: { ok: true, value: "12.5" },
        })
      : new Response(
          `<html><a href="/login">Connexion</a><a href="/dashboard">Mon espace</a></html>`,
          {
            headers: { "content-type": "text/html" },
          }
        )
  )
test("deux sondes publiques conformes sans authentification", async () => {
  const fetcher = success()
  expect(await monitorSocle({ fetcher })).toEqual([
    { service: "SSR", code: "OK" },
    { service: "CONVEX", code: "OK" },
  ])
  const request = fetcher.mock.calls[1][1]
  expect(JSON.parse(String(request?.body))).toEqual({
    path: "nutrition:normalizeInput",
    args: { input: "12,50" },
    format: "json",
  })
  expect(request?.headers).not.toHaveProperty("Authorization")
})
test.each(["transport", "http", "malformed", "wrong", "large"])(
  "panne %s : uniquement codes fixes",
  async (kind) => {
    const sensitive = "password=secret cookie=private person@example.com"
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      if (kind === "transport") throw new Error(sensitive)
      if (kind === "http") return new Response(sensitive, { status: 503 })
      if (kind === "malformed") return new Response(sensitive)
      if (kind === "large") return new Response("x".repeat(262_145))
      return Response.json({
        status: "success",
        value: { ok: true, value: sensitive },
      })
    })
    const results = await monitorSocle({ fetcher })
    expect(results.every((result) => result.code !== "OK")).toBe(true)
    expect(results.map(formatAlert).join("\n")).not.toMatch(
      /secret|private|example|password|cookie/
    )
    expect(results.map(formatAlert).join("\n")).toContain("::error")
  }
)
test("timeout borné même si le transport ignore AbortSignal", async () => {
  const fetcher = vi.fn<typeof fetch>().mockImplementation(
    () =>
      new Promise(() => {
        /* Transport synthétique bloqué. */
      })
  )
  expect(await monitorSocle({ fetcher, timeoutMs: 5 })).toEqual([
    { service: "SSR", code: "TIMEOUT" },
    { service: "CONVEX", code: "TIMEOUT" },
  ])
  expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true)
})
test("timeout de lecture du corps après headers HTTP", async () => {
  const fetcher = vi.fn<typeof fetch>().mockImplementation(
    async () =>
      new Response(
        new ReadableStream({
          start() {
            /* Corps synthétique bloqué. */
          },
        })
      )
  )
  expect(
    (await monitorSocle({ fetcher, timeoutMs: 5 })).every(
      (result) => result.code === "TIMEOUT"
    )
  ).toBe(true)
})
test("configuration avec credential ou timeout excessif refusée avant réseau", async () => {
  const fetcher = success()
  expect(
    (
      await monitorSocle({
        frontend: "https://person:secret@host.test",
        timeoutMs: 90_001,
        fetcher,
      })
    ).every((result) => result.code === "CONFIG")
  ).toBe(true)
  expect(fetcher).not.toHaveBeenCalled()
})
