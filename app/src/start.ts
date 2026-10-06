import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start"
import { runtimeErrorResponse } from "../server/error-handler"
import { validateRpcGet } from "../server/rpc-transport"

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

const rpcTransport = createMiddleware().server(
  ({ handlerType, request, next }) => {
    const invalid =
      handlerType === "serverFn" ? validateRpcGet(request) : undefined
    return invalid ?? next()
  }
)

export const startInstance = createStart(() => ({
  requestMiddleware: [safeErrors, csrf, rpcTransport],
}))
