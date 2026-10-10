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
    const { normalizeSearchBody } = await import(domainPath)
    const submittedQueries: string[] = []
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
        reply: (query: string, name: string) =>
          resolve.get(query)?.(result(name)),
      },
    })
    const host = document.createElement("main")
    document.body.replaceChildren(host)
    createRoot(host).render(
      React.createElement(CatalogueSearch, {
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
