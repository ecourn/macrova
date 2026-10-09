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

test("édition exacte, retour avec candidat et refus, confirmation/annulation/reset privés", async ({
  page,
  context,
}) => {
  await page.goto("/calculateur")
  await profile(page)
  await page.getByRole("button", { name: submitName }).click()
  const cookies = await context.cookies()
  const storage = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }))
  const requests: string[] = []
  page.on("request", (request) =>
    requests.push(`${request.url()} ${request.postData() ?? ""}`)
  )
  const current = page.getByRole("region", {
    name: "Cible estimative journalière",
    exact: true,
  })
  await page.getByLabel("Champ à modifier", { exact: true }).selectOption("P")
  await expect(page.locator("#edit-value")).toHaveValue("")
  await page.locator("#edit-value").fill(" 0110,000000 ")
  const submit = page.getByRole("button", { name: "Prévisualiser le recalcul" })
  await submit.focus()
  await page.keyboard.press("Enter")
  await expect(submit).toBeFocused()
  await expect(current).toContainText("98,93 g/jour")
  const candidate = page.getByRole("region", {
    name: "Prévisualisation de modification",
    exact: true,
  })
  await expect(candidate).toContainText("110,00 g/jour")
  await expect(candidate).toContainText(
    "Calories et lipides conservés ; glucides recalculés."
  )
  await page.getByRole("link", { name: "Accueil", exact: true }).click()
  await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
  await expect(candidate).toBeVisible()
  await expect(page.locator("#edit-value")).toHaveValue(" 0110,000000 ")
  await candidate
    .getByText("Consulter les valeurs exactes de la prévisualisation")
    .click()
  await expect(candidate).toContainText("3957/40 ; nouvelle : 110/1")
  await expect(candidate).toContainText("11871/40 ; nouvelle : 2857/10")
  await page.getByRole("button", { name: "Confirmer la modification" }).focus()
  await page.keyboard.press("Enter")
  await expect(submit).toBeFocused()
  const modified = page.getByRole("region", {
    name: "Cible modifiée journalière",
    exact: true,
  })
  await expect(modified).toContainText("110,00 g/jour")
  await expect(modified).toContainText("16,68 / 43,32 / 40,00 %")
  await expect(candidate).toHaveCount(0)
  await page.locator("#edit-field").selectOption("E")
  await page.locator("#edit-value").fill("3191,98")
  await submit.click()
  await expect(
    page.getByText("Modification refusée", { exact: true })
  ).toBeVisible()
  await expect(modified).toContainText("110,00 g/jour")
  await expect(candidate).toHaveCount(0)
  await page.getByRole("link", { name: "Accueil", exact: true }).click()
  await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
  await expect(page.locator("#edit-value")).toHaveValue("3191,98")
  const correction = page.getByRole("link", {
    name: /Les calories doivent rester entre/,
  })
  await correction.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("#edit-value")).toBeFocused()
  expect(new URL(page.url()).hash).toBe("")
  await page.locator("#edit-value").fill("2638")
  await submit.click()
  await page
    .getByRole("button", { name: "Annuler la prévisualisation" })
    .focus()
  await page.keyboard.press("Enter")
  await expect(submit).toBeFocused()
  await expect(modified).toContainText("110,00 g/jour")
  await page
    .getByRole("button", { name: "Réinitialiser la cible originale" })
    .click()
  await expect(current).toContainText("98,93 g/jour")
  await expect(current).toContainText("15,00 / 45,00 / 40,00 %")
  await page
    .getByText("Consulter la cible courante et l'original exacts")
    .click()
  await expect(current).toContainText(
    "Courante : 5276/45 ; originale : 5276/45"
  )
  expect(await context.cookies()).toEqual(cookies)
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }))
  ).toEqual(storage)
  expect(requests.join("\n")).not.toMatch(
    /0110|3191|edit-value|poids_kg|taille_cm|eligibilite/
  )
  expect(new URL(page.url()).search).toBe("")
  await page.reload()
  await expect(page.locator("#poids_kg")).toHaveValue("")
  await expect(page.locator("#edit-value")).toHaveCount(0)
})

