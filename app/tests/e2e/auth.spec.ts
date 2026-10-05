import { expect, test } from "@playwright/test"

test("connexion, session persistante et déconnexion", async ({ page }) => {
  const email = process.env.E2E_AUTH_EMAIL
  const password = process.env.E2E_AUTH_PASSWORD
  if (!email || !password)
    throw new Error("Identifiants du compte de test absents.")

  await page.goto("/login")
  await page.getByLabel("E-mail", { exact: true }).fill(email)
  await page.getByLabel("Mot de passe", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Se connecter", exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(
    page.getByText(`Connecté à Convex : ${email}`, { exact: true })
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByText(`Connecté à Convex : ${email}`, { exact: true })
  ).toBeVisible()
  await page.goto("/login")
  await expect(page).toHaveURL(/\/dashboard$/)

  await page
    .getByRole("button", { name: "Se déconnecter", exact: true })
    .click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login$/)
})
