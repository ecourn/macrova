import {
  decimalRational,
  displayHundredth,
  divide,
  multiply,
  normalizeFrenchDecimal,
  parseDecimal,
  rational,
  type Rational,
} from "./decimal"

export const METHOD_VERSION = "methode-estimative-v1"
export type CalculatorMethod = {
  version: string
  status: "adoptee" | "non-adoptee" | "retiree"
}
/** Adoption produit du 08/10/2026, validation.md et decision-responsable.md. */
export const adoptedMethod: CalculatorMethod = {
  version: METHOD_VERSION,
  status: "adoptee",
}
export type CalculatorProfile = {
  age: string
  taille_cm: string
  poids_kg: string
  coefficient: string
  pal: string
  eligibilite: string
}
export type CalculatorField = keyof CalculatorProfile
export type CalculatorError = {
  code: string
  message: string
  field?: CalculatorField | CalculatorTargetField
}
export type CalculatorTargetField = "E" | "P" | "G" | "L"
export type CalculatorTarget = Record<CalculatorTargetField, Rational>
export type CalculatorOutcome =
  | {
      ok: true
      version: string
      profile: CalculatorProfile
      target: CalculatorTarget
    }
  | { ok: false; errors: CalculatorError[] }
const messages = {
  CIBLE_ABSENTE:
    "Calculez explicitement une cible pour le profil actuel avant de la modifier.",
  MODIFICATION_NON_UNIQUE:
    "Modifiez un seul champ parmi calories, protéines, glucides et lipides.",
  ENERGIE_HORS_PLAGE:
    "Les calories doivent rester entre 90 % et 110 % de l'estimation originale.",
  METHODE_INDISPONIBLE:
    "La méthode estimative n'est pas disponible : aucune estimation ne peut être calculée.",
  AGE_HORS_DOMAINE: "L'âge doit être un entier entre 19 et 64 ans.",
  TAILLE_HORS_DOMAINE: "La taille doit être comprise entre 120 et 220 cm.",
  POIDS_HORS_DOMAINE: "Le poids doit être compris entre 30 et 200 kg.",
  COEFFICIENT_NON_APPLICABLE:
    "Aucun coefficient applicable de l'étude n'a été confirmé : aucune estimation.",
  PAL_INVALIDE: "Choisissez un niveau d'activité parmi les quatre proposés.",
  ELIGIBILITE_ABSENTE: "Confirmez votre éligibilité par oui, non ou incertain.",
  SITUATION_EXCLUE:
    "Votre situation est hors du périmètre de cette méthode ou son applicabilité est incertaine : aucune estimation automatique.",
  IMC_HORS_DOMAINE:
    "Le profil est hors du domaine proposé (18,5 ≤ IMC < 30) : aucune estimation automatique.",
  CIBLE_INCOHERENTE:
    "La cible calculée n'est pas prise en charge : aucune estimation.",
  REPARTITION_HORS_DOMAINE:
    "La répartition proposée est hors des intervalles pris en charge.",
  PROTEINES_INSUFFISANTES:
    "La cible de protéines est inférieure à 0,83 g/kg/jour : aucune cible n'est validée.",
}
function error(
  code: keyof typeof messages,
  field?: CalculatorField | CalculatorTargetField
): CalculatorError {
  return { code, message: messages[code], ...(field ? { field } : {}) }
}
function refused(...errors: CalculatorError[]): CalculatorOutcome {
  return { ok: false, errors }
}
/** Intermédiaires signés explicites, distincts du contrat AD-12 non négatif. */
function signedRational(numerator: bigint, denominator = 1n): Rational {
  if (denominator <= 0n) throw new RangeError("Dénominateur positif attendu")
  const magnitude = rational(
    numerator < 0n ? -numerator : numerator,
    denominator
  )
  return {
    numerator: numerator < 0n ? -magnitude.numerator : magnitude.numerator,
    denominator: magnitude.denominator,
  }
}
function addSigned(a: Rational, b: Rational): Rational {
  return signedRational(
    a.numerator * b.denominator + b.numerator * a.denominator,
    a.denominator * b.denominator
  )
}
function compare(a: Rational, b: Rational): bigint {
  return a.numerator * b.denominator - b.numerator * a.denominator
}
function within(value: Rational, min: Rational, max: Rational): boolean {
  return compare(value, min) >= 0n && compare(value, max) <= 0n
}
export function displayCalculatorValue(value: Rational): string {
  return displayHundredth(value).replace(".", ",")
}
export function isCalculatorMethodAvailable(
  method: CalculatorMethod | null | undefined,
  requestedVersion = METHOD_VERSION
): boolean {
  return (
    !!method &&
    method.status === "adoptee" &&
    method.version === requestedVersion &&
    requestedVersion === METHOD_VERSION
  )
}
export function calculateProfile(
  input: CalculatorProfile,
  method: CalculatorMethod | null | undefined,
  requestedVersion = METHOD_VERSION
): CalculatorOutcome {
  if (!isCalculatorMethodAvailable(method, requestedVersion))
    return refused(error("METHODE_INDISPONIBLE"))
  const profile = { ...input }
  const values = {} as Record<"age" | "taille_cm" | "poids_kg", Rational>
  const errors: CalculatorError[] = []
  const labels = { age: "Âge", taille_cm: "Taille", poids_kg: "Poids" }
  for (const field of ["age", "taille_cm", "poids_kg"] as const) {
    const normalized = normalizeFrenchDecimal(input[field], field)
    if (!normalized.ok) {
      errors.push({
        code: "ENTREE_INVALIDE",
        field,
        message: `${labels[field]} : saisissez une valeur décimale valide, avec au plus six décimales.`,
      })
      continue
    }
    profile[field] = normalized.value
    const parsed = parseDecimal(normalized.value)
    if (parsed.ok) values[field] = decimalRational(parsed.value)
  }
  if (errors.length) return refused(...errors)
  if (
    values.age.denominator !== 1n ||
    !within(values.age, rational(19n), rational(64n))
  )
    errors.push(error("AGE_HORS_DOMAINE", "age"))
  if (!within(values.taille_cm, rational(120n), rational(220n)))
    errors.push(error("TAILLE_HORS_DOMAINE", "taille_cm"))
  if (!within(values.poids_kg, rational(30n), rational(200n)))
    errors.push(error("POIDS_HORS_DOMAINE", "poids_kg"))
  if (errors.length) return refused(...errors)
  if (!["5", "-161"].includes(profile.coefficient))
    return refused(error("COEFFICIENT_NON_APPLICABLE", "coefficient"))
  if (!["1.4", "1.6", "1.8", "2.0"].includes(profile.pal))
    return refused(error("PAL_INVALIDE", "pal"))
  if (!["oui", "non", "incertain"].includes(profile.eligibilite))
    return refused(error("ELIGIBILITE_ABSENTE", "eligibilite"))
  if (profile.eligibilite !== "oui")
    return refused(error("SITUATION_EXCLUE", "eligibilite"))
  const heightMetres = multiply(values.taille_cm, rational(1n, 100n))
  const imc = divide(values.poids_kg, multiply(heightMetres, heightMetres))
  if (compare(imc, rational(37n, 2n)) < 0n || compare(imc, rational(30n)) >= 0n)
    return refused(error("IMC_HORS_DOMAINE"))
  const rest = addSigned(
    addSigned(
      multiply(values.poids_kg, rational(10n)),
      multiply(values.taille_cm, rational(25n, 4n))
    ),
    addSigned(
      signedRational(-5n * values.age.numerator, values.age.denominator),
      signedRational(BigInt(profile.coefficient))
    )
  )
  const pal = {
    "1.4": rational(7n, 5n),
    "1.6": rational(8n, 5n),
    "1.8": rational(9n, 5n),
    "2.0": rational(2n),
  }[profile.pal]
  if (rest.numerator <= 0n || !pal) return refused(error("CIBLE_INCOHERENTE"))
  const E = multiply(rest, pal)
  const target = {
    E,
    P: multiply(E, rational(3n, 80n)),
    G: multiply(E, rational(9n, 80n)),
    L: multiply(E, rational(2n, 45n)),
  }
  const targetError = validateCalculatorTarget(target, values.poids_kg)
  if (targetError) return refused(targetError)
  return { ok: true, version: METHOD_VERSION, profile, target }
}

