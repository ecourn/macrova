// @vitest-environment node
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vitest"
vi.mock("@tanstack/react-router", () => ({ useHydrated: () => false }))
import {
  CatalogueFood,
  CatalogueSearch,
  catalogueMessage,
} from "../../src/components/catalogue-search"
import { normalizeSearchBody } from "../../src/domain/catalogue"
test("formulaire SSR accessible et sans soumission avant hydratation", () => {
  const search = vi.fn()
  const markup = renderToStaticMarkup(
    createElement(CatalogueSearch, { search })
  )
  expect(markup).toContain('method="post"')
  expect(markup).toContain('for="food-query"')
  expect(markup).toContain('id="food-query"')
  expect(markup).toContain('disabled=""')
  expect(markup).toContain('role="status"')
  expect(markup).toContain("ODbL")
  expect(markup).toContain("DbCL")
  expect(search).not.toHaveBeenCalled()
})
test("détail sourcé : quatre libellés, zéro/absence, limites d’index", () => {
  const result = normalizeSearchBody(
    '{"hits":[{"code":"123456789","product_name":"Riz","nutriments":{"proteins_100g":0}}]}',
    0,
    "r"
  )
  if (result.kind !== "results") throw Error("fixture")
  const markup = renderToStaticMarkup(
    createElement(CatalogueFood, { hit: result.hits[0], detail: true })
  )
  for (const text of [
    "Protéines",
    "Glucides",
    "Lipides",
    "Calories",
    "0 g",
    "Manquant",
    "État inconnu",
    "Base nutritionnelle ambiguë",
    "date inconnue",
    "aucune relecture",
    "123456789",
  ])
    expect(markup).toContain(text)
  expect(markup).toContain("https://world.openfoodfacts.org/product/123456789")
})
test("états vide, indisponibilité, quota et suspension différenciés", () => {
  expect(
    catalogueMessage({ kind: "results", hits: [], capturedAt: 0 })
  ).toContain("Aucun résultat")
  expect(
    catalogueMessage({ kind: "unavailable", reason: "TIMEOUT" })
  ).toContain("répondu à temps")
  expect(catalogueMessage({ kind: "limited", retryAt: 0 })).toContain("Budget")
  expect(catalogueMessage({ kind: "suspended", retryAt: 0 })).toContain(
    "suspendu"
  )
})
