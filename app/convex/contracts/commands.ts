import { v, type Validator } from "convex/values"
import type {
  CommandIntent,
  CommandReceipt,
  JsonValue,
} from "../../src/domain/commands"

// Le propriétaire injecte son validateur de contenu/résultat fermé.
// Convex ne fournit pas de validateur JSON récursif ; aucun v.any() ici.
export function commandIntentValidator<T extends JsonValue>(
  content: Validator<T, "required", string>
): Validator<CommandIntent<T>, "required", string> {
  return v.object({
    version: v.literal(1),
    operationId: v.string(),
    content,
    contentDigest: v.string(),
    expectedRevision: v.union(v.string(), v.null()),
  })
}
export function commandReceiptValidator<T extends JsonValue>(
  result: Validator<T, "required", string>
): Validator<CommandReceipt<T>, "required", string> {
  return v.object({
    version: v.literal(1),
    ownerId: v.string(),
    operationId: v.string(),
    contentDigest: v.string(),
    acquiredAt: v.number(),
    result,
  })
}
