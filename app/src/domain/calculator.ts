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
  field?: CalculatorField
}
export type CalculatorTarget = Record<"E" | "P" | "G" | "L", Rational>
export type CalculatorOutcome =
  | {
      ok: true
      version: string
      profile: CalculatorProfile
      target: CalculatorTarget
    }
  | { ok: false; errors: CalculatorError[] }
const messages = {
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
  field?: CalculatorField
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
  }
}
export function changeCalculatorProfile(
  session: CalculatorSession,
  field: CalculatorField,
  value: string
): CalculatorSession {
  return {
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
