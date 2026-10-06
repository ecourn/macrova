// Les frameworks journalisent et sérialisent les erreurs reçues : ne leur
// transmettre ni message backend, ni cause, ni données de requête.
export class BackendUnavailableError extends Error {
  readonly code = "UNAVAILABLE"
  readonly incidentId = crypto.randomUUID()

  constructor() {
    super("UNAVAILABLE")
    this.name = "BackendUnavailableError"
  }
}

export async function backendOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof BackendUnavailableError) throw error
    throw new BackendUnavailableError()
  }
}
