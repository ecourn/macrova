---
title: 'Parcours public et session sur environnement isolé'
type: 'chore'
ticket: 1
created: '2026-10-05'
status: done
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

## Code Review

### 2026-10-05 — revue indépendante à quatre angles

Revue terminée : 0 décision nécessaire, 4 corrections, 1 travail différé, 5 constats rejetés. Toutes les revues ont terminé ; la réponse vide initiale du chasseur de cas limites a été clarifiée par une confirmation détaillée.

- [x] [Review][Patch] Automatiser les refus de configuration [app/playwright.config.ts:22] — source blind-hunter + verification-gap ; medium. Aucun test existant ne détecterait la suppression du contrôle des URL ; intégrer un chargement isolé de la configuration à `bun run test`.
- [x] [Review][Patch] Cibler explicitement le projet de recréation [app/README.md:112] — source blind-hunter ; medium. `dev/socle-auth-tests` est relatif au projet courant selon le CLI installé ; utiliser un sélecteur équipe:projet:référence pour un autre projet.
- [x] [Review][Patch] Compléter le démarrage du formulaire de création [app/README.md:122] — source blind-hunter ; medium. `convex:dev --once` termine sans frontend ; indiquer le lancement de Vite et son arrêt avant Playwright.
- [x] [Review][Patch] Éviter une clé Convex prioritaire dans la procédure locale [app/README.md:106] — source blind-hunter ; medium. `getDeploymentSelection` donne priorité aux clés de déploiement ; la sélection met à jour les URL sans supprimer ces clés. Les commandes suivantes peuvent viser une autre cible.
- [x] [Review][Defer] Portabilité des snapshots de workflow [_bmad/render/bmad-build/macrova-37d327ad9312/b8d3fed12131b52a7189/workflow.md:33] — source blind-hunter ; low ; différé : instructions d’agents générées contenant des chemins absolus propres à cette machine. Le traitement relève de la politique de génération/versionnement BMad, hors correctifs applicatifs de cette revue.

### Constats rejetés

- blind-hunter, isolation permanente : false. Le contrat impose une validation sur un backend dédié et la correspondance des URL, sans exiger une liste blanche permanente de déploiements ; la procédure et le compte rendu ciblent le backend dédié. L’auditeur d’intention confirme cette distinction.
- blind-hunter, nom vide : false pour le dommage allégué. Les URL `https://.convex.cloud` et `https://.convex.site` ne désignent aucun backend utilisable ; aucun parcours ni création de compte sur une cible indue n’est démontré. Ajouter une garde serait durcir un état artificiel.
- blind-hunter, identifiants omis : false. La section précédente exige déjà `E2E_AUTH_EMAIL` et `E2E_AUTH_PASSWORD`, et la procédure renvoie explicitement à cette section.
- blind-hunter, preuve anonyme directe absente : false comme régression de cette modification. Le code backend et ses tests sont préexistants, non modifiés ; le contrat distingue parcours réels et états de session simulés, tous consignés. Le constat cite le plan et ne démontre aucun défaut du contrôle d’identité.
- blind-hunter, maintenance des comptes : false comme défaut établi. La conservation pour inspection est explicitement voulue ; aucune limite dépassée ni exigence de nettoyage violée n’est démontrée.

L’auditeur d’intention relève également que secrets et configuration distante ne sont pas observables dans le diff ; il ne formule pas de défaut. Aucune route ni protection d’authentification n’est modifiée.

### Actions et validation de la revue

Choix pris selon la délégation explicite de l’utilisateur : appliquer les quatre corrections, puis terminer le workflow sans lancer un nouveau ticket. Aucun statut de ticket n’a été changé.

- Sept tests de chargement réel de `playwright.config.ts` dans des processus Bun isolés, sans serveur ni réseau : configuration valide (avec et sans commentaire), URL cloud étrangère, URL site étrangère, production, URL absente, mode hors ligne. Intégrés à `bun run test` ; environnement Node réservé au fichier de configuration, environnement edge-runtime conservé pour Convex.
- README : sélecteur complet du projet cible, démarrage et arrêt du frontend pour créer le compte, rappel des identifiants et des clés Convex prioritaires.
- `bun run test` : 13 tests réussis, dont 6 tests backend existants et 7 tests de configuration.
- `bun run typecheck` : sortie 0.
- `bun run check` : sortie 0, 100 fichiers, zéro erreur et zéro avertissement. Les diagnostics initiaux de typage des jeux de données et de formatage ont été corrigés sans suppression de règle.
- Les parcours réels et le backend distant n’ont pas été réexécutés ou modifiés lors de cette revue. Leurs résultats précédents restent ceux consignés dans la section Verification.

Actions de revue terminées : 0 décision restante, 4 corrections appliquées, 1 élément différé, 5 constats rejetés.
