import { afterEach, expect, test, vi } from "vitest"
import { sendCalculatorMeasurement } from "./calculator-measurement"
afterEach(() => vi.useRealTimers())
test("enveloppe minimale, UUID distincts, transport sans cookies ni auth", async () => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(new Response(null))
  await sendCalculatorMeasurement("https://backend.example", transport)
  await sendCalculatorMeasurement("https://backend.example", transport)
  const first = transport.mock.calls[0]
  expect(first[0]).toBe("https://backend.example/measurements/calculator")
  expect(first[1]).toMatchObject({
    credentials: "omit",
    referrerPolicy: "no-referrer",
    headers: { "Content-Type": "application/json" },
  })
  const event = JSON.parse(first[1]?.body as string)
  expect(Object.keys(event).sort()).toEqual([
    "eventId",
    "occurredAt",
    "type",
    "version",
  ])
  expect(event).toMatchObject({ version: 1, type: "calculator_completed" })
  expect(event.eventId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  )
  expect(
    JSON.parse(transport.mock.calls[1][1]?.body as string).eventId
  ).not.toBe(event.eventId)
})
test("configuration absente et refus définitif sans retry", async () => {
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(null, { status: 429 }))
  await sendCalculatorMeasurement("", transport)
  expect(transport).not.toHaveBeenCalled()
  await sendCalculatorMeasurement("https://backend.example", transport)
  expect(transport).toHaveBeenCalledTimes(1)
})
test("réseau et 503 : retry borné conservant toute l'enveloppe", async () => {
  for (const transport of [
    vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
    vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 503 })),
  ]) {
    await expect(
      sendCalculatorMeasurement("https://backend.example", transport)
    ).resolves.toBeUndefined()
    expect(transport).toHaveBeenCalledTimes(2)
    expect(transport.mock.calls[0][1]?.body).toBe(
      transport.mock.calls[1][1]?.body
    )
  }
})
test("timeout réel borné, même si le transport ignore AbortSignal", async () => {
  vi.useFakeTimers()
  const transport = vi.fn<typeof fetch>().mockImplementation(
    () =>
      new Promise(() => {
        /* Transport volontairement suspendu. */
      })
  )
  const operation = sendCalculatorMeasurement(
    "https://backend.example",
    transport
  )
  await vi.advanceTimersByTimeAsync(3000)
  await expect(operation).resolves.toBeUndefined()
  expect(transport).toHaveBeenCalledTimes(2)
  expect(transport.mock.calls[0][1]?.signal?.aborted).toBe(true)
})
