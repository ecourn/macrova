import { failure, type Result } from "./contracts"

export const ENTITLEMENT_VERSION = 1
export type Entitlement = {
  version: number
  enabled: boolean
  validUntil: number
}
export type AccountClosure = { closedAt: number }
export type AccountAccess = {
  entitlement: Entitlement | null
  closure: AccountClosure | null
}

// UTC millisecondes représentables par Date, entières, sûres et non négatives.
export function isUtcTimestamp(value: number): boolean {
  return (
    Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000
  )
}

export function requireActiveEntitlement(
  entitlement: Entitlement | null,
  now: number
): Result<Entitlement> {
  if (
    !entitlement ||
    entitlement.version !== ENTITLEMENT_VERSION ||
    entitlement.enabled !== true ||
    !isUtcTimestamp(entitlement.validUntil) ||
    !isUtcTimestamp(now) ||
    entitlement.validUntil <= now
  ) {
    return failure("ENTITLEMENT_REQUIRED", "entitlement")
  }
  return { ok: true, value: entitlement }
}
