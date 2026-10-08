import { expect, test } from "vitest"
import vectors from "../../../_bmad-output/initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json"
import {
  adoptedMethod,
  calculateCalculatorSession,
  changeCalculatorEdit,
  previewCalculatorEdit,
  confirmCalculatorEdit,
  cancelCalculatorEdit,
  resetCalculatorTarget,
  type CalculatorSession,
  type CalculatorTarget,
  calculateProfile,
  changeCalculatorProfile,
  createCalculatorSession,
  displayCalculatorValue,
  validateCalculatorTarget,
  type CalculatorProfile,
  type CalculatorMethod,
} from "./calculator"
import { normalizeFrenchDecimal, rational } from "./decimal"
const reference = vectors.profils[0].profil
const firstCode = (profile: CalculatorProfile) => {
  const before = { ...profile }
  const result = calculateProfile(Object.freeze(profile), adoptedMethod)
  expect(profile).toEqual(before)
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
          ? order.slice(0, 5)
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
      ...createCalculatorSession(),
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

const numericFields = ["age", "taille_cm", "poids_kg"] as const
for (const vector of vectors.matrice) {
  if (vector.etape === "disponibilite") {
    test(`disponibilité documentaire ${vector.id}`, () => {
      const methods: Record<string, CalculatorMethod | undefined> = {
        absente: undefined,
        "non-approuvee": { ...adoptedMethod, status: "non-adoptee" },
        retiree: { ...adoptedMethod, status: "retiree" },
        "version-differente": { ...adoptedMethod, version: "v2" },
      }
      expect(
        calculateProfile(
          { ...reference, ...vector.profil },
          methods[vector.statut ?? ""]
        )
      ).toMatchObject({
        ok: false,
        errors: [{ code: vector.attendu }],
      })
    })
  }
  if (vector.etape !== "AD-12" || vector.saisie === undefined) continue
  for (const field of numericFields) {
    test(`AD-12 transversal ${vector.id} / ${field}`, () => {
      const input = Object.freeze({ ...reference, [field]: vector.saisie })
      const outcome = calculateProfile(input, adoptedMethod)
      expect(input[field]).toBe(vector.saisie)
      if (vector.attendu === "ENTREE_INVALIDE") {
        expect(outcome).toEqual({
          ok: false,
          errors: [
            {
              code: "ENTREE_INVALIDE",
              field,
              message: `${{ age: "Âge", taille_cm: "Taille", poids_kg: "Poids" }[field]} : saisissez une valeur décimale valide, avec au plus six décimales.`,
            },
          ],
        })
      } else {
        expect(normalizeFrenchDecimal(input[field])).toEqual({
          ok: true,
          value: vector.canonique,
        })
        // Une syntaxe admise ne garantit ni le domaine ni l'éligibilité.
        if (!outcome.ok)
          expect(outcome.errors.map((error) => error.code)).not.toContain(
            "ENTREE_INVALIDE"
          )
      }
    })
  }
}
test.each([
  { age: " 030,000000 ", taille_cm: "00175,000000", poids_kg: "070,000000" },
  { age: " 030.000000 ", taille_cm: "00175.000000", poids_kg: "070.000000" },
])("normalisation du profil complet sans mutation du brouillon %j", (raw) => {
  const input = Object.freeze({ ...reference, ...raw })
  const outcome = calculateProfile(input, adoptedMethod)
  expect(outcome).toEqual(calculateProfile(reference, adoptedMethod))
  expect(input).toEqual({ ...reference, ...raw })
  expect(outcome.ok && outcome.profile).toEqual(reference)
})
test("priorités entre syntaxe, domaines, choix, exclusion et IMC", () => {
  const cases: [Partial<CalculatorProfile>, string][] = [
    [{ age: "18", taille_cm: "", eligibilite: "non" }, "ENTREE_INVALIDE"],
    [{ age: "18", coefficient: "", eligibilite: "non" }, "AGE_HORS_DOMAINE"],
    [
      { coefficient: "", pal: "", eligibilite: "" },
      "COEFFICIENT_NON_APPLICABLE",
    ],
    [{ pal: "", eligibilite: "" }, "PAL_INVALIDE"],
    [
      { eligibilite: "", taille_cm: "160", poids_kg: "80" },
      "ELIGIBILITE_ABSENTE",
    ],
    [
      { eligibilite: "incertain", taille_cm: "160", poids_kg: "80" },
      "SITUATION_EXCLUE",
    ],
  ]
  for (const [patch, code] of cases)
    expect(firstCode({ ...reference, ...patch })).toBe(code)
  expect(
    calculateProfile(
      { ...reference, age: "18", taille_cm: "119", poids_kg: "29" },
      adoptedMethod
    )
  ).toMatchObject({
    ok: false,
    errors: [
      { field: "age", code: "AGE_HORS_DOMAINE" },
      { field: "taille_cm", code: "TAILLE_HORS_DOMAINE" },
      { field: "poids_kg", code: "POIDS_HORS_DOMAINE" },
    ],
  })
})
test("les huit couples coefficient/PAL conservent un calcul exact", () => {
  // Oracles indépendants : repos A = 6595/4, repos féminin = 5931/4.
  const energies = {
    "5": ["46165/20", "2638/1", "59355/20", "6595/2"],
    "-161": ["41517/20", "11862/5", "53379/20", "5931/2"],
  }
  for (const coefficient of ["5", "-161"] as const) {
    for (const [index, pal] of ["1.4", "1.6", "1.8", "2.0"].entries()) {
      const result = calculateProfile(
        { ...reference, coefficient, pal },
        adoptedMethod
      )
      expect(result.ok).toBe(true)
      if (!result.ok) continue
      const [n, d] = energies[coefficient][index].split("/").map(BigInt)
      expect(result.target.E).toEqual(rational(n, d))
    }
  }
})
test("gardes de cible prioritaires et globales", () => {
  const target = {
    E: rational(2000n),
    P: rational(0n),
    G: rational(200n),
    L: rational(80n),
  }
  expect(
    validateCalculatorTarget({ ...target, E: rational(0n) }, rational(200n))
  ).toMatchObject({ code: "CIBLE_INCOHERENTE" })
  expect(
    validateCalculatorTarget(
      { ...target, G: { numerator: -1n, denominator: 1n } },
      rational(200n)
    )
  ).toMatchObject({ code: "CIBLE_INCOHERENTE" })
  expect(validateCalculatorTarget(target, rational(200n))).toEqual({
    code: "REPARTITION_HORS_DOMAINE",
    message: "La répartition proposée est hors des intervalles pris en charge.",
  })
  expect(
    calculateProfile(
      { ...reference, taille_cm: "160", poids_kg: "80" },
      adoptedMethod
    )
  ).toEqual({
    ok: false,
    errors: [
      {
        code: "IMC_HORS_DOMAINE",
        message:
          "Le profil est hors du domaine proposé (18,5 ≤ IMC < 30) : aucune estimation automatique.",
      },
    ],
  })
})

function calculated(id = "A"): CalculatorSession {
  const profile =
    vectors.profils.find((item) => item.id === id)?.profil ?? reference
  return calculateCalculatorSession(
    { ...createCalculatorSession(), profile },
    adoptedMethod
  )
}
function preview(session: CalculatorSession, field: string, value: string) {
  return previewCalculatorEdit(
    changeCalculatorEdit(session, field, value),
    adoptedMethod
  )
}
function oracle(
  target: CalculatorTarget,
  expected: { exact: Record<string, string>; affichage: Record<string, string> }
) {
  for (const key of ["E", "P", "G", "L"] as const) {
    expect(`${target[key].numerator}/${target[key].denominator}`).toBe(
      expected.exact[key]
    )
    expect(displayCalculatorValue(target[key])).toBe(expected.affichage[key])
  }
  const sum =
    target.P.numerator * 4n * target.G.denominator * target.L.denominator +
    target.G.numerator * 4n * target.P.denominator * target.L.denominator +
    target.L.numerator * 9n * target.P.denominator * target.G.denominator
  expect(sum * target.E.denominator).toBe(
    target.E.numerator *
      target.P.denominator *
      target.G.denominator *
      target.L.denominator
  )
}
test.each(vectors.modifications)("modification exacte $id", (vector) => {
  let start = calculated(vector.depart === "B" ? "B" : "A")
  if (vector.depart === "E-haut confirmé")
    start = confirmCalculatorEdit(preview(start, "E", "2901.8"), adoptedMethod)
  const before = structuredClone(start)
  const next = preview(start, vector.champ, vector.saisie)
  expect(start).toEqual(before)
  expect(next.outcome).toEqual(start.outcome)
  expect(next.original).toEqual(start.original)
  expect(next.preview).not.toBeNull()
  if (next.preview) oracle(next.preview.target, vector.candidat)
})
for (const vector of vectors.matrice) {
  if (vector.etape !== "edition" && vector.etape !== "reset") continue
  test(`édition/reset documentaire ${vector.id}`, () => {
    let start = vector.id.includes("sans-cible")
      ? createCalculatorSession()
      : calculated(vector.depart === "B" ? "B" : "A")
    if (vector.depart === "E-haut confirmé")
      start = confirmCalculatorEdit(
        preview(start, "E", "2901.8"),
        adoptedMethod
      )
    const method = vector.id.includes("methode-indisponible")
      ? null
      : adoptedMethod
    const before = structuredClone(start)
    const next =
      vector.etape === "reset"
        ? resetCalculatorTarget(start, method)
        : vector.champs
          ? previewCalculatorEdit(
              start,
              method,
              Object.fromEntries(vector.champs.map((field) => [field, "110"]))
            )
          : previewCalculatorEdit(
              changeCalculatorEdit(
                start,
                vector.champ ?? "P",
                vector.saisie ?? "110"
              ),
              method
            )
    expect(start).toEqual(before)
    expect(next.outcome).toEqual(start.outcome)
    expect(next.original).toEqual(start.original)
    if (vector.attendu === "PREVISUALISATION")
      expect(next.preview).not.toBeNull()
    else {
      expect(next.preview).toBeNull()
      expect(next.editErrors[0]?.code).toBe(vector.attendu)
    }
  })
}
test.each(vectors.transitions)("transition documentaire $id", (vector) => {
  const initial = calculated()
  const candidate = preview(initial, "P", "110")
  const modified = confirmCalculatorEdit(candidate, adoptedMethod)
  let next = modified
  if (vector.id === "annulation") next = cancelCalculatorEdit(candidate)
  if (vector.id === "reset")
    next = resetCalculatorTarget(modified, adoptedMethod)
  if (vector.id === "profil-change" || vector.id === "recalcul-profil")
    next = changeCalculatorProfile(modified, "poids_kg", "71")
  if (vector.id === "recalcul-profil")
    next = calculateCalculatorSession(next, adoptedMethod)
  expect(next.preview).toBeNull()
  if (vector.cible) {
    expect(next.outcome?.ok).toBe(true)
    if (next.outcome?.ok) oracle(next.outcome.target, vector.cible)
  } else {
    expect(next.outcome).toBeNull()
    expect(next.original).toBeNull()
  }
  expect(next.currentState).toBe(
    vector.attendu === "CIBLE_MODIFIEE" ? "modified" : "estimated"
  )
})
test("identité exige confirmation ; annuler depuis une cible modifiée la conserve", () => {
  const start = calculated()
  const next = preview(start, "E", "2638")
  expect(next.currentState).toBe("estimated")
  expect(next.outcome).toEqual(start.outcome)
  const confirmed = confirmCalculatorEdit(next, adoptedMethod)
  expect(confirmed.currentState).toBe("modified")
  expect(confirmed.outcome).toEqual(start.outcome)
  expect(cancelCalculatorEdit(preview(confirmed, "P", "110")).outcome).toEqual(
    confirmed.outcome
  )
  expect(
    cancelCalculatorEdit(preview(confirmed, "P", "110")).currentState
  ).toBe("modified")
})
test("les six changements invalident original, courant, brouillon et candidat", () => {
  for (const field of Object.keys(reference) as (keyof CalculatorProfile)[]) {
    for (const start of [
      preview(calculated(), "P", "110"),
      confirmCalculatorEdit(preview(calculated(), "P", "110"), adoptedMethod),
    ]) {
      const next = changeCalculatorProfile(start, field, `${reference[field]} `)
      expect(next).toMatchObject({
        outcome: null,
        original: null,
        preview: null,
        edit: { field: "", value: "" },
        editErrors: [],
        changed: true,
      })
    }
  }
})
test.each(["", "-1", "+110", "1e2", "110.0000000", "1000000.000001"])(
  "AD-12 édition %s",
  (raw) => {
    for (const field of ["E", "P", "G", "L"]) {
      const next = preview(calculated(), field, raw)
      expect(next.edit.value).toBe(raw)
      expect(next.editErrors[0]?.code).toBe("ENTREE_INVALIDE")
      expect(next.preview).toBeNull()
    }
  }
)
test("décimales françaises restent en brouillon ; la confirmation utilise la valeur exacte", () => {
  const next = preview(calculated(), "P", " 0110,000000 ")
  expect(next.edit.value).toBe(" 0110,000000 ")
  expect(next.preview?.target.P).toEqual(rational(110n))
  expect(confirmCalculatorEdit(next, adoptedMethod).outcome).toMatchObject({
    ok: true,
    target: { P: rational(110n) },
  })
})
test("toute transition produisant une cible exige méthode disponible et profil inchangé", () => {
  const next = preview(calculated(), "P", "110")
  for (const method of [
    null,
    { ...adoptedMethod, status: "retiree" as const },
    { ...adoptedMethod, version: "v2" },
  ]) {
    for (const transition of [
      previewCalculatorEdit,
      confirmCalculatorEdit,
      resetCalculatorTarget,
    ])
      expect(transition(next, method).editErrors[0]?.code).toBe(
        "METHODE_INDISPONIBLE"
      )
  }
  for (const transition of [
    previewCalculatorEdit,
    confirmCalculatorEdit,
    resetCalculatorTarget,
  ]) {
    expect(
      transition(
        { ...next, profile: { ...next.profile, poids_kg: "71" } },
        adoptedMethod
      ).editErrors[0]?.code
    ).toBe("CIBLE_ABSENTE")
    expect(
      transition(createCalculatorSession(), adoptedMethod).editErrors[0]?.code
    ).toBe("CIBLE_ABSENTE")
  }
  expect(
    confirmCalculatorEdit(calculated(), adoptedMethod).editErrors[0]?.code
  ).toBe("CIBLE_ABSENTE")
})

test("éditer E conserve les fractions modifiées, sans réinjecter leurs affichages", () => {
  const modified = confirmCalculatorEdit(
    preview(calculated(), "P", "110"),
    adoptedMethod
  )
  const next = preview(modified, "E", "2901.8")
  expect(next.preview?.target.P).toEqual(rational(121n))
  expect(next.preview?.target.G).toEqual(rational(31427n, 100n))
  expect(next.preview?.target.L).toEqual(rational(29018n, 225n))
  expect(next.outcome).toEqual(modified.outcome)
  expect(next.original).toEqual(calculated().original)
})

test("confirmation et reset refusent un profil devenu invalide même hors transition normale", () => {
  const candidate = preview(calculated(), "P", "110")
  for (const transition of [confirmCalculatorEdit, resetCalculatorTarget]) {
    expect(
      transition(
        { ...candidate, profile: { ...candidate.profile, age: "" } },
        adoptedMethod
      ).editErrors[0]?.code
    ).toBe("ENTREE_INVALIDE")
    expect(
      transition(
        { ...candidate, profile: { ...candidate.profile, eligibilite: "non" } },
        adoptedMethod
      ).editErrors[0]?.code
    ).toBe("SITUATION_EXCLUE")
  }
})

test("confirmation refuse une proposition obsolète plutôt que confirmer une autre saisie", () => {
  const candidate = preview(calculated(), "P", "110")
  const next = confirmCalculatorEdit(
    { ...candidate, edit: { field: "P", value: "111" } },
    adoptedMethod
  )
  expect(next.editErrors[0]?.code).toBe("CIBLE_ABSENTE")
  expect(next.preview).toBeNull()
  expect(next.outcome).toEqual(candidate.outcome)
})
