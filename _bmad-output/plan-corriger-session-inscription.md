---
title: 'Corriger la session après inscription'
type: 'bugfix'
ticket: ''
created: '2026-10-05'
status: 'built'
baseline_revision: '97e12bf4cb3a547bd13300e1a3441bb3fcdda322'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['app/AGENTS.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Après création de compte, la requête Convex auth:getCurrentUser peut lever Unauthenticated et faire planter le tableau de bord. Le composant Better Auth possède déjà son schéma et ses tables ; l'inscription a créé un utilisateur, mais une session valide doit encore être reconnue.

**Approach:** Vérifier le parcours réel sur le déploiement de développement configuré, corriger les problèmes établis et traiter l'absence de session comme un état explicite avec retour à la connexion. Conserver les vérifications serveur de l'identité et de la session et laisser remonter les véritables erreurs. Vérifier inscription, connexion, persistance après rechargement et déconnexion. L'utilisateur a approuvé ce périmètre par « go ahead » après le diagnostic ; aucune approbation intermédiaire requise.

</frozen-after-approval>

## Implementation Notes

Correction ciblée estimée à moins de 100 lignes modifiées, route oneshot. Travail autonome hors initiative, conformément à la demande de répondre aux questions à la place de l'utilisateur. Les seuls fichiers non suivis au démarrage sont les snapshots _bmad/render générés par cette invocation.

Constats : auth:getCurrentUser utilise le getter strict getAuthUser ; dashboard.tsx possède déjà Authenticated ; le provider transmet les jetons ; les versions 0.12.5/1.6.15 sont compatibles. Le schéma principal vide est volontaire. Les URL .cloud/.site ciblent watchful-marlin-398. La lecture distante montre un utilisateur avec compte credential mais aucune session au moment de la vérification. Ce constat ne prouve pas la cause de la trace passée.

Cibles : app/convex/auth.ts pour un getter nullable vérifiant la session ; app/src/routes/dashboard.tsx pour l'état absent et la redirection ; app/tests/e2e/auth.spec.ts et documentation pour les parcours réels ; ajouter une vérification backend appropriée si nécessaire.

Vérification initiale :les tests backend reproduisaient quatre erreurs Unauthenticated avant correction ; les six tests passent après correction. Une inscription réelle fonctionne ; après révocation HTTP de sa session, le tableau de bord retourne à /login. Tests navigateur réels ajoutés pour inscription/rechargement/révocation. Le port des tests réels peut correspondre à SITE_URL sans modifier la configuration distante.

Les tests de parcours ont établi un second défaut du même parcours : les boutons SSR sont utilisables avant hydratation. Inscription perdait le clic de bascule, connexion pouvait soumettre nativement les champs dans l’URL, déconnexion pouvait perdre le clic. Correction avec useHydrated fourni par TanStack sur les boutons login/dashboard et method=post sur le formulaire. Test sans JavaScript ajouté pour vérifier que le formulaire ne transmet pas les identifiants. L’estimation de lignes a augmenté avec les tests backend et les régressions de navigateur, mais la correction reste directe et cohérente sur la route oneshot.

Dernière correction : pendant signOut, retirer la souscription CurrentUser et empêcher la redirection automatique, puis naviguer avec le routeur. Cela évite la compétition entre changement de session et window.location.assign. Les tests vérifient les exceptions navigateur et les erreurs console ; seul le refus HTTP 401 explicitement identifié sur /api/auth/convex/token après révocation est attendu. Les autres erreurs restent des échecs. Revue rapide retenue ; lentilles adversariale, structure/prose et explorations approfondies non lancées pour cette correction ciblée.

## Plan Change Log

## Review Triage Log

Trois passes de revue rapide indépendantes : aucun défaut établi. Dernière passe couvre la coordination des redirections de déconnexion et le filtre strict du HTTP 401 attendu. Aucun finding différé.

## Verification

- bun run check : zéro erreur et zéro avertissement, sortie 0.
- bun run typecheck et bun run build : réussite.
- Tests backend pertinents : utilisateur anonyme et session invalide donnent null ; session valide donne l'utilisateur ; erreur backend réelle reste une erreur.
- bun run test:e2e : parcours publics/offline préservés.
- Vérification réelle du compte de test : inscription, récupération utilisateur côté Convex, rechargement, déconnexion et accès anonyme privé ; aucun plantage Unauthenticated.

Résultats finaux :
- bun run test : 6 tests backend réussis (anonyme, valide, révoquée, expirée, utilisateur supprimé, erreur backend réelle).
- E2E_AUTH_PORT=3000 bun run test:e2e:auth : 5 parcours réussis sur le déploiement de développement configuré, avec compte de test dédié.
- bun run test:e2e : 4 parcours publics/offline réussis.
- bun run check : zéro erreur et zéro avertissement, sortie 0.
- bun run typecheck et bun run build : sorties 0.
- L'inscription réelle et la cohérence de session sont vérifiées ; la cause exacte de la session manquante dans la trace initiale n'a pas pu être reconstituée. Aucun changement manuel de schéma requis et aucune configuration de production modifiée.
