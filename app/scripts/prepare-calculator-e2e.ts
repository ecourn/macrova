import { chromium, expect } from "@playwright/test"

/** Préparation explicite des serveurs froids, avant les assertions E2E. */
export default async function prepareCalculatorServers() {
  const browser = await chromium.launch()
  try {
    for (const origin of ["http://localhost:3001", "http://localhost:3002"]) {
      const page = await browser.newPage()
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      console.log(`Préparation du serveur : ${origin}`)
      const response = await page.goto(`${origin}/calculateur`)
      expect(response?.status()).toBe(200)
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
