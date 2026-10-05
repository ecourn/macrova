import { expect, test } from "@playwright/test"

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