test("édition hors ligne au clavier à 320 px, confirmation identique et invalidation", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto("/calculateur")
  await profile(page)
  await page.getByRole("button", { name: submitName }).click()
  await context.setOffline(true)
  await expect(page.getByRole("status")).toContainText(
    "Hors ligne : le calcul et les modifications restent disponibles localement"
  )
  await page.locator("#edit-field").selectOption("E")
  await page.locator("#edit-value").fill("2638")
  const submit = page.getByRole("button", { name: "Prévisualiser le recalcul" })
  await submit.focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("heading", { name: "Prévisualisation de modification" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  for (const control of await page
    .locator("#edit-field, #edit-value, .public-page button")
    .all())
    expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  const confirm = page.getByRole("button", {
    name: "Confirmer la modification",
  })
  await confirm.focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("heading", { name: "Cible modifiée journalière" })
  ).toBeVisible()
  await expect(
    page.getByText("2638,00 kcal/jour", { exact: true })
  ).toBeVisible()
  await page.locator("#edit-field").selectOption("P")
  await page.locator("#edit-value").fill("110")
  await submit.click()
  await page.locator("#poids_kg").fill("71")
  await expect(
    page.getByRole("heading", { name: "Prévisualisation de modification" })
  ).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Cible modifiée journalière" })
  ).toHaveCount(0)
  await expect(page.locator("#edit-value")).toHaveCount(0)
  await page.getByRole("button", { name: submitName }).click()
  await expect(
    page.getByText("2654,00 kcal/jour", { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText(
      /Répartition actuelle P \/ G \/ L : 15,00 \/ 45,00 \/ 40,00 %/
    )
  ).toBeVisible()
  await context.setOffline(false)
})

test("ordre Tab, sélection absente et erreur associée au contrôle concerné", async ({
  page,
}) => {
  await page.goto("/calculateur")
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
  for (const id of [
    "age",
    "taille_cm",
    "poids_kg",
    "coefficient",
    "pal",
    "eligibilite",
  ]) {
    await page.keyboard.press("Tab")
    await expect(page.locator(`#${id}`)).toBeFocused()
  }
  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: submitName })).toBeFocused()
  await profile(page)
  await page.getByRole("button", { name: submitName }).focus()
  await page.keyboard.press("Enter")
  const preview = page.getByRole("button", {
    name: "Prévisualiser le recalcul",
  })
  await preview.focus()
  await page.keyboard.press("Enter")
  await expect(preview).toBeFocused()
  await expect(page.locator("#edit-field")).toHaveAttribute(
    "aria-describedby",
    "edit-field-error"
  )
  await expect(page.locator("#edit-value")).toHaveAttribute(
    "aria-describedby",
    "edit-help"
  )
  const error = page.getByRole("link", { name: /Modifiez un seul champ/ })
  await expect(error).toHaveAttribute("href", "#edit-field")
  await error.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("#edit-field")).toBeFocused()
  await expect(page.getByRole("alert")).toHaveCount(0)
  await page.locator("#edit-field").selectOption("P")
  await page.locator("#edit-value").fill("invalide")
  await preview.click()
  await expect(page.locator("#edit-value")).toHaveAttribute(
    "aria-describedby",
    "edit-help edit-value-error"
  )
  await expect(page.locator("#edit-field-error")).toHaveCount(0)
  await page.locator("#edit-value").fill("110")
  await preview.focus()
  await page.keyboard.press("Enter")
  await expect(preview).toBeFocused()
  await expect(
    page.getByRole("heading", { name: "Prévisualisation de modification" })
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(preview).toBeFocused()
  await expect(
    page.getByRole("heading", { name: "Prévisualisation de modification" })
  ).toHaveCount(0)
  await expect(page.getByText("98,93 g/jour", { exact: true })).toBeVisible()
  await expect(
    page.getByText(
      "Prévisualisation annulée : la cible courante est conservée.",
      { exact: true }
    )
  ).toBeVisible()
})

async function publicGeometry(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(320)
  for (const control of await page
    .locator(
      ".public-page input, .public-page select, .public-page button, .public-page nav a, .public-page summary"
    )
    .all()) {
    const box = await control.boundingBox()
    expect(box).not.toBeNull()
    if (!box) continue
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
    expect(
      await control.evaluate(
        (node) => node.scrollHeight <= node.clientHeight + 1
      )
    ).toBe(true)
  }
}

