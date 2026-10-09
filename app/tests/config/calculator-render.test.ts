// @vitest-environment node
import { createElement, type ComponentType, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vitest"
import {
  adoptedMethod,
  calculateCalculatorSession,
  createCalculatorSession,
  type CalculatorMethod,
  type CalculatorSession,
} from "../../src/domain/calculator"

const injected = vi.hoisted(() => ({ context: {} as unknown }))
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({
    options,
    useRouteContext: () => injected.context,
  }),
  useHydrated: () => true,
  Link: ({ to, children }: { to: string; children: ReactNode }) =>
    createElement("a", { href: to }, children),
}))
import { Route } from "../../src/routes/calculateur"

function render(method: CalculatorMethod | null | undefined) {
  const session = calculateCalculatorSession(
    {
      ...createCalculatorSession(),
      profile: {
        age: "30",
        taille_cm: "175",
        poids_kg: "70",
        coefficient: "5",
        pal: "1.6",
        eligibilite: "oui",
      },
    },
    adoptedMethod
  )
  expect(session.outcome?.ok).toBe(true)
  const before = structuredClone(session)
  injected.context = { calculatorSession: session, calculatorMethod: method }
  const markup = renderToStaticMarkup(
    createElement(Route.options.component as ComponentType)
  )
  expect(session).toEqual(before)
  assertProfile(markup, before)
  return markup
}

function assertProfile(markup: string, session: CalculatorSession) {
  for (const field of ["age", "taille_cm", "poids_kg"] as const) {
    const input = markup.match(new RegExp(`<input[^>]*id="${field}"[^>]*>`))
    expect(input?.[0]).toContain(`value="${session.profile[field]}"`)
  }
  for (const field of ["coefficient", "pal", "eligibilite"] as const) {
    const select = markup.match(
      new RegExp(`<select[^>]*id="${field}"[^>]*>(.*?)</select>`)
    )
    const selected = select?.[1].match(/<option[^>]*selected=""[^>]*>/g)
    expect(selected).toHaveLength(1)
    expect(selected?.[0]).toContain(`value="${session.profile[field]}"`)
  }
}

test("méthode adoptée v1 : résultat et véritable éditeur rendus", () => {
  const markup = render(adoptedMethod)
  expect(markup).toContain('id="result-title"')
  expect(markup).toContain("2638")
  expect(markup).toContain('id="edit-title"')
  expect(markup).toContain('id="edit-field"')
  expect(markup).toContain('id="edit-value"')
  expect(markup).toContain("Prévisualiser le recalcul")
  expect(markup).not.toContain('id="error-title"')
})

test.each([
  ["null", null],
  ["undefined", undefined],
  ["non adoptée", { ...adoptedMethod, status: "non-adoptee" }],
  ["retirée", { ...adoptedMethod, status: "retiree" }],
  ["v2 adoptée", { version: "methode-estimative-v2", status: "adoptee" }],
] satisfies [string, CalculatorMethod | null | undefined][])(
  "méthode %s : refus réel, aucune estimation ni édition, session conservée",
  (_label, method) => {
    const markup = render(method)
    expect(markup).toContain('id="error-title"')
    expect(markup).toContain("Aucune estimation")
    expect(markup).toContain("La méthode estimative n&#x27;est pas disponible")
    for (const id of ["result-title", "edit-title", "edit-field", "edit-value"])
      expect(markup).not.toContain(`id="${id}"`)
    expect(markup).not.toContain("Prévisualiser le recalcul")
  }
)
