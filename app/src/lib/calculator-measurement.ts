import { EVENT_VERSION, type PublicEvent } from "../domain/events"

const TIMEOUT_MS = 1500
// Deux tentatives en mémoire, sans queue ni identité de navigateur.
export async function sendCalculatorMeasurement(
  siteUrl: string | undefined = import.meta.env.VITE_CONVEX_SITE_URL,
  transport: typeof fetch = fetch
): Promise<void> {
  if (!siteUrl) return
  try {
    const event: PublicEvent = {
      version: EVENT_VERSION,
      eventId: crypto.randomUUID(),
      occurredAt: Date.now(),
      type: "calculator_completed",
    }
    const body = JSON.stringify(event)
    const url = new URL("/measurements/calculator", siteUrl).href
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController()
      let timer: ReturnType<typeof setTimeout> | undefined
      try {
        const response = await Promise.race([
          transport(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "omit",
            referrerPolicy: "no-referrer",
            body,
            signal: controller.signal,
          }),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              controller.abort()
              reject(new Error("measurement timeout"))
            }, TIMEOUT_MS)
          }),
        ])
        if (response.ok || response.status < 500) return
      } catch {
        // Adaptateur facultatif : aucune erreur ne touche le résultat local.
      } finally {
        clearTimeout(timer)
      }
    }
  } catch {
    // Configuration ou UUID indisponible : abandon sans stockage persistant.
  }
}
