# Revue technologies — 5 octobre 2026

Verdict final : acceptable ; la précision demandée a été intégrée et aucun blocage technologique ne reste identifié pour finaliser le contrat.

## Constats

1. **Conforme — versions.** Les neuf versions du tableau Stack correspondent exactement aux entrées résolues de `app/bun.lock`. Les plages de `package.json` ne doivent pas remplacer cette photographie. La revue ne suppose aucune mise à niveau.
2. **Conforme — intégration auth.** `app/convex/auth.ts`, `app/src/lib/auth-server.ts` et `app/vite.config.ts` emploient le composant, le pont SSR et le bundling SSR documentés. Better Auth 1.6.15 respecte les peers du composant 0.12.5 (`>=1.6.11 <1.7.0`) ; Convex 1.46.0 et React 19.3.0 respectent également les peers. La [documentation officielle TanStack Start](https://labs.convex.dev/better-auth/framework-guides/tanstack-start) confirme cette combinaison et le minimum Convex 1.25.0. AD-6 est cohérent avec `getAuthUser`; le helper nullable de la lecture publique existante ne doit pas devenir la garde des écritures privées.
3. **Conforme — frontières Convex.** AD-1 et AD-5 placent effets réseau dans les actions et confirmation atomique dans les mutations ; ce découpage correspond aux [actions](https://docs.convex.dev/functions/actions) et [mutations](https://docs.convex.dev/functions/mutation-functions) documentées. Aucun schéma métier déjà livré n'est inventé : `app/convex/schema.ts` est vide et les tables auth sont dans le composant.
4. **Mineur — AD-7/AD-9, reprise des effets externes.** Les travaux sont explicitement durables et idempotents, mais une phrase commune devrait préciser que leur enregistrement et leur programmation initiale sont atomiques dans une mutation, puis qu'une mutation de supervision reprogramme les actions inachevées. Le scheduler seul ne réessaie pas les actions après erreur transitoire ; l'auth n'est pas propagée aux fonctions planifiées. Les travaux doivent donc utiliser leur propriétaire enregistré et des fonctions internes, sans session navigateur. La [documentation de planification Convex](https://docs.convex.dev/scheduling/scheduled-functions) confirme ces limites. Correction proposée : ajouter cette règle à AD-9 et la rendre applicable aux travaux AD-7 ; aucun composant de queue supplémentaire n'est nécessaire à ce niveau.

La vérification porte sur le contrat, les versions du dépôt et les API officielles ; aucune exécution ou déploiement n'a été effectué.

## Vérification des corrections

AD-9 enregistre désormais demande et programmation initiale dans une mutation atomique, passe requestId aux fonctions internes, relit le propriétaire enregistré, avance par lots et prévoit une supervision explicite des travaux bloqués/échoués. Il refuse de supposer un retry automatique des actions. Le constat 4 est résolu.

AD-12 fixe un contrat numérique commun et maintient les BigInt dans le domaine, hors JSON. Il n'engage aucune bibliothèque supplémentaire ; ses limites sont signalées comme hypothèse explicite. Ce choix est compatible avec un domaine TypeScript partagé et des chaînes décimales transportées vers Convex ; aucune nouvelle dépendance technologique à vérifier.
