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

const referenceValues = [
  "2638,00 kcal/jour",
  "98,93 g/jour",
  "296,78 g/jour",
  "117,24 g/jour",
]
const submitName = "Calculer ma cible estimative"
const resultName = "Cible estimative journalière"

test("résumé unique, erreurs ordonnées et correction au clavier sans fragment", async ({
  page,
  context,
}) => {
  await page.goto("/calculateur")
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
  const fields = [
    {
      id: "age",
      raw: "+030",
      corrected: " 030,000000 ",
      message:
        "Âge : saisissez une valeur décimale valide, avec au plus six décimales.",
    },
    {
      id: "taille_cm",
      raw: "175,0000000",
      corrected: "175,0",
      message:
        "Taille : saisissez une valeur décimale valide, avec au plus six décimales.",
    },
    {
      id: "poids_kg",
      raw: "7e1",
      corrected: "70,00",
      message:
        "Poids : saisissez une valeur décimale valide, avec au plus six décimales.",
    },
  ]
  for (const field of fields) await page.locator(`#${field.id}`).fill(field.raw)
  const submit = page.getByRole("button", { name: submitName })
  await submit.focus()
  await page.keyboard.press("Enter")
  await expect(submit).toBeFocused()
  const summary = page.getByRole("group", {
    name: "Aucune estimation",
    exact: true,
  })
  await expect(summary).toBeVisible()
  await expect(summary.locator("a")).toHaveText(
    fields.map((field) => field.message)
  )
  await expect(summary.locator("..")).toHaveAttribute("aria-live", "polite")
  await expect(summary.locator("..")).toHaveAttribute("aria-atomic", "true")
  await expect(page.getByRole("alert")).toHaveCount(0)
  for (const field of fields) {
    await expect(page.locator(`#${field.id}`)).toHaveValue(field.raw)
    await expect(page.locator(`#${field.id}`)).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    await expect(page.locator(`#${field.id}`)).toHaveAttribute(
      "aria-describedby",
      `${field.id}-help ${field.id}-error`
    )
    await expect(page.locator(`#${field.id}-error`)).toHaveText(field.message)
  }
  // Tab atteint le premier lien depuis la soumission ; chaque lien est activable.
  await page.keyboard.press("Tab")
  for (const [index, field] of fields.entries()) {
    const link = summary.getByRole("link", { name: field.message, exact: true })
    if (index > 0) await link.focus()
    await expect(link).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator(`#${field.id}`)).toBeFocused()
    expect(new URL(page.url()).hash).toBe("")
    expect(new URL(page.url()).search).toBe("")
  }
  for (const field of fields)
    await page.locator(`#${field.id}`).fill(field.corrected)
  await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
  await expect(summary).toHaveCount(0)
  await submit.click()
  for (const value of referenceValues)
    await expect(page.getByText(value, { exact: true })).toBeVisible()
  for (const field of fields)
    await expect(page.locator(`#${field.id}`)).toHaveValue(field.corrected)
  expect(await context.cookies()).toEqual(cookies)
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }))
  ).toEqual(storageBefore)
  expect(requests.join("\n")).not.toMatch(
    /age|poids_kg|taille_cm|eligibilite|030|175,0|70,00|7e1/
  )
})

