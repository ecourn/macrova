import { expect, test } from "@playwright/test"

test("sans Convex, la connexion explique la configuration requise", async ({
  page,
}) => {
  await page.goto("/login")
  await expect(
    page.getByText(
      "La connexion sera disponible après la configuration de Convex."
    )
  ).toBeVisible()
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveCount(0)
  await page.getByRole("link", { name: "← Accueil" }).click()
  await expect(page).toHaveURL("/")
})

test("sans Convex, l'API d'auth répond 503", async ({ request }) => {
  const response = await request.get("/api/auth/get-session")
  expect(response.status()).toBe(503)
  expect(await response.json()).toEqual({
    message: "Convex n'est pas configuré. Consulter README.md.",
  })
})
