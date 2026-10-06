import { definePlugin } from "nitro"

export default definePlugin((app) => {
  if (app.h3) {
    // H3 journalise les erreurs unhandled AVANT onError. Son option officielle
    // silent coupe ce doublon brut ; notre errorHandler conserve le log safe
    // et la réponse d'erreur, sans toucher à console ni absorber la panne.
    app.h3.config.silent = true
  }
})
