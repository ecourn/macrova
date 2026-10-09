import { chromium, expect } from "@playwright/test"

/** Préparation explicite des serveurs froids, avant les assertions E2E. */
export default async function prepareCalculatorServers() {
  const browser = await chromium.launch()
  try {
    for (const origin of ["http://localhost:3001", "http://localhost:3002"]) {
      const page = await browser.newPage()
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      page.on("response", (response) => {
        if (response.status() >= 400)
          console.log(
            `Préparation HTTP ${response.status()} : ${response.url()}`
          )
      })
      console.log(`Préparation du serveur : ${origin}`)
      const navigationResponse = await page.goto(`${origin}/calculateur`)
      expect(navigationResponse?.status()).toBe(200)
      await expect(
        page.getByRole("button", { name: "Calculer ma cible estimative" })
      ).toBeEnabled({ timeout: 30_000 })
      await page.goto(origin)
      await page.waitForLoadState("networkidle")
      expect(errors).toEqual([])
      await page.close()
      console.log(`Serveur préparé : ${origin}`)
    }
  } finally {
    await browser.close()
  }
}
