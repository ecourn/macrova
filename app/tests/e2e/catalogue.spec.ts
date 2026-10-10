import { expect, test, type Page } from "@playwright/test"

// Harness du composant de production, avec promesses contrôlées hors réseau.
// Ce test ne simule pas l'authentification : la recette réelle est séparée.
async function mount(page: Page) {
  await page.goto("/")
  await page.getByRole("button", { name: "Open TanStack Devtools" }).waitFor()
  await page.evaluate(async () => {
    const componentPath = "/src/components/catalogue-search.tsx"
    const transformed = await (await fetch(componentPath)).text()
    const reactPath = transformed.match(
      /from "([^"\n]*\/react\.js[^"\n]*)"/
    )?.[1]
    if (!reactPath)
      throw new Error("React optimisé introuvable dans le module Vite")
    const domPath = reactPath.replace("/react.js", "/react-dom_client.js")
    const domainPath = "/src/domain/catalogue.ts"
    const React = (await import(reactPath)).default
    const { createRoot } = (await import(domPath)).default
    const { CatalogueSearch } = await import(componentPath)
    const { normalizeSearchBody, normalizeProductBody } = await import(
      domainPath
    )
    const submittedQueries: string[] = []
    const productCalls: string[] = []
    let resolveProduct: ((value: unknown) => void) | undefined
    const resolve = new Map<string, (value: unknown) => void>()
    const result = (name: string) =>
      normalizeSearchBody(
        JSON.stringify({
          hits: [
            {
              code: "123456789",
              product_name_fr: name,
              nutrition_data_per: "100g",
              nutriments: {
                proteins_100g: "0",
                carbohydrates_100g: "2",
                fat_100g: "1",
                "energy-kcal_100g": "17",
              },
            },
          ],
        }),
        1791622800000,
        "synthetic-e2e"
      )
    Object.assign(window, {
      catalogueHarness: {
        calls: submittedQueries,
        productCalls,
        replyProductResult: (value: unknown) => resolveProduct?.(value),
        replyProduct: (name: string | null) =>
          resolveProduct?.(
            name === null
              ? { kind: "unavailable", reason: "NETWORK_ERROR" }
              : normalizeProductBody(
                  JSON.stringify({
                    code: "123456789",
                    errors: [],
                    status: "success",
                    result: { id: "product_found" },
                    product: {
                      code: "123456789",
                      product_name_fr: name,
                      nutrition: {
                        aggregated_set: {
                          per: "100g",
                          preparation: "as_sold",
                          nutrients: Object.fromEntries(
                            [
                              "proteins",
                              "carbohydrates",
                              "fat",
                              "energy-kcal",
                            ].map((key) => [
                              key,
                              {
                                value: "9",
                                unit: key === "energy-kcal" ? "kcal" : "g",
                                source: "packaging",
                                source_per: "100g",
                              },
                            ])
                          ),
                        },
                      },
                    },
                  }),
                  "123456789",
                  1791709200000,
                  `synthetic-${name}`
                )
          ),
        reply: (query: string, name: string) =>
          resolve.get(query)?.(result(name)),
      },
    })
    const host = document.createElement("main")
    document.body.replaceChildren(host)
    createRoot(host).render(
      React.createElement(CatalogueSearch, {
        product: (code: string) => {
          productCalls.push(code)
          return new Promise((done) => {
            resolveProduct = done
          })
        },
        search: (query: string) => {
          submittedQueries.push(query)
          return new Promise((done) => resolve.set(query, done))
        },
      })
    )
  })
  await expect(page.getByRole("button", { name: "Rechercher" })).toBeEnabled()
}

async function calls(page: Page) {
  return page.evaluate(() => Reflect.get(window, "catalogueHarness").calls)
}

async function reply(page: Page, query: string, name: string) {
  await page.evaluate(
    (input) =>
      Reflect.get(window, "catalogueHarness").reply(input.query, input.name),
    { query, name }
  )
}

test("soumission explicite et réponse tardive ignorée", async ({ page }) => {
  await mount(page)
  const field = page.getByRole("textbox", { name: "Aliment à rechercher" })
  await field.fill("ancien")
  expect(await calls(page)).toEqual([])
  await field.press("Enter")
  await expect(
    page.getByRole("button", { name: "Recherche en cours…" })
  ).toBeDisabled()
  await field.fill("récent")
  await field.press("Enter")
  expect(await calls(page)).toEqual(["ancien", "récent"])
  await reply(page, "récent", "Résultat récent")
  await expect(
    page.getByRole("heading", { name: "Résultat récent" })
  ).toBeVisible()
  await reply(page, "ancien", "Résultat ancien")
  await expect(
    page.getByRole("heading", { name: "Résultat ancien" })
  ).toHaveCount(0)
  await expect(field).toHaveValue("récent")
})

