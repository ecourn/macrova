import { expect, test, type Page } from "@playwright/test"
async function profile(page: Page) {
  await page.getByLabel("Âge (ans)", { exact: true }).fill(" 030,000000 ")
  await page.getByLabel("Taille (cm)", { exact: true }).fill("175,0")
  await page.getByLabel("Poids (kg)", { exact: true }).fill("70,00")
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
}
test("référence FR, obsolescence, reprise mémoire et confidentialité", async ({
  page,
  context,
}) => {
  const hydrationErrors: string[] = []
  page.on("pageerror", (error) => {
    if (error.message.includes("Hydration")) hydrationErrors.push(error.message)
  })
  await page.goto("/")
  await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
  await profile(page)
  const requests: string[] = []
  page.on("request", (request) =>
    requests.push(`${request.url()} ${request.postData() ?? ""}`)
  )
  const cookies = await context.cookies()
  const storageBefore = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }))
  await page
    .getByRole("button", { name: "Calculer ma cible estimative" })
    .click()
  for (const value of [
    "2638,00 kcal/jour",
    "98,93 g/jour",
    "296,78 g/jour",
    "117,24 g/jour",
  ])
    await expect(page.getByText(value, { exact: true })).toBeVisible()
  await page.getByLabel("Poids (kg)", { exact: true }).fill("71")
  await expect(
    page.getByRole("heading", { name: "Cible estimative journalière" })
  ).toHaveCount(0)
  await expect(
    page.getByText("Profil changé :", { exact: false })
  ).toBeVisible()
  await page.getByRole("link", { name: "Accueil", exact: true }).click()
  await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
  await expect(page.getByLabel("Poids (kg)", { exact: true })).toHaveValue("71")
  await expect(
    page.getByRole("heading", { name: "Cible estimative journalière" })
  ).toHaveCount(0)
  await page
    .getByRole("button", { name: "Calculer ma cible estimative" })
    .click()
  await expect(
    page.getByText("2654,00 kcal/jour", { exact: true })
  ).toBeVisible()
  await page.getByRole("link", { name: "Accueil", exact: true }).click()
  await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
  await expect(
    page.getByText("2654,00 kcal/jour", { exact: true })
  ).toBeVisible()
  expect(new URL(page.url()).search).toBe("")
  expect(await context.cookies()).toEqual(cookies)
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }))
  ).toEqual(storageBefore)
  expect(requests.join("\n")).not.toMatch(
    /poids_kg|taille_cm|eligibilite|030|175,0|70,00/
  )
  expect(hydrationErrors).toEqual([])
  await page.reload()
  await expect(page.getByLabel("Poids (kg)", { exact: true })).toHaveValue("")
})
test("refus accessibles et saisies conservées", async ({ page }) => {
  await page.goto("/calculateur")
  await profile(page)
  await page.getByLabel("Âge (ans)", { exact: true }).fill("19.5")
  await page
    .getByRole("button", { name: "Calculer ma cible estimative" })
    .click()
  await expect(
    page.getByRole("link", {
      name: "L'âge doit être un entier entre 19 et 64 ans.",
    })
  ).toBeVisible()
  await expect(page.getByLabel("Âge (ans)", { exact: true })).toHaveValue(
    "19.5"
  )
  await page.getByLabel("Âge (ans)", { exact: true }).fill("30")
  await page
    .getByLabel(
      "Toutes les conditions d'éligibilité sont-elles satisfaites ?",
      { exact: true }
    )
    .selectOption("incertain")
  await page
    .getByRole("button", { name: "Calculer ma cible estimative" })
    .click()
  await expect(
    page.getByRole("link", { name: /Votre situation est hors/ })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Cible estimative journalière" })
  ).toHaveCount(0)
})
test("mobile 320 px et activation clavier", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto("/calculateur")
  await profile(page)
  const button = page.getByRole("button", {
    name: "Calculer ma cible estimative",
  })
  await button.focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("heading", { name: "Cible estimative journalière" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  for (const selector of ["input", "select", 'button[type="submit"]'])
    for (const control of await page.locator(selector).all())
      expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44)
})
test("avant hydratation, formulaire inerte sans noms ni fuite GET", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`${baseURL}/calculateur`)
  await expect(page.getByLabel("Âge (ans)", { exact: true })).toBeDisabled()
  await expect(
    page.getByRole("button", { name: "Calculer ma cible estimative" })
  ).toBeDisabled()
  expect(await page.locator("form").getAttribute("method")).toBe("post")
  expect(await page.locator("form [name]").count()).toBe(0)
  await context.close()
})
