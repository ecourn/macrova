import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start"
import { runtimeErrorResponse } from "../server/error-handler"

const safeErrors = createMiddleware().server(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    return runtimeErrorResponse(error)
  }
})

// Déclarer startInstance remplace le middleware CSRF implicite du framework.
// Reprendre exactement son périmètre par défaut : RPC serverFn uniquement.
const csrf = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
})

export const startInstance = createStart(() => ({
  requestMiddleware: [safeErrors, csrf],
}))