test("détail au clavier, retour et mobile conservent la saisie", async ({
  page,
}) => {
  await mount(page)
  await page.setViewportSize({ width: 320, height: 800 })
  const field = page.getByRole("textbox", { name: "Aliment à rechercher" })
  await field.fill("riz")
  await field.press("Enter")
  await reply(page, "riz", "Riz cru")
  const detail = page.getByRole("button", { name: "Voir le détail de Riz cru" })
  await detail.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Riz cru" })).toBeFocused()
  await expect(page.getByText("Identifiant OFF : 123456789")).toBeVisible()
  await expect(page.getByText("0 g", { exact: true })).toBeVisible()
  await expect(page.getByText(/aucune relecture du produit/)).toBeVisible()
  await page.getByRole("button", { name: "Retour aux résultats" }).click()
  await expect(detail).toBeVisible()
  await expect(detail).toBeFocused()
  await expect(field).toHaveValue("riz")
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320
  )
  expect(await calls(page)).toEqual(["riz"])
})

test("hors ligne : saisie conservée et aucune reprise automatique", async ({
  page,
  context,
}) => {
  await mount(page)
  const field = page.getByRole("textbox", { name: "Aliment à rechercher" })
  await field.fill("avoine")
  await context.setOffline(true)
  await expect(page.getByText(/Vous êtes hors ligne/)).toBeVisible()
  await expect(page.getByRole("button", { name: "Rechercher" })).toBeDisabled()
  await field.press("Enter")
  expect(await calls(page)).toEqual([])
  await context.setOffline(false)
  await expect(page.getByRole("button", { name: "Rechercher" })).toBeEnabled()
  await expect(field).toHaveValue("avoine")
  expect(await calls(page)).toEqual([])
  await field.press("Enter")
  expect(await calls(page)).toEqual(["avoine"])
})

