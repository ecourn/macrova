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
  await page.locator("#edit-field").selectOption("E")
  await page.locator("#edit-value").fill("2638")
  await page.getByRole("button", { name: "Prévisualiser le recalcul" }).click()
  await page.getByRole("button", { name: "Confirmer la modification" }).click()
  await expect(
    page.getByRole("heading", { name: "Cible modifiée journalière" })
  ).toBeVisible()
  await expect
    .poll(
      async () =>
        (await (await request.get("http://localhost:3999/count")).json())
          .measurements
    )
    .toBeGreaterThan(before.measurements)
  expect(
    (await (await request.get("http://localhost:3999/count")).json()).calls
  ).toBe(before.calls)
  const privateResponse = await request.get("/dashboard")
  expect(privateResponse.status()).toBeGreaterThanOrEqual(500)
  expect(
    (await (await request.get("http://localhost:3999/count")).json()).calls
  ).toBeGreaterThan(before.calls)
})

async function validProfile(page: import("@playwright/test").Page) {
  await page.locator("#age").fill("30")
  await page.locator("#taille_cm").fill("175")
  await page.locator("#poids_kg").fill("70")
  await page.locator("#coefficient").selectOption("5")
  await page.locator("#pal").selectOption("1.6")
  await page.locator("#eligibilite").selectOption("oui")
}
test("intentions explicites seules : enveloppes minimales et aucune identité navigateur", async ({
  page,
  context,
}) => {
  const envelopes: Record<string, unknown>[] = []
  await context.addCookies([
    {
      name: "synthetic-session",
      value: "must-not-send",
      url: "http://localhost:3999",
    },
  ])
  await page.route(
    "http://localhost:3999/measurements/calculator",
    async (route) => {
      const request = route.request()
      expect(request.headers().cookie).toBeUndefined()
      expect(request.headers().authorization).toBeUndefined()
      expect(request.headers().referer).toBeUndefined()
      envelopes.push(request.postDataJSON())
      await route.fulfill({
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: '{"status":"accepted"}',
      })
    }
  )
  await page.goto("/calculateur")
  await validProfile(page)
  expect(envelopes).toHaveLength(0)
  const storage = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }))
  const calculate = page.getByRole("button", {
    name: "Calculer ma cible estimative",
  })
  await calculate.click()
  await expect.poll(() => envelopes.length).toBe(1)
  await calculate.click()
  await expect.poll(() => envelopes.length).toBe(2)
  await page.locator("#edit-field").selectOption("E")
  await page.locator("#edit-value").fill("2638")
  const preview = page.getByRole("button", {
    name: "Prévisualiser le recalcul",
  })
  await preview.click()
  await page
    .getByRole("button", { name: "Annuler la prévisualisation" })
    .click()
  await page.locator("#edit-field").selectOption("E")
  await page.locator("#edit-value").fill("2638")
  await preview.click()
  await page.getByRole("button", { name: "Confirmer la modification" }).click()
  await expect.poll(() => envelopes.length).toBe(3)
  await page
    .getByRole("button", { name: "Réinitialiser la cible originale" })
    .click()
  await page.locator("#edit-field").selectOption("E")
  await page.locator("#edit-value").fill("999999")
  await preview.click()
  await expect(
    page.getByText("Modification refusée", { exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Annuler la modification" }).click()
  await page.getByRole("link", { name: "Accueil", exact: true }).click()
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
  await page.goBack()
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
  // Aucun calcul ni événement implicite lors du retour historique.
  expect(envelopes).toHaveLength(3)
  await page.locator("#eligibilite").selectOption("non")
  await calculate.click()
  await expect(
    page.getByText("Aucune estimation", { exact: true })
  ).toBeVisible()
  expect(envelopes).toHaveLength(3)
  expect(new Set(envelopes.map((event) => event.eventId)).size).toBe(3)
  for (const event of envelopes) {
    expect(Object.keys(event).sort()).toEqual([
      "eventId",
      "occurredAt",
      "type",
      "version",
    ])
    expect(event).toMatchObject({ version: 1, type: "calculator_completed" })
  }
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }))
  ).toEqual(storage)
})

test("timeout puis hors ligne : résultat et confirmation immédiats, retries bornés", async ({
  page,
  context,
}) => {
  const bodies: string[] = []
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route(
    "http://localhost:3999/measurements/calculator",
    async (route) => {
      bodies.push(route.request().postData() ?? "")
      // Le transport attend la fin du test ; le timeout client annule chaque tentative.
      await new Promise<void>((resolve) => page.once("close", () => resolve()))
    }
  )
  await page.goto("/calculateur")
  await validProfile(page)
  await page
    .getByRole("button", { name: "Calculer ma cible estimative" })
    .click()
  await expect(
    page.getByText("2638,00 kcal/jour", { exact: true })
  ).toBeVisible()
  await expect.poll(() => bodies.length).toBe(2)
  expect(bodies[0]).toBe(bodies[1])
  await context.setOffline(true)
  await expect(page.getByRole("status")).toContainText("Hors ligne")
  await page.locator("#edit-field").selectOption("E")
  await page.locator("#edit-value").fill("2638")
  await page.getByRole("button", { name: "Prévisualiser le recalcul" }).click()
  await page.getByRole("button", { name: "Confirmer la modification" }).click()
  await expect(page.locator("#edit-value")).toHaveValue("")
  await expect(
    page.getByRole("heading", { name: "Cible modifiée journalière" })
  ).toBeVisible()
  for (const body of bodies) {
    expect(Object.keys(JSON.parse(body)).sort()).toEqual([
      "eventId",
      "occurredAt",
      "type",
      "version",
    ])
  }
  expect(errors).toEqual([])
  await context.setOffline(false)
})
