import { failure, type Result } from "./contracts"

export const DECIMAL_SCALE = 1_000_000n
export const DECIMAL_MAX = 1_000_000n * DECIMAL_SCALE
/** Canonical transport: no exponent, leading zero or trailing fractional zero. */
export function parseDecimal(
  value: string,
  field = "value",
  positive = false
): Result<bigint> {
  if (!/^(0|[1-9]\d*)(\.[0-9]{0,5}[1-9])?$/.test(value) || value.length > 14) {
    return failure("INVALID_DECIMAL", field)
  }
  const [whole, fraction = ""] = value.split(".")
  const scaled = BigInt(whole) * DECIMAL_SCALE + BigInt(fraction.padEnd(6, "0"))
  if (scaled > DECIMAL_MAX) return failure("INVALID_DECIMAL", field)
  if (positive && scaled === 0n) return failure("POSITIVE_REQUIRED", field)
  return { ok: true, value: scaled }
}
/** Explicit UI normalization only; source snapshots never pass through it. */
export function normalizeFrenchDecimal(
  input: string,
  field = "value",
  positive = false
): Result<string> {
  const trimmed = input.trim()
  if (!/^\d+(?:[,.]\d+)?$/.test(trimmed))
    return failure("INVALID_DECIMAL", field)
  const [whole, fraction = ""] = trimmed.replace(",", ".").split(".")
  // Precision is checked before removing zeroes: no silently rounded input.
  if (fraction.length > 6) return failure("INVALID_DECIMAL", field)
  const integer = whole.replace(/^0+(?=\d)/, "")
  const tail = fraction.replace(/0+$/, "")
  const value = tail ? `${integer}.${tail}` : integer
  const parsed = parseDecimal(value, field, positive)
  return parsed.ok ? { ok: true, value } : parsed
}
export type Rational = { numerator: bigint; denominator: bigint }
export function rational(numerator: bigint, denominator = 1n): Rational {
  if (denominator <= 0n || numerator < 0n)
    throw new RangeError("Rationnel positif attendu")
  let a = numerator
  let b = denominator
  while (b !== 0n) [a, b] = [b, a % b]
  return { numerator: numerator / a, denominator: denominator / a }
}
export function multiply(a: Rational, b: Rational): Rational {
  return rational(a.numerator * b.numerator, a.denominator * b.denominator)
}
export function divide(a: Rational, b: Rational): Rational {
  return rational(a.numerator * b.denominator, a.denominator * b.numerator)
}
export function decimalRational(scaled: bigint): Rational {
  return rational(scaled, DECIMAL_SCALE)
}
export function displayHundredth(value: Rational): string {
  const cents =
    (value.numerator * 200n + value.denominator) / (2n * value.denominator)
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`
}
