import type { CalculatorTargetField } from "@/domain/calculator"

export const calculatorTargetFields = ["E", "P", "G", "L"] as const

export const calculatorTargetLabels = {
  E: "Calories",
  P: "Protéines",
  G: "Glucides",
  L: "Lipides",
} satisfies Record<CalculatorTargetField, string>

export function calculatorTargetUnit(field: CalculatorTargetField): string {
  return field === "E" ? "kcal/jour" : "g/jour"
}
