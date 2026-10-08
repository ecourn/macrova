import { expect, test } from "@playwright/test"
test("SSR public avec auth configurée en panne : aucune lecture auth, calcul local", async ({
  page,
  request,
}) => {
  const before = await (await request.get("http://localhost:3999/count")).json()
  for (const path of ["/", "/calculateur"]) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain("Macrova")
  }
  await page.goto("/calculateur")
  await page.getByLabel("Âge (ans)", { exact: true }).fill("30")
  await page.getByLabel("Taille (cm)", { exact: true }).fill("175")
  await page.getByLabel("Poids (kg)", { exact: true }).fill("70")
  await page
    .getByLabel("Coefficient de l'étude", { exact: true })
    .selectOption("5")
  await page
    .getByLabel("Activité sur toute la journée (PAL)", { exact: true })
    .selectOption("1.6")
  await page
    .getByLabel(
      "Toutes les conditions d'éligibilité sont-elles satisfaites ?",
      { exact: true }
    )
    .selectOption("oui")
  await page
    .getByRole("button", { name: "Calculer ma cible estimative" })
    .click()
  await expect(
    page.getByText("2638,00 kcal/jour", { exact: true })
  ).toBeVisible()
  expect(
    await (await request.get("http://localhost:3999/count")).json()
  ).toEqual(before)
  const privateResponse = await request.get("/dashboard")
  expect(privateResponse.status()).toBeGreaterThanOrEqual(500)
  expect(
    (await (await request.get("http://localhost:3999/count")).json()).calls
  ).toBeGreaterThan(before.calls)
})
