import {
  NUTRIENTS,
  type FoodSnapshot,
  type PortionTotals,
} from "../src/domain/contracts"
import { displayHundredth, parseDecimal, rational } from "../src/domain/decimal"
import { calculatePortion } from "../src/domain/food"
export type ReferenceLine = {
  caseId: string
  code: string
  quantity: string
  initial: string
  min: string
  max: string
  step: string
  unit: string
  locked: boolean
  sha256: string
}
export type ReferenceMeal = {
  id: string
  lines: ReferenceLine[]
  totals: PortionTotals
  constraintsSource: string
  purpose: string
}
export function mealTotals(
  lines: ReferenceLine[],
  lookup: (line: ReferenceLine) => FoodSnapshot
): PortionTotals {
  if (lines.length < 3 || lines.length > 6) throw Error("MEAL_SIZE")
  if (new Set(lines.map((l) => l.code)).size !== lines.length)
    throw Error("DUPLICATE_FOOD")
  const totals = Object.fromEntries(NUTRIENTS.map((n) => [n, rational(0n)]))
  for (const line of lines) {
    const parsed = [
      line.quantity,
      line.initial,
      line.min,
      line.max,
      line.step,
    ].map((v, i) => parseDecimal(v, "constraint", i === 4))
    if (parsed.some((p) => !p.ok)) throw Error("INVALID_CONSTRAINT")
    const [q, initial, min, max, step] = parsed.map((p) =>
      p.ok ? p.value : 0n
    )
    if (
      min > max ||
      q < min ||
      q > max ||
      initial < min ||
      initial > max ||
      [q, initial, min, max].some((v) => v % step !== 0n) ||
      (line.locked && q !== initial)
    )
      throw Error("INVALID_CONSTRAINT")
    const snapshot = lookup(line)
    if (snapshot.sourceId !== line.code || snapshot.revision !== line.sha256)
      throw Error("MEAL_SOURCE")
    const result = calculatePortion(snapshot, {
      quantity: line.quantity,
      unit: line.unit,
      step: line.step,
    })
    if (!result.ok) throw Error(result.error.code)
    for (const nutrient of NUTRIENTS) {
      const value = result.value[nutrient],
        sum = totals[nutrient]
      totals[nutrient] = rational(
        sum.numerator * BigInt(value.denominator) +
          BigInt(value.numerator) * sum.denominator,
        sum.denominator * BigInt(value.denominator)
      )
    }
  }
  return Object.fromEntries(
    NUTRIENTS.map((n) => [
      n,
      {
        numerator: totals[n].numerator.toString(),
        denominator: totals[n].denominator.toString(),
        display: displayHundredth(totals[n]),
      },
    ])
  ) as PortionTotals
}
