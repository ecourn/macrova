---
title: 'Parcours public et session sur environnement isolé'
type: 'chore'
ticket: 1
created: '2026-10-05'
status: 'built'
baseline_revision: 'f2af0670311047e05359c2515ad665300aed092a'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['app/AGENTS.md', 'app/README.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** SOC-1 dispose déjà du parcours public et de l’authentification SSR, mais le ticket ne possède pas de preuve sur un environnement dédié. La configuration E2E accepte des URL ne correspondant pas au déploiement déclaré.

**Approach:** Réutiliser le socle existant, préparer un déploiement cloud `dev:` dédié aux tests avec les accès Convex déjà présents, vérifier les URL avant les parcours et consigner les résultats. Créer un compte exclusivement destiné aux tests, avec identifiants temporaires hors Git ; garder le secret Better Auth côté backend. Préserver POST, protections avant hydratation et contrôles de session côté Convex. La délégation de l’utilisateur autorise les choix et la poursuite sans approbation intermédiaire.

**Acceptation :** Étant donné le backend dédié configuré, lorsque les parcours réels sont exécutés, alors inscription, connexion, rechargement, révocation, déconnexion et refus d’accès anonyme passent. Étant donné les sessions simulées, lorsque la session est absente, expirée ou révoquée, alors la lecture retourne null ; une erreur backend reste une erreur. Étant donné des URL étrangères au déploiement, lorsque la suite réelle démarre, alors la configuration refuse avant toute création de compte.

</frozen-after-approval>

## Implementation Notes

Route oneshot : moins de 100 lignes de code prévues ; l’authentification et ses tests sont déjà présents. Investigation déléguée : aucune réécriture des routes nécessaire. `app/playwright.config.ts` contrôle seulement le préfixe dev et la présence des URL ; renforcer leur correspondance cloud. `app/README.md` documente déjà les parcours et le port, compléter avec l’isolation reproductible. `app/tests/e2e/auth.spec.ts` couvre inscription/révocation et connexion/déconnexion ; `app/convex/auth.test.ts` couvre six états de session, dont l’erreur réelle. Le backend initial est accessible, SITE_URL vaut http://localhost:3000 ; les identifiants E2E ne sont pas fournis, mais l’inscription permet de créer un compte de test réel. Le CLI installé permet `convex deployment create dev/<référence> --type dev --select`. Seuls les snapshots `_bmad/render/` étaient non suivis au démarrage.

## Plan Change Log

## Review Triage Log

Revue quick indépendante : aucun constat vérifié ; high=0, medium=0, low=0, false=0, maybe-false=0. Aucun travail différé.

## Verification

- `bun run convex:dev --once` : synchronisation du backend dédié.
- `E2E_AUTH_PORT=3000 bun run test:e2e:auth` : parcours réels réussis.
- `bun run test` : six tests backend réussis.
- `bun run test:e2e` : quatre parcours publics/offline réussis.
- `bun run check`, `bun run typecheck`, `bun run build` : sorties 0, zéro erreur et zéro avertissement Biome.
- Vérifier les refus de configuration avec URL cloud/site ne correspondant pas au déploiement.

Résultats obtenus : backend `dev/socle-auth-tests` créé et sélectionné (`dev:dazzling-puffin-856`), synchronisation réussie, secret distinct généré et configuré directement côté backend. SITE_URL=http://localhost:3000. Compte de test créé par API Better Auth avec adresse unique et mot de passe aléatoire ; identifiants uniquement dans la mémoire du processus E2E, jamais écrits dans Git ou VITE_*. La sélection locale cible ce backend dédié. Les anciens déploiements ne sont pas modifiés.

Vérifications : 5 parcours auth/public réels réussis en 29,7 s, dont inscription, session après rechargement, révocation sans clic et connexion/déconnexion. 6 tests backend réussis, dont session expirée et propagation d’erreur backend. Types et build client/SSR : sorties 0. Biome : 99 fichiers vérifiés, aucun diagnostic. Trois configurations invalides (cloud étrangère, site étranger, prod) refusées avant exécution. Documentation de sélection/recréation ajoutée au README ; validation des URL ajoutée à Playwright.

Suite publique/offline : 4 parcours réussis en 9,0 s. Aucun compte ni secret réel dans les fichiers suivis. Les comptes artificiels créés sont conservés uniquement dans le composant Better Auth du backend dédié, conformément au README.