async function replyProduct(page: Page, name: string | null) {
  await page.evaluate(
    (value) => Reflect.get(window, "catalogueHarness").replyProduct(value),
    name
  )
}
async function openDetail(page: Page) {
  await mount(page)
  await page.getByRole("textbox", { name: "Aliment à rechercher" }).fill("riz")
  await page.getByRole("button", { name: "Rechercher", exact: true }).click()
  await reply(page, "riz", "Riz cru")
  await page.getByRole("button", { name: "Voir le détail de Riz cru" }).click()
}
test("produit : consultation explicite, sources/dates distinctes et instantanés précédents conservés", async ({
  page,
}) => {
  await openDetail(page)
  expect(
    await page.evaluate(
      () => Reflect.get(window, "catalogueHarness").productCalls
    )
  ).toEqual([])
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await expect(
    page.getByRole("button", { name: "Consultation en cours…" })
  ).toBeDisabled()
  await replyProduct(page, "Riz consulté")
  const first = page.getByRole("region", {
    name: "Consultation produit 1",
    exact: true,
  })
  await expect(first).toBeVisible()
  await expect(first.getByText(/Produit consulté le/)).toBeVisible()
  await expect(first.getByText(/Données déclarées par la source/)).toBeVisible()
  await expect(page.getByText("0 g", { exact: true })).toBeVisible()
  await expect(page.getByText(/Recherche consultée le/)).toBeVisible()
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await replyProduct(page, "Riz nouvelle fiche")
  await expect(
    page.getByRole("region", { name: "Consultation produit 2", exact: true })
  ).toBeVisible()
  await expect(
    first.getByRole("heading", {
      name: "Consultation produit 1 : Riz consulté",
    })
  ).toBeVisible()
  await page.getByRole("button", { name: "Retour aux résultats" }).click()
  await expect(
    page.getByRole("button", { name: "Voir le détail de Riz cru" })
  ).toBeFocused()
  await expect(page.getByText("0 g", { exact: true })).toBeVisible()
})
test("produit : panne conserve le hit daté et reprise explicite", async ({
  page,
}) => {
  await openDetail(page)
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await replyProduct(page, null)
  await expect(
    page.getByText(/La connexion à la source a échoué/)
  ).toBeVisible()
  await expect(page.getByText("0 g", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("region", { name: /Consultation produit/ })
  ).toHaveCount(0)
  expect(
    await page.evaluate(
      () => Reflect.get(window, "catalogueHarness").productCalls
    )
  ).toEqual(["123456789"])
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await replyProduct(page, "Reprise produit")
  await expect(
    page.getByRole("heading", {
      name: "Consultation produit 1 : Reprise produit",
    })
  ).toBeVisible()
})
test("produit : réponse tardive abandonnée après ouverture d’un autre hit", async ({
  page,
}) => {
  await openDetail(page)
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await page.getByRole("button", { name: "Retour aux résultats" }).click()
  await page
    .getByRole("textbox", { name: "Aliment à rechercher" })
    .fill("autre")
  await page.getByRole("button", { name: "Rechercher", exact: true }).click()
  await reply(page, "autre", "Autre aliment")
  await page
    .getByRole("button", { name: "Voir le détail de Autre aliment" })
    .click()
  await replyProduct(page, "Ancien produit")
  await expect(
    page.getByRole("heading", { name: "Autre aliment", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: /Consultation produit/ })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Consulter le produit actuel" })
  ).toBeEnabled()
})

test("produit absent et produit bloqué ne sont pas annoncés frais/calculables", async ({
  page,
}) => {
  await openDetail(page)
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await page.evaluate(() =>
    Reflect.get(window, "catalogueHarness").replyProductResult({
      kind: "missing",
    })
  )
  await expect(
    page.getByText(/Ce produit est absent de la source/)
  ).toBeVisible()
  await expect(page.getByText("0 g", { exact: true })).toBeVisible()
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await page.evaluate(async () => {
    const domainPath = "/src/domain/catalogue.ts"
    const { normalizeProductBody } = await import(domainPath)
    Reflect.get(window, "catalogueHarness").replyProductResult(
      normalizeProductBody(
        JSON.stringify({
          code: "123456789",
          errors: [],
          status: "success",
          result: { id: "product_found" },
          product: {
            code: "123456789",
            product_name_fr: "Produit obsolète",
            obsolete: true,
            nutrition: {
              aggregated_set: {
                per: "100g",
                preparation: "as_sold",
                nutrients: {},
              },
            },
          },
        }),
        "123456789",
        1791709200000,
        "synthetic-obsolete"
      )
    )
  })
  await expect(
    page.getByText(/Calcul bloqué :.*Produit déclaré obsolète/)
  ).toBeVisible()
  await expect(
    page.getByText(
      /Nouvelle consultation disponible. Produit bloqué pour le calcul./
    )
  ).toBeVisible()
})
test("produit : hors ligne ignore la réponse tardive et exige une reprise explicite", async ({
  page,
  context,
}) => {
  await openDetail(page)
  await page
    .getByRole("button", { name: "Consulter le produit actuel" })
    .click()
  await context.setOffline(true)
  await expect(page.getByText(/Vous êtes hors ligne/)).toBeVisible()
  await replyProduct(page, "Réponse abandonnée")
  await expect(
    page.getByRole("region", { name: /Consultation produit/ })
  ).toHaveCount(0)
  await context.setOffline(false)
  await expect(
    page.getByRole("button", { name: "Consulter le produit actuel" })
  ).toBeEnabled()
  expect(
    await page.evaluate(
      () => Reflect.get(window, "catalogueHarness").productCalls
    )
  ).toEqual(["123456789"])
})
for (const [patch, message] of [
  [{ value: "0.1234567" }, "Valeur ou précision nutritionnelle invalide"],
  [
    { source: "computed" },
    "Valeur absente de l’étiquette : estimation ou calcul refusé",
  ],
  [
    { source_per: "serving" },
    "Base de la valeur différente de la base déclarée",
  ],
  [{ unit: "mg" }, "Unité nutritionnelle non prise en charge"],
  [{ modifier: "<" }, "Valeur approximative ou bornée non prise en charge"],
] as const) {
  test(`deux blocages nutritionnels ciblés restent distincts : ${message}`, async ({
    page,
  }) => {
    await openDetail(page)
    await page
      .getByRole("button", { name: "Consulter le produit actuel" })
      .click()
    await page.evaluate(async (nutrientPatch) => {
      const domainPath = "/src/domain/catalogue.ts"
      const { normalizeProductBody } = await import(domainPath)
      const invalid = {
        value: "2",
        unit: "g",
        source: "packaging",
        source_per: "100g",
        ...nutrientPatch,
      }
      Reflect.get(window, "catalogueHarness").replyProductResult(
        normalizeProductBody(
          JSON.stringify({
            code: "123456789",
            errors: [],
            status: "success",
            result: { id: "product_found" },
            product: {
              code: "123456789",
              product_name_fr: "Produit synthétique",
              nutrition: {
                aggregated_set: {
                  per: "100g",
                  preparation: "as_sold",
                  nutrients: { proteins: invalid, fat: invalid },
                },
              },
            },
          }),
          "123456789",
          1791709200000,
          "synthetic-two-errors"
        )
      )
    }, patch)
    const blocked = page
      .getByRole("region", { name: "Consultation produit 1", exact: true })
      .getByText(/^Calcul bloqué :/)
    await expect(blocked).toContainText(`Protéines : ${message}`)
    await expect(blocked).toContainText(`Lipides : ${message}`)
  })
}