export type CalculatorSession = {
  profile: CalculatorProfile
  outcome: CalculatorOutcome | null
  changed: boolean
  original: CalculatorTarget | null
  currentState: "estimated" | "modified"
  edit: { field: string; value: string }
  preview: {
    previous: CalculatorTarget
    target: CalculatorTarget
    field: CalculatorTargetField
  } | null
  editErrors: CalculatorError[]
}
export function createCalculatorSession(): CalculatorSession {
  return {
    profile: {
      age: "",
      taille_cm: "",
      poids_kg: "",
      coefficient: "",
      pal: "",
      eligibilite: "",
    },
    outcome: null,
    changed: false,
    original: null,
    currentState: "estimated",
    edit: { field: "", value: "" },
    preview: null,
    editErrors: [],
  }
}
export function changeCalculatorProfile(
  session: CalculatorSession,
  field: CalculatorField,
  value: string
): CalculatorSession {
  return {
    ...createCalculatorSession(),
    profile: { ...session.profile, [field]: value },
    outcome: null,
    changed: true,
  }
}

export function validateCalculatorTarget(
  target: CalculatorTarget,
  weight: Rational
): CalculatorError | null {
  const { E } = target
  if (
    Object.values(target).some((value) => value.numerator < 0n) ||
    E.numerator <= 0n
  )
    return error("CIBLE_INCOHERENTE")
  const ratios = [
    divide(multiply(target.P, rational(4n)), E),
    divide(multiply(target.G, rational(4n)), E),
    divide(multiply(target.L, rational(9n)), E),
  ]
  if (
    !within(ratios[0], rational(1n, 10n), rational(1n, 5n)) ||
    !within(ratios[1], rational(2n, 5n), rational(11n, 20n)) ||
    !within(ratios[2], rational(7n, 20n), rational(2n, 5n))
  )
    return error("REPARTITION_HORS_DOMAINE")
  if (compare(target.P, multiply(weight, rational(83n, 100n))) < 0n)
    return error("PROTEINES_INSUFFISANTES")
  return null
}

