import { expect, test } from "@playwright/test"

test("une page inconnue renvoie une 404 en français sans JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  })
  try {
    const page = await context.newPage()
    const response = await page.goto("/page-inconnue-revue")
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole("heading", { name: "404", exact: true })
    ).toBeVisible()
    await expect(
      page.getByText("La page demandée est introuvable.", { exact: true })
    ).toBeVisible()
  } finally {
    await context.close()
  }
})

test("l'accueil permet d'accéder à la connexion", async ({ page }) => {
  await page.goto("/")
  await page
    .getByRole("link", { name: "Se connecter ou créer un compte" })
    .click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole("heading", { name: "Se connecter" })
  ).toBeVisible()
})

test("un visiteur anonyme est redirigé depuis l'espace privé", async ({
  page,
}) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole("heading", { name: "Bienvenue", exact: false })
  ).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Se connecter" })
  ).toBeVisible()
})