for (const change of [
  {
    id: "age",
    value: "18",
    error: "L'âge doit être un entier entre 19 et 64 ans.",
  },
  {
    id: "taille_cm",
    value: "119",
    error: "La taille doit être comprise entre 120 et 220 cm.",
  },
  {
    id: "poids_kg",
    value: "200",
    error:
      "Le profil est hors du domaine proposé (18,5 ≤ IMC < 30) : aucune estimation automatique.",
  },
  {
    id: "coefficient",
    value: "incertain",
    error:
      "Aucun coefficient applicable de l'étude n'a été confirmé : aucune estimation.",
  },
  {
    id: "pal",
    value: "",
    error: "Choisissez un niveau d'activité parmi les quatre proposés.",
  },
  {
    id: "eligibilite",
    value: "non",
    error:
      "Votre situation est hors du périmètre de cette méthode ou son applicabilité est incertaine : aucune estimation automatique.",
  },
]) {
  test(`résultat → refus → retour → correction : ${change.id}`, async ({
    page,
  }) => {
    await page.goto("/calculateur")
    await profile(page)
    await page.getByRole("button", { name: submitName }).click()
    await expect(page.getByRole("heading", { name: resultName })).toBeVisible()
    const control = page.locator(`#${change.id}`)
    if (["age", "taille_cm", "poids_kg"].includes(change.id))
      await control.fill(change.value)
    else await control.selectOption(change.value)
    await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
    await expect(
      page.getByText("Profil changé :", { exact: false })
    ).toBeVisible()
    await page.getByRole("link", { name: "Accueil", exact: true }).click()
    await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
    await expect(control).toHaveValue(change.value)
    await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
    await page.getByRole("button", { name: submitName }).click()
    const summary = page.getByRole("group", {
      name: "Aucune estimation",
      exact: true,
    })
    await expect(summary).toContainText(change.error)
    await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
    if (change.id === "poids_kg") {
      await expect(summary.getByRole("link")).toHaveCount(0)
      for (const id of ["age", "taille_cm", "poids_kg"])
        await expect(page.locator(`#${id}`)).toHaveAttribute(
          "aria-invalid",
          "false"
        )
    } else {
      await expect(control).toHaveAttribute("aria-invalid", "true")
      expect(await control.getAttribute("aria-describedby")).toContain(
        `${change.id}-error`
      )
    }
    await page.getByRole("link", { name: "Accueil", exact: true }).click()
    await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
    await expect(summary).toContainText(change.error)
    await expect(control).toHaveValue(change.value)
    await profile(page)
    await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
    await page.getByRole("button", { name: submitName }).click()
    for (const value of referenceValues)
      await expect(page.getByText(value, { exact: true })).toBeVisible()
    expect(new URL(page.url()).hash).toBe("")
    expect(new URL(page.url()).search).toBe("")
  })
}

test("domaines simultanés et priorités des choix sans perte des six saisies", async ({
  page,
}) => {
  await page.goto("/calculateur")
  await profile(page)
  await page.locator("#age").fill("18")
  await page.locator("#taille_cm").fill("119")
  await page.locator("#poids_kg").fill("29")
  await page.locator("#coefficient").selectOption("incertain")
  await page.locator("#pal").selectOption("")
  await page.locator("#eligibilite").selectOption("incertain")
  await page.getByRole("button", { name: submitName }).click()
  const summary = page.getByRole("group", {
    name: "Aucune estimation",
    exact: true,
  })
  await expect(summary.getByRole("link")).toHaveText([
    "L'âge doit être un entier entre 19 et 64 ans.",
    "La taille doit être comprise entre 120 et 220 cm.",
    "Le poids doit être compris entre 30 et 200 kg.",
  ])
  for (const [id, value] of Object.entries({
    age: "18",
    taille_cm: "119",
    poids_kg: "29",
    coefficient: "incertain",
    pal: "",
    eligibilite: "incertain",
  }))
    await expect(page.locator(`#${id}`)).toHaveValue(value)
  await page.locator("#age").fill("30")
  await page.locator("#taille_cm").fill("175")
  await page.locator("#poids_kg").fill("70")
  for (const step of [
    { id: "coefficient", error: /Aucun coefficient applicable/, value: "5" },
    { id: "pal", error: /Choisissez un niveau d'activité/, value: "1.6" },
    { id: "eligibilite", error: /Votre situation est hors/, value: "oui" },
  ]) {
    await page.getByRole("button", { name: submitName }).click()
    const link = summary.getByRole("link", { name: step.error })
    await expect(summary.getByRole("link")).toHaveCount(1)
    await link.focus()
    await page.keyboard.press("Enter")
    await expect(page.locator(`#${step.id}`)).toBeFocused()
    expect(new URL(page.url()).hash).toBe("")
    await page.locator(`#${step.id}`).selectOption(step.value)
    await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
  }
  await page.getByRole("button", { name: submitName }).click()
  for (const value of referenceValues)
    await expect(page.getByText(value, { exact: true })).toBeVisible()
})