/** Calcul explicite : chaque nouveau profil repart du défaut, jamais d'une édition. */
export function calculateCalculatorSession(
  session: CalculatorSession,
  method: CalculatorMethod | null | undefined
): CalculatorSession {
  const outcome = calculateProfile(session.profile, method)
  return {
    ...createCalculatorSession(),
    profile: session.profile,
    outcome,
    original: outcome.ok ? outcome.target : null,
  }
}
export function changeCalculatorEdit(
  session: CalculatorSession,
  field: string,
  value: string
): CalculatorSession {
  return { ...session, edit: { field, value }, preview: null, editErrors: [] }
}
function editRefused(
  session: CalculatorSession,
  ...errors: CalculatorError[]
): CalculatorSession {
  return { ...session, preview: null, editErrors: errors }
}
function transitionError(
  session: CalculatorSession,
  method: CalculatorMethod | null | undefined
): CalculatorError | null {
  if (!isCalculatorMethodAvailable(method)) return error("METHODE_INDISPONIBLE")
  if (!session.outcome?.ok || !session.original) return error("CIBLE_ABSENTE")
  // Comparer le profil confirmé aux saisies normalisées évite toute cible obsolète,
  // même si un consommateur contourne changeCalculatorProfile.
  const profile = calculateProfile(session.profile, method)
  if (!profile.ok) return profile.errors[0]
  if (
    Object.keys(profile.profile).some(
      (key) =>
        profile.profile[key as CalculatorField] !==
        (session.outcome?.ok
          ? session.outcome.profile[key as CalculatorField]
          : undefined)
    )
  )
    return error("CIBLE_ABSENTE")
  return null
}
export function previewCalculatorEdit(
  session: CalculatorSession,
  method: CalculatorMethod | null | undefined,
  changes: Record<string, string> = { [session.edit.field]: session.edit.value }
): CalculatorSession {
  const unavailable = transitionError(session, method)
  if (unavailable) return editRefused(session, unavailable)
  const fields = Object.keys(changes)
  if (fields.length !== 1 || !["E", "P", "G", "L"].includes(fields[0]))
    return editRefused(session, error("MODIFICATION_NON_UNIQUE"))
  const field = fields[0] as CalculatorTargetField
  const normalized = normalizeFrenchDecimal(changes[field], field)
  if (!normalized.ok)
    return editRefused(session, {
      code: "ENTREE_INVALIDE",
      field,
      message: `${{ E: "Calories", P: "Protéines", G: "Glucides", L: "Lipides" }[field]} : saisissez une valeur décimale valide, avec au plus six décimales.`,
    })
  const parsed = parseDecimal(normalized.value)
  if (!parsed.ok || !session.outcome?.ok || !session.original)
    return editRefused(session, error("CIBLE_ABSENTE"))
  const current = session.outcome.target
  const value = decimalRational(parsed.value)
  const target = { ...current, [field]: value }
  if (field === "E") {
    for (const macro of ["P", "G", "L"] as const)
      target[macro] = divide(multiply(current[macro], value), current.E)
  } else {
    const remaining = addSigned(
      addSigned(
        current.E,
        signedRational(-4n * target.P.numerator, target.P.denominator)
      ),
      signedRational(
        -(field === "G" ? 4n : 9n) *
          target[field === "G" ? "G" : "L"].numerator,
        target[field === "G" ? "G" : "L"].denominator
      )
    )
    target[field === "G" ? "L" : "G"] = signedRational(
      remaining.numerator,
      remaining.denominator * (field === "G" ? 9n : 4n)
    )
  }
  if (
    !within(
      target.E,
      multiply(session.original.E, rational(9n, 10n)),
      multiply(session.original.E, rational(11n, 10n))
    )
  )
    return editRefused(session, error("ENERGIE_HORS_PLAGE", "E"))
  const weight = parseDecimal(session.outcome.profile.poids_kg)
  if (!weight.ok) return editRefused(session, error("CIBLE_ABSENTE"))
  const invalid = validateCalculatorTarget(
    target,
    decimalRational(weight.value)
  )
  if (invalid) return editRefused(session, { ...invalid, field })
  return {
    ...session,
    edit: { field, value: changes[field] },
    editErrors: [],
    preview: { previous: current, target, field },
  }
}
export function confirmCalculatorEdit(
  session: CalculatorSession,
  method: CalculatorMethod | null | undefined
): CalculatorSession {
  const unavailable = transitionError(session, method)
  if (unavailable) return editRefused(session, unavailable)
  const proposed = session.preview
  const current = session.outcome
  if (!proposed || !current?.ok)
    return editRefused(session, error("CIBLE_ABSENTE"))
  // Revalider la proposition, y compris le poids et la plage originale.
  const checked = previewCalculatorEdit(session, method)
  const candidate = checked.preview
  if (!candidate) return checked
  if (
    (["E", "P", "G", "L"] as const).some(
      (field) =>
        compare(candidate.target[field], proposed.target[field]) !== 0n ||
        compare(current.target[field], proposed.previous[field]) !== 0n
    )
  )
    return editRefused(session, error("CIBLE_ABSENTE"))
  return {
    ...session,
    outcome: { ...current, target: proposed.target },
    currentState: "modified",
    preview: null,
    edit: { field: "", value: "" },
    editErrors: [],
  }
}
export function cancelCalculatorEdit(
  session: CalculatorSession
): CalculatorSession {
  return {
    ...session,
    preview: null,
    editErrors: [],
    edit: { field: "", value: "" },
  }
}
export function resetCalculatorTarget(
  session: CalculatorSession,
  method: CalculatorMethod | null | undefined
): CalculatorSession {
  const unavailable = transitionError(session, method)
  if (unavailable) return editRefused(session, unavailable)
  if (!session.outcome?.ok || !session.original)
    return editRefused(session, error("CIBLE_ABSENTE"))
  return {
    ...cancelCalculatorEdit(session),
    outcome: { ...session.outcome, target: session.original },
    currentState: "estimated",
  }
}
