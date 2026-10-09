---
title: 'Clore R1 et R5 de la rétrospective calculateur'
type: 'chore'
ticket: ''
created: '2026-10-09'
status: 'in-progress'
baseline_revision: 'a50d16f4be90ab22ebd702ccc5f06ab9fad0caa4'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-b25cb075/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-b25cb075/app/AGENTS.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** R1 manque de preuve au consommateur React lorsque la méthode devient indisponible alors que la session porte encore une estimation. R5 manque d'une procédure reproductible qui empêche les interférences entre serveurs, caches E2E et build.

**Approche :** Tester le rendu réel de la route avec une session calculée et les méthodes indisponibles ; démontrer par mutation que le test détecte la suppression de sa garde. Ajouter une commande locale isolant les artefacts, exécutant E2E puis build dans cet ordre et conservant les journaux en cas d'échec. Actualiser le suivi documentaire avec preuves effectives.

## Boundaries & Constraints

**Always :** Répondre et documenter en français. Conserver composants shadcn, assertions et protections existantes. Utiliser profils synthétiques sans réseau Convex réel. Garder les identifiants et contrats métier inchangés. Exécuter les commandes depuis app/. Le mandat utilisateur répond aux checkpoints : conserver les deux actions, approuver ce plan et continuer jusqu'à achèvement.

**Never :** Réaliser R2, R3 ou R4 ; les garder explicitement ouverts avec conditions de reprise. Ne pas inventer de preuve audio/mobile réel, auth ou cloud. Aucun déploiement, push, contact externe ou suppression de processus étrangers. Aucun secret copié ou enregistré dans Git. Ne pas tuer les processus par nom globalement ni supprimer les caches partagés. Ne pas exposer de fixture méthode en production.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Gestion d'erreur |
| --- | --- | --- | --- |
| Contrôle positif | Session calculée, méthode adoptée v1 | Résultat et éditeur rendus, six saisies conservées | Aucune |
| Méthode absente | Même session, null et undefined | Refus méthode visible, résultat et éditeur absents, six saisies conservées | Rendu de refus réel |
| Méthode non adoptée ou retirée | Même session, chacun des deux statuts | Même refus, sans mutation de la session | Rendu de refus réel |
| Autre version | Même session, v2 adoptée | Même refus et conservation | Rendu de refus réel |

</frozen-after-approval>

## Code Map

- `app/src/routes/calculateur.tsx` : `Route.options.component` contient Calculator ; garde outcome sélectionne calculateProfile lorsque méthode indisponible. Ne pas modifier le rendu produit.
- `app/src/domain/calculator.ts` : createCalculatorSession/calculateCalculatorSession/adoptedMethod fournissent une vraie session réussie (30/175/70/5/1.6/oui).
- `app/src/components/calculator-target-editor.tsx` : vrai consommateur à garder dans le rendu ; contrôles visibles de modification identifient son absence.
- `app/vitest.config.ts`, `app/tests/config/public-auth-boundary.test.ts` : tests Node possibles, mocks ciblés existants. Ajouter alias @ si nécessaire, sans dépendance DOM supplémentaire.
- `app/playwright.config.ts` : serveurs propres reuseExistingServer=false ; ports locaux 3001/3002/3999 ; deux Vite utilisent déjà des caches distincts via E2E_VITE_CACHE_DIR, mais chemin failure actuellement partagé.
- `app/vite.config.ts` : cacheDir paramétrable ; Vite/TanStack/Nitro génèrent aussi des artefacts dans l'app, donc un cache seul n'isole pas le build.
- `app/package.json`, `app/scripts/`, `app/docs/recette-calculateur-livraison.md`, `app/README.md` : points d'entrée de recette et documentation.
- `_bmad-output/initiative-macrova/epic-calculateur/epic-calculateur-retrospective.md` : source canonique R1–R5 ; `_bmad-output/initiative-macrova/deferred-work.md` contient les reports transversaux à conserver.

## Tasks & Acceptance

**Execution :**
- [ ] `app/tests/config/calculator-render.test.ts`, `app/vitest.config.ts` : rendre le véritable composant via renderToStaticMarkup et contexte injectable ; garder domaine, éditeur et composants réels. Mock limité de route/Link/hydratation. Vérifier chaque ligne de matrice, notamment six valeurs sélectionnées et session intacte.
- [ ] `app/scripts/verify-calculator.sh`, `app/package.json`, `app/playwright.config.ts` : commande de recette isolée. Privilégier copie temporaire privée de l'app sans .env, dépendances existantes réutilisées et caches temporaires distincts ; E2E puis build séquentiels. Précontrôle ports, verrou de recette, journaux par phase et arrêt ciblé des seuls enfants démarrés. Ne pas réutiliser serveur existant ; préserver échec et journaux plutôt que retry silencieux. Adapter seulement les points nécessaires à cette isolation.
- [ ] `app/README.md`, `app/docs/recette-calculateur-livraison.md` : expliquer isolation, ports, caches, gestion d'arrêt, ordre et localisation des logs ; commande utilisable depuis app/.
- [ ] `_bmad-output/initiative-macrova/epic-calculateur/epic-calculateur-retrospective.md`, `_bmad-output/initiative-macrova/deferred-work.md` : clore R1/R5 seulement après preuves ; conserver les passages historiques en les datant et les reports R2/R3/R4 avec leurs conditions.

**Acceptance Criteria :**
- Étant donné la garde actuelle, quand tous les tests de rendu tournent, alors chaque ligne de matrice réussit ; quand la garde outcome est supprimée temporairement, alors les cas indisponibles échouent, puis le fichier est restauré exactement.
- Étant donné une recette locale sans serveur préexistant sur les ports réservés, quand la commande isolée tourne, alors tous les E2E réussissent avant le début du build, le build réussit et aucun serveur de recette ne reste à la fin.
- Étant donné une collision de port ou un échec de commande, quand la recette démarre ou échoue, alors elle refuse ou s'arrête avec code non nul, garde une trace exploitable et ne modifie aucun serveur étranger.
- Étant donné la livraison, quand le suivi est lu, alors R1/R5 ont des preuves datées et R2/R3/R4 restent reportés sans réalisation annoncée.

## Implementation Notes

## Plan Change Log

## Review Triage Log

## Verification

Depuis app/ : `bun run check` (zéro diagnostic), `bun run typecheck`, `bun run test`, nouvelle recette isolée E2E puis build. Mutation ciblée temporaire avec restauration garantie ; vérifier ports avant/après et journaux de phases. `git diff --check` à la racine. Les traces complètes sont temporaires ; les faits reproductibles restent documentés. L'agent d'implémentation peut choisir une technique équivalente si elle satisfait les frontières et l'isolation effective.
