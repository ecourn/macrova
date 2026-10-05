import {
  failure,
  NUTRIENTS,
  type FoodSnapshot,
  type Portion,
  type PortionTotals,
  type Result,
} from "./contracts"
import {
  decimalRational,
  displayHundredth,
  divide,
  multiply,
  parseDecimal,
  rational,
} from "./decimal"

const text = (value: string) => value.trim().length > 0
const date = (value: number) => Number.isSafeInteger(value) && value >= 0
export function validateFoodSnapshot(
  snapshot: FoodSnapshot
): Result<FoodSnapshot> {
  if (snapshot.version !== 1) return failure("UNSUPPORTED_VERSION", "version")
  for (const field of ["revision", "sourceId", "name"] as const) {
    if (!text(snapshot[field])) return failure("INVALID_METADATA", field)
  }
  if (snapshot.brand !== undefined && !text(snapshot.brand))
    return failure("INVALID_METADATA", "brand")
  for (const field of ["name", "reference"] as const) {
    if (!text(snapshot.provenance[field]))
      return failure("INVALID_METADATA", `provenance.${field}`)
  }
  if (!date(snapshot.capturedAt))
    return failure("INVALID_METADATA", "capturedAt")
  if (!["raw", "cooked", "unknown"].includes(snapshot.state))
    return failure("INVALID_METADATA", "state")
  if (snapshot.basis.kind === "known") {
    if (!["g", "ml"].includes(snapshot.basis.unit))
      return failure("INVALID_METADATA", "basis.unit")
  } else if (!text(snapshot.basis.sourceField))
    return failure("INVALID_METADATA", "basis.sourceField")
  for (const field of NUTRIENTS) {
    const value = snapshot.nutrition[field]
    if (value !== null) {
      const result = parseDecimal(value, `nutrition.${field}`)
      if (!result.ok) return result
    }
  }
  if (snapshot.density) {
    const result = parseDecimal(
      snapshot.density.gramsPerMl,
      "density.gramsPerMl",
      true
    )
    if (!result.ok) return result
    if (!text(snapshot.density.reference))
      return failure("INVALID_METADATA", "density.reference")
    if (!date(snapshot.density.capturedAt))
      return failure("INVALID_METADATA", "density.capturedAt")
  }
  return { ok: true, value: snapshot }
}
export function checkCalculability(
  snapshot: FoodSnapshot
): Result<FoodSnapshot> {
  const valid = validateFoodSnapshot(snapshot)
  if (!valid.ok) return valid
  if (snapshot.basis.kind === "ambiguous")
    return failure("AMBIGUOUS_BASIS", "basis")
  const missing = NUTRIENTS.filter(
    (field) => snapshot.nutrition[field] === null
  )
  if (missing.length)
    return failure(
      "MISSING_NUTRITION",
      ...missing.map((field) => `nutrition.${field}`)
    )
  return valid
}
export function calculatePortion(
  snapshot: FoodSnapshot,
  portion: Portion
): Result<PortionTotals> {
  const ready = checkCalculability(snapshot)
  if (!ready.ok) return ready
  if (!["g", "ml"].includes(portion.unit))
    return failure("INVALID_METADATA", "portion.unit")
  const quantity = parseDecimal(portion.quantity, "portion.quantity")
  if (!quantity.ok) return quantity
  if (portion.step !== undefined) {
    const step = parseDecimal(portion.step, "portion.step", true)
    if (!step.ok) return step
  }
  let amount = decimalRational(quantity.value)
  if (snapshot.basis.kind === "known" && portion.unit !== snapshot.basis.unit) {
    if (!snapshot.density) return failure("MISSING_DENSITY", "density")
    const density = parseDecimal(
      snapshot.density.gramsPerMl,
      "density.gramsPerMl",
      true
    )
    if (!density.ok) return density
    amount =
      portion.unit === "ml"
        ? multiply(amount, decimalRational(density.value))
        : divide(amount, decimalRational(density.value))
  }
  const totals = {} as PortionTotals
  for (const field of NUTRIENTS) {
    const value = snapshot.nutrition[field]
    if (value === null)
      return failure("MISSING_NUTRITION", `nutrition.${field}`)
    const nutrient = parseDecimal(value, `nutrition.${field}`)
    if (!nutrient.ok) return nutrient
    const exact = divide(
      multiply(decimalRational(nutrient.value), amount),
      rational(100n)
    )
    totals[field] = {
      numerator: exact.numerator.toString(),
      denominator: exact.denominator.toString(),
      display: displayHundredth(exact),
    }
  }
  return { ok: true, value: totals }
}
