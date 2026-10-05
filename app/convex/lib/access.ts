import { ConvexError } from "convex/values"
import { requireActiveEntitlement } from "../../src/domain/access"
import { failure, type ErrorCode } from "../../src/domain/contracts"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { authComponent } from "../auth"

type ReadCtx = QueryCtx | MutationCtx

export function deny(code: ErrorCode, ...fields: string[]): never {
  const result = failure(code, ...fields)
  if (!result.ok) throw new ConvexError(result.error)
  throw new Error("Unreachable")
}

export async function requireOwner(ctx: ReadCtx): Promise<string> {
  try {
    return (await authComponent.getAuthUser(ctx))._id
  } catch (error) {
    // Seul le refus explicite du composant est traduit ; les pannes remontent.
    if (error instanceof ConvexError && error.data === "Unauthenticated") {
      deny("UNAUTHENTICATED")
    }
    throw error
  }
}

export function requireOwned<T extends { ownerId: string }>(
  ownerId: string,
  document: T | null
): T {
  if (!document) deny("NOT_FOUND", "reference")
  if (document.ownerId !== ownerId) deny("ACCESS_DENIED", "reference")
  return document
}

export async function readClosure(ctx: ReadCtx, ownerId: string) {
  return ctx.db
    .query("accountClosures")
    .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
    .unique()
}

export async function readEntitlement(ctx: ReadCtx, ownerId: string) {
  return ctx.db
    .query("entitlements")
    .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
    .unique()
}

export async function requireOpenAccount(ctx: ReadCtx, ownerId: string) {
  if (await readClosure(ctx, ownerId)) deny("ACCOUNT_CLOSED")
}

// À appeler dans chaque transaction interne créatrice/modificatrice, avec le
// propriétaire relu sur son travail durable, même si le compte auth a disparu.
export async function requireInternalWrite(ctx: MutationCtx, ownerId: string) {
  await requireOpenAccount(ctx, ownerId)
}

export async function requirePersonalWrite(ctx: MutationCtx): Promise<string> {
  const ownerId = await requireOwner(ctx)
  await requireOpenAccount(ctx, ownerId)
  const result = requireActiveEntitlement(
    await readEntitlement(ctx, ownerId),
    Date.now()
  )
  if (!result.ok) throw new ConvexError(result.error)
  return ownerId
}