for (const textScale of [1, 2]) {
  test(`réagencement 320 px, texte ×${textScale}, états complets et focus opaque`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 })
    await page.goto("/calculateur")
    // Augmentation des rem et viewport réduit : équivalent de réagencement, pas un zoom navigateur.
    await page.addStyleTag({
      content: `html { font-size: ${16 * textScale}px; }`,
    })
    await publicGeometry(page)
    for (const select of await page.locator("select").all()) {
      for (const value of await select
        .locator("option")
        .evaluateAll((options) =>
          options.map((option) => (option as HTMLOptionElement).value)
        )) {
        await select.selectOption(value)
        expect(
          await select.evaluate((node) => {
            const control = node as HTMLSelectElement
            const style = getComputedStyle(control)
            const canvas = document.createElement("canvas")
            const context = canvas.getContext("2d")
            if (!context) return false
            context.font = style.font
            const available =
              control.clientWidth -
              parseFloat(style.paddingLeft) -
              parseFloat(style.paddingRight)
            return (
              context.measureText(control.selectedOptions[0].text).width <=
              available
            )
          })
        ).toBe(true)
      }
    }
    await page.locator("#pal").selectOption("2.0")
    await expect(page.locator("#pal")).toHaveAccessibleDescription(
      /activité importante une grande partie de la journée, hors sport intensif\/compétition/
    )
    await page.getByRole("button", { name: submitName }).click()
    await publicGeometry(page)
    await profile(page)
    await page.getByRole("button", { name: submitName }).click()
    await publicGeometry(page)
    await page
      .getByRole("button", { name: "Prévisualiser le recalcul" })
      .click()
    await publicGeometry(page)
    await page.locator("#edit-field").selectOption("P")
    await page.locator("#edit-value").fill("110")
    await page
      .getByRole("button", { name: "Prévisualiser le recalcul" })
      .click()
    await publicGeometry(page)
    await page
      .getByRole("button", { name: "Confirmer la modification" })
      .focus()
    await page.keyboard.press("Tab")
    await page.keyboard.press("Shift+Tab")
    const focus = await page
      .getByRole("button", { name: "Confirmer la modification" })
      .evaluate((node) => {
        const style = getComputedStyle(node)
        return {
          color: style.outlineColor,
          width: style.outlineWidth,
          offset: style.outlineOffset,
        }
      })
    expect(focus).toEqual({
      color: "rgb(36, 84, 61)",
      width: "2px",
      offset: "4px",
    })
    await page.keyboard.press("Enter")
    await publicGeometry(page)
  })
}

test("retour historique conserve brouillon, prévisualisation et refus avec focus des titres", async ({
  page,
}) => {
  const dialogs: string[] = []
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message())
    void dialog.dismiss()
  })
  await page.goto("/calculateur")
  await profile(page)
  await page.getByRole("button", { name: submitName }).click()
  await page.locator("#edit-field").selectOption("P")
  await page.locator("#edit-value").fill("110")
  const preview = page.getByRole("button", {
    name: "Prévisualiser le recalcul",
  })
  for (const state of ["brouillon", "prévisualisation", "refus"]) {
    if (state === "prévisualisation") await preview.click()
    if (state === "refus") {
      await page.locator("#edit-value").fill("invalide")
      await preview.click()
    }
    await page.getByRole("link", { name: "Accueil", exact: true }).click()
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
    await page.goBack()
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
    await expect(page.locator("#edit-value")).toHaveValue(
      state === "refus" ? "invalide" : "110"
    )
    await expect(
      page.getByText("98,93 g/jour", { exact: true }).first()
    ).toBeVisible()
    if (state === "prévisualisation")
      await expect(
        page.getByRole("heading", { name: "Prévisualisation de modification" })
      ).toBeVisible()
    if (state === "refus")
      await expect(
        page.getByText("Modification refusée", { exact: true })
      ).toBeVisible()
  }
  expect(dialogs).toEqual([])
})
