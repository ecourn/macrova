import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

function collectClientErrors(page: Page) {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") {
      const url = message.location().url
      // Le provider peut demander un JWT après la révocation : HTTP 401 attendu.
      const expiredToken =
        url.endsWith("/api/auth/convex/token") &&
        message.text() ===
          "Failed to load resource: the server responded with a status of 401 (Unauthorized)"
      if (!expiredToken) errors.push(`${message.text()} (${url})`)
    }
  })
  return errors
}

test("le formulaire attend JavaScript avant d'envoyer les identifiants", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  })
  try {
    const page = await context.newPage()
    await page.goto("/login")
    await page.getByLabel("E-mail", { exact: true }).fill("pending@example.com")
    await page
      .getByLabel("Mot de passe", { exact: true })
      .fill("pending-password")
    await expect(
      page.getByRole("button", { name: "Se connecter", exact: true })
    ).toBeDisabled()
    await expect(
      page.getByRole("button", { name: "Créer un compte", exact: true })
    ).toBeDisabled()
    await page.getByLabel("Mot de passe", { exact: true }).press("Enter")
    await expect(page).toHaveURL(`${baseURL}/login`)
  } finally {
    await context.close()
  }
})

test("inscription, session persistante et session révoquée", async ({
  page,
}) => {
  const email = `auth-signup-${crypto.randomUUID()}@example.com`
  const password = crypto.randomUUID()
  const pageErrors = collectClientErrors(page)

  await page.goto("/login")
  await page
    .getByRole("button", { name: "Créer un compte", exact: true })
    .click()
  await page.getByLabel("Nom", { exact: true }).fill("Test inscription")
  await page.getByLabel("E-mail", { exact: true }).fill(email)
  await page.getByLabel("Mot de passe", { exact: true }).fill(password)
  await page
    .getByRole("button", { name: "Créer mon compte", exact: true })
    .click()
  await expect(page).toHaveURL(/\/dashboard$/)
  const currentUser = page.getByText(`Connecté à Convex : ${email}`, {
    exact: true,
  })
  await expect(currentUser).toBeVisible()
  await page.reload()
  await expect(currentUser).toBeVisible()

  // Révocation hors du composant : aucun clic de déconnexion ne redirige la page.
  const response = await page.request.post("/api/auth/sign-out", {
    headers: { Origin: new URL(page.url()).origin },
    data: {},
  })
  expect(response.ok()).toBe(true)
  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole("heading", { name: "Se connecter" })
  ).toBeVisible()
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login$/)
  expect(pageErrors).toEqual([])
})

test("connexion, session persistante et déconnexion", async ({ page }) => {
  const pageErrors = collectClientErrors(page)
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
  expect(pageErrors).toEqual([])
})
