---
title: '2.7 — Nettoyage de clôture du calculateur'
type: refactor
ticket: 7
created: '2026-10-09'
status: done
baseline_revision: 'a423b2372d52907ccaf6eee5d0435380aa9e9f57'
route: oneshot
route_source: auto
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-f8277ef9/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-f8277ef9/app/AGENTS.md
---

<frozen-after-approval reason="arbitrages et poursuite délégués explicitement par l'utilisateur">

## Intent

**Problem:** Les builds 2.2 à 2.6 ont construit un parcours vérifié, sans dette de revue encore ouverte. La reconnaissance de clôture constate toutefois deux duplications : les métadonnées E/P/G/L (ordre, libellés, unités) entre résultat et éditeur, et la synchronisation mémoire identique dans les fonctions update et change de la route. Les plans 2.4 et 2.6 identifient ces rendus et le plan 2.5 distingue les transitions locales de l'émission explicite des mesures.

**Approach:** Centraliser les métadonnées de présentation dans app/src/lib/calculator-presentation.ts, consommées par app/src/routes/calculateur.tsx et app/src/components/calculator-target-editor.tsx. Réutiliser update(changeCalculatorProfile(...)) dans change au lieu de recopier Object.assign/setSession. Conserver l'ordre E/P/G/L, les textes français, kcal/jour et g/jour, les descriptions de conséquences, les valeurs rationnelles exactes et tous les états du parcours. Le module de présentation importe seulement le type CalculatorTargetField du domaine ; il n'introduit aucune formule ni primitive UI.

Préserver la méthode v1, le contrat AD-12, l'arrondi au centième uniquement à l'affichage, la session par router et l'invalidation immédiate après modification du profil. Conserver les protections POST/avant hydratation, les composants shadcn existants, les annonces et le focus. L'événement reste exclusivement dans les gestionnaires de calcul/confirmation réussis, jamais dans update. Aucun changement du domaine, du collecteur, de l'authentification, des stockages ou des sources de référence ; aucune fonctionnalité supplémentaire ni livraison distante.

Critères : Given le profil de référence, when calcul puis prévisualisation/confirmation/réinitialisation, then les quatre libellés, unités et valeurs restent identiques et dans le même ordre. Given un résultat ou brouillon actif, when une entrée change puis navigation aller/retour, then l'ancien résultat est invalidé et les saisies restent en mémoire sans mesure implicite. Given les suites de non-régression existantes, when elles sont exécutées, then les références, refus, comportements clavier/mobile et garanties de confidentialité restent vérifiés.

</frozen-after-approval>

## Implementation Notes

- 2026-10-09 — Ticket résolu avec le dossier explicite initiative-macrova, sans modifier la configuration après l'erreur d'initiative active absente. Arbre initial propre ; branche dédiée cohérente. Investigation indépendante des plans 2.1–2.6 : aucune dette différée courante. Les duplications sont des constats actuels liés aux constructions 2.4/2.6, et non des défauts prétendument reportés par leurs revues.
- Route oneshot : changement mécanique estimé à moins de 100 lignes, trois fichiers applicatifs. Plan et poursuite retenus sous mandat utilisateur. Les liens de correction et rendus de fractions restent composés sur place : leur extraction augmenterait le périmètre sans besoin identifié. Aucun bug connu laissé ouvert.

- Implémentation : module de présentation typé partagé ; ordre E/P/G/L explicite également dans l'éditeur, suppression des casts des clés issues d'Object.entries. Synchronisation mémoire unique via update, mesure toujours dans les deux gestionnaires explicites de succès. Aucun changement des styles ou des primitives.
- Dépendances absentes dans ce worktree : installation avec bun install --frozen-lockfile réussie, sans modification du verrou. Premier check a détecté une mise en forme corrigée par Biome.

- Vérifications intermédiaires : check 161 fichiers sans diagnostic, typecheck sortie 0, 412 tests unitaires réussis sur 23 fichiers. Première passe E2E : 24 réussites et un échec de chargement du module client Vite avant navigation depuis l'accueil ; instantané bloqué sur l'accueil, sans accès au formulaire. Redémarrage de la suite complète après optimisation des dépendances, sans modifier les tests ni leurs attentes.

## Plan Change Log

## Review Triage Log

- 2026-10-09 — Revue quick indépendante du diff complet et des fichiers environnants : high=0, medium=0, low=0, false=0, maybe-false=0. Aucun défaut ni critère non satisfait identifié, aucun travail différé.

## Verification

Depuis app/ : bun run check (sortie 0, zéro erreur et avertissement), bun run typecheck, bun run test (notamment oracles calculator et collecte), bun run test:e2e (parcours public, mobile, erreurs, retour, édition, focus, mesure explicite, panne et confidentialité), puis bun run build. Exécuter build après E2E pour éviter l'interférence de caches documentée en 2.5. git diff --check doit réussir. Réutiliser les preuves comportementales existantes ; aucun test qui recopie les métadonnées extraites. E2E standard ne constitue pas une recette d'authentification réelle. Revue quick indépendante du diff complet avant clôture.


### Vérification finale — 9 octobre 2026

- bun run check : sortie 0, 161 fichiers, zéro erreur et avertissement. bun run typecheck : sortie 0.
- bun run test : sortie 0, 412 tests réussis sur 23 fichiers ; résultats exacts des oracles du domaine et tests de mesure inchangés.
- bun run test:e2e : seconde passe complète sortie 0, 25 scénarios réussis en 1,6 minute. Aucun test supprimé ou assoupli. Les quatre valeurs de référence, l'édition exacte et reset, les six invalidations avec reprise mémoire, le clavier/mobile, la mesure explicite et la confidentialité, ainsi que les pannes/timeout/hors ligne sont vérifiés.
- bun run build : sortie 0, client/SSR générés ; avertissements de directives use client de dépendances déjà observés dans les builds précédents. Aucun diagnostic applicatif du check.
- git diff --check : sortie 0. Revue quick indépendante sans constat ; aucun travail différé. Les critères de l'intention sont satisfaits.
- Logs locaux : /tmp/macrova-2-7-unit.log, /tmp/macrova-2-7-e2e-final.log, /tmp/macrova-2-7-build.log. Statut built conformément au workflow ; aucun déploiement ni push effectué. La recette de livraison intégrée reste la story 2.8.
