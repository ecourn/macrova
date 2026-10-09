import { expect, test, type Page, type Request } from "@playwright/test"
import { loadEnv } from "vite"
import { validatePublicEvent } from "../../src/domain/events"

const env = loadEnv("development", process.cwd(), "")
const endpoint = `${env.VITE_CONVEX_SITE_URL}/measurements/calculator`
const submitName = "Calculer ma cible estimative"
const resultName = "Cible estimative journalière"

async function profile(page: Page) {
  await page.locator("#age").fill("030,000000")
  await page.locator("#taille_cm").fill("175,0")
  await page.locator("#poids_kg").fill("70,00")
  await page.locator("#coefficient").selectOption("5")
  await page.locator("#pal").selectOption("1.6")
  await page.locator("#eligibilite").selectOption("oui")
}

async function edit(page: Page) {
  await page.getByLabel("Champ à modifier", { exact: true }).selectOption("P")
  await page.locator("#edit-value").fill("0110,000000")
  await page.getByRole("button", { name: "Prévisualiser le recalcul" }).click()
  await expect(
    page.getByRole("region", { name: "Prévisualisation de modification" })
  ).toContainText("285,70 g/jour")
  await page.getByRole("button", { name: "Confirmer la modification" }).click()
  await expect(
    page.getByRole("region", { name: "Cible modifiée journalière" })
  ).toContainText("110,00 g/jour")
}

function privateStorage(page: Page) {
  return page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }))
}

// Seuls des booléens et statuts sont assertés : les rapports ne recopient jamais
// les requêtes, cookies, réponses Convex ou profils, même en cas d'échec.
async function minimal(request: Request) {
  const headers = await request.allHeaders()
  expect(request.method() === "POST").toBe(true)
  expect(validatePublicEvent(request.postDataJSON()).ok).toBe(true)
  expect(request.postDataJSON().type === "calculator_completed").toBe(true)
  expect(!headers.cookie && !headers.authorization && !headers.referer).toBe(
    true
  )
  expect(new URL(request.url()).search === "").toBe(true)
}

test("HTTPS : référence, édition, retour mémoire, collecte réelle et confidentialité", async ({
  page,
  context,
  request,
}) => {
  await page.goto("/calculateur")
  const origin = new URL(page.url()).origin
  const cookies = JSON.stringify(await context.cookies())
  const storage = JSON.stringify(await privateStorage(page))
  const outgoing: Request[] = []
  page.on("request", (outbound) => outgoing.push(outbound))
  await profile(page)
  const accepted = page.waitForResponse(
    (reply) => reply.url() === endpoint && reply.request().method() === "POST"
  )
  await page.getByRole("button", { name: submitName }).click()
  for (const value of [
    "2638,00 kcal/jour",
    "98,93 g/jour",
    "296,78 g/jour",
    "117,24 g/jour",
  ])
    await expect(page.getByText(value, { exact: true })).toBeVisible()
  const response = await accepted
  expect(response.status()).toBe(200)
  expect((await response.json()).status === "accepted").toBe(true)
  const measured = response.request()
  await minimal(measured)
  const editedResponse = page.waitForResponse(
    (reply) => reply.url() === endpoint && reply.request().method() === "POST"
  )
  await edit(page)
  const editedMeasurement = await editedResponse
  expect(editedMeasurement.status()).toBe(200)
  expect((await editedMeasurement.json()).status === "accepted").toBe(true)
  await minimal(editedMeasurement.request())
  expect(
    editedMeasurement.request().postDataJSON().eventId !==
      measured.postDataJSON().eventId
  ).toBe(true)
  await page.getByRole("link", { name: "Accueil", exact: true }).click()
  await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
  await expect(page.locator("#poids_kg")).toHaveValue("70,00")
  await expect(
    page.getByRole("region", { name: "Cible modifiée journalière" })
  ).toContainText("285,70 g/jour")
  expect(JSON.stringify(await context.cookies()) === cookies).toBe(true)
  expect(JSON.stringify(await privateStorage(page)) === storage).toBe(true)
  expect(
    new URL(page.url()).search === "" && new URL(page.url()).hash === ""
  ).toBe(true)
  expect(
    outgoing.filter(
      (outbound) => outbound.url() === endpoint && outbound.method() === "POST"
    ).length
  ).toBe(2)
  for (const outbound of outgoing) {
    if (outbound.method() === "POST") {
      expect(outbound.url() === endpoint).toBe(true)
      await minimal(outbound)
    } else {
      const url = new URL(outbound.url())
      const navigation = ["/", "/calculateur"].includes(url.pathname)
      const asset =
        /^\/assets\/[A-Za-z0-9_.-]+\.(?:js|css|woff2?|png|svg|ico)$/.test(
          url.pathname
        )
      expect(
        outbound.method() === "GET" &&
          outbound.postData() === null &&
          url.origin === origin &&
          url.search === "" &&
          url.hash === "" &&
          (navigation || asset)
      ).toBe(true)
    }
  }

  const event = measured.postDataJSON()
  const replay = await request.post(endpoint, { data: event })
  expect(replay.status()).toBe(200)
  expect((await replay.json()).status === "duplicate").toBe(true)
  const collision = await request.post(endpoint, {
    data: { ...event, occurredAt: event.occurredAt + 1 },
  })
  expect(collision.status()).toBe(409)
  expect((await collision.json()).status === "collision").toBe(true)
  await page.reload()
  for (const id of ["age", "taille_cm", "poids_kg"])
    await expect(page.locator(`#${id}`)).toHaveValue("")
  await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
})

