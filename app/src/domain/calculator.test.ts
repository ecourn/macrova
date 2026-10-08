import { expect, test } from "vitest"
import vectors from "../../../_bmad-output/initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json"
import {
  adoptedMethod,
  calculateProfile,
  changeCalculatorProfile,
  createCalculatorSession,
  displayCalculatorValue,
  validateCalculatorTarget,
  type CalculatorProfile,
} from "./calculator"
import { normalizeFrenchDecimal, rational } from "./decimal"
const reference = vectors.profils[0].profil
const firstCode = (profile: CalculatorProfile) => {
  const result = calculateProfile(profile, adoptedMethod)
  return result.ok ? "OK" : result.errors[0].code
}
test.each(vectors.profils)(
  "oracle $id : rationnels et affichages",
  ({ profil, cible }) => {
    const result = calculateProfile(profil, adoptedMethod)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    for (const key of ["E", "P", "G", "L"] as const) {
      expect(
        `${result.target[key].numerator}/${result.target[key].denominator}`
      ).toBe(cible.exact[key])
      expect(displayCalculatorValue(result.target[key])).toBe(
        cible.affichage[key]
      )
    }
  }
)
test.each(vectors.arrondis)("arrondi $exact", ({ exact, affichage }) => {
  const [n, d] = exact.split("/").map(BigInt)
  expect(displayCalculatorValue(rational(n, d))).toBe(affichage)
})
test.each([
  undefined,
  null,
  { version: adoptedMethod.version, status: "non-adoptee" as const },
  { version: adoptedMethod.version, status: "retiree" as const },
  { version: "v2", status: "adoptee" as const },
])("disponibilité prioritaire %j", (method) =>
  expect(calculateProfile({ ...reference, age: "-1" }, method)).toMatchObject({
    ok: false,
    errors: [{ code: "METHODE_INDISPONIBLE" }],
  })
)
test("version demandée différente", () =>
  expect(calculateProfile(reference, adoptedMethod, "v2")).toMatchObject({
    ok: false,
    errors: [{ code: "METHODE_INDISPONIBLE" }],
  }))
for (const item of vectors.matrice) {
  const vector = item as {
    id: string
    etape: string
    attendu: string
    saisie?: string
    canonique?: string
    champ?: string
  } & Partial<CalculatorProfile>
  if (
    !["AD-12", "borne-champ", "choix", "exclusion", "IMC"].includes(
      vector.etape
    )
  )
    continue
  test(`matrice ${vector.id}`, () => {
    if (
      vector.attendu === "NORMALISE" &&
      "saisie" in vector &&
      "canonique" in vector
    ) {
      expect(normalizeFrenchDecimal(vector.saisie ?? "")).toMatchObject({
        ok: true,
        value: vector.canonique,
      })
      return
    }
    const profile: CalculatorProfile = { ...reference }
    for (const field of [
      "age",
      "taille_cm",
      "poids_kg",
      "coefficient",
      "pal",
      "eligibilite",
    ] as const)
      if (field in vector) Object.assign(profile, { [field]: vector[field] })
    if (vector.champ && vector.saisie !== undefined)
      Object.assign(profile, { [vector.champ]: vector.saisie })
    const code = firstCode(profile)
    if (vector.attendu === "GARDE_PASSEE") {
      const order = [
        "ENTREE_INVALIDE",
        "AGE_HORS_DOMAINE",
        "TAILLE_HORS_DOMAINE",
        "POIDS_HORS_DOMAINE",
        "COEFFICIENT_NON_APPLICABLE",
        "PAL_INVALIDE",
        "ELIGIBILITE_ABSENTE",
        "SITUATION_EXCLUE",
        "IMC_HORS_DOMAINE",
        "PROTEINES_INSUFFISANTES",
        "OK",
      ]
      const forbidden =
        vector.etape === "borne-champ"
          ? order.slice(0, 4)
          : vector.etape === "choix"
            ? order.slice(0, 7)
            : vector.etape === "IMC"
              ? order.slice(0, 9)
              : order.slice(0, 8)
      expect(forbidden).not.toContain(code)
    } else expect(code).toBe(vector.attendu)
  })
}
test("erreurs numériques ordonnées", () =>
  expect(
    calculateProfile(
      {
        ...reference,
        age: "",
        taille_cm: "-1",
        poids_kg: "1e2",
      },
      adoptedMethod
    )
  ).toMatchObject({
    ok: false,
    errors: [{ field: "age" }, { field: "taille_cm" }, { field: "poids_kg" }],
  }))
for (const vector of vectors.matrice) {
  if (vector.etape !== "cible" || !vector.cible_exacte || !vector.poids_kg)
    continue
  test(`contrôle cible ${vector.id}`, () => {
    const toRational = (value: string) => {
      const [n, d] = value.split("/").map(BigInt)
      return { numerator: n, denominator: d }
    }
    const target = {
      E: toRational(vector.cible_exacte.E),
      P: toRational(vector.cible_exacte.P),
      G: toRational(vector.cible_exacte.G),
      L: toRational(vector.cible_exacte.L),
    }
    const result = validateCalculatorTarget(
      target,
      rational(BigInt(vector.poids_kg))
    )
    expect(result?.code ?? "GARDE_PASSEE").toBe(vector.attendu)
  })
}
test("brouillon isolé et invalidation de chacune des six entrées", () => {
  for (const field of Object.keys(reference) as (keyof CalculatorProfile)[]) {
    const session = {
      profile: { ...reference },
      outcome: calculateProfile(reference, adoptedMethod),
      changed: false,
    }
    const next = changeCalculatorProfile(session, field, `${reference[field]} `)
    expect(next.outcome).toBeNull()
    expect(next.changed).toBe(true)
    expect(session.outcome?.ok).toBe(true)
  }
  const a = createCalculatorSession()
  const b = createCalculatorSession()
  a.profile.age = "30"
  expect(b.profile.age).toBe("")
})