test("HTTPS : invalidité et exclusion sans mesure ni perte de saisies", async ({
  page,
}) => {
  const posts: Request[] = []
  page.on("request", (outbound) => {
    if (outbound.url() === endpoint && outbound.method() === "POST")
      posts.push(outbound)
  })
  await page.goto("/calculateur")
  await profile(page)
  await page.locator("#age").fill("19.5")
  await page.getByRole("button", { name: submitName }).click()
  await expect(
    page.getByRole("link", {
      name: "L'âge doit être un entier entre 19 et 64 ans.",
    })
  ).toBeVisible()
  await expect(page.locator("#age")).toHaveValue("19.5")
  await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
  await page.locator("#age").fill("30")
  await page.locator("#eligibilite").selectOption("non")
  await page.getByRole("button", { name: submitName }).click()
  await expect(
    page.getByRole("link", { name: /Votre situation est hors/ })
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: resultName })).toHaveCount(0)
  await expect(page.locator("#poids_kg")).toHaveValue("70,00")
  await expect(page.locator("#eligibilite")).toHaveValue("non")
  await page.getByRole("link", { name: "Accueil", exact: true }).click()
  await page.getByRole("link", { name: "Ouvrir le calculateur" }).click()
  await expect(page.locator("#eligibilite")).toHaveValue("non")
  expect(posts.length).toBe(0)
})

test("HTTPS : panne interceptée, deux tentatives identiques et édition disponible", async ({
  page,
}) => {
  const attempts: Request[] = []
  await page.route(endpoint, async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.continue()
      return
    }
    attempts.push(route.request())
    await route.fulfill({
      status: 503,
      headers: { "Access-Control-Allow-Origin": "*" },
      contentType: "application/json",
      body: JSON.stringify({ status: "unavailable" }),
    })
  })
  await page.goto("/calculateur")
  await profile(page)
  await page.getByRole("button", { name: submitName }).click()
  await expect(
    page.getByText("2638,00 kcal/jour", { exact: true })
  ).toBeVisible()
  await expect.poll(() => attempts.length).toBe(2)
  expect(attempts[0].postData() === attempts[1].postData()).toBe(true)
  for (const attempt of attempts) await minimal(attempt)
  await edit(page)
  await expect.poll(() => attempts.length).toBe(4)
  expect(attempts[2].postData() === attempts[3].postData()).toBe(true)
  expect(
    attempts[0].postDataJSON().eventId !== attempts[2].postDataJSON().eventId
  ).toBe(true)
  for (const attempt of attempts.slice(2)) await minimal(attempt)
  // Dépasser les deux fenêtres de timeout pour détecter une tentative tardive.
  await page.waitForTimeout(3200)
  expect(attempts.length).toBe(4)
})

test("HTTPS : opérations privées et bilan interne refusés à l'anonyme", async ({
  request,
}) => {
  for (const [operation, path, args] of [
    ["query", "account:getAccess", {}],
    ["mutation", "account:close", { confirmation: "CLOSE_ACCOUNT" }],
  ] as const) {
    const response = await request.post(
      `${env.VITE_CONVEX_URL}/api/${operation}`,
      {
        data: { path, args, format: "json" },
      }
    )
    const body = await response.json()
    expect(
      body.status === "error" && body.errorData?.code === "UNAUTHENTICATED"
    ).toBe(true)
  }
  const response = await request.post(`${env.VITE_CONVEX_URL}/api/query`, {
    data: {
      path: "calculatorMeasurements:summary",
      args: {
        asOf: Date.now(),
        paginationOpts: { numItems: 100, cursor: null },
      },
      format: "json",
    },
  })
  const body = await response.json()
  expect(!response.ok() || body.status === "error").toBe(true)
  expect(body.value === undefined).toBe(true)
})
