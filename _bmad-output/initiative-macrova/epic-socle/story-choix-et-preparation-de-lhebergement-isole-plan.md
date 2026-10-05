---
title: 'Choix et préparation de l’hébergement isolé'
type: 'chore'
ticket: 7
created: '2026-10-05'
status: 'built'
baseline_revision: '9e3b1e10fc3fef90e89bf6fe2827156c21ea71d1'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['app/AGENTS.md', 'app/README.md', '_bmad-output/initiative-macrova/architecture-app/architecture-app.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le ticket 1.7 doit fournir au ticket 1.5 une décision d’hébergement SSR, un budget, des régions et des accès de test identifiables. Le backend synthétique du ticket 1 existe ; aucun accès Render n’est configuré.

**Approach:** Documenter Render Web Service Free à Francfort, la séparation des variables, l’ordre backend puis frontend, les prérequis Nitro et la recette de remise des accès. Budget autonome retenu : aucune dépense ; aucun changement de compte payant. Réutiliser le backend dédié existant sans prétendre connaître sa région. La délégation de l’utilisateur vaut résolution des choix et poursuite sans checkpoint intermédiaire. L’ouverture de compte et sa connexion ne peuvent être inventées ; consigner distinctement préparation achevée et acceptation distante restante.

**Acceptation :** Étant donné le socle existant, lorsque le responsable consulte la décision, alors hébergeur, régions cibles et observées, budget, variables et livraison sont documentés. Étant donné un compte fournisseur autorisé, lorsque les accès de test sont remis, alors le responsable accède au frontend HTTPS et au backend associé, sans secret versionné et sans données réelles. Cette seconde condition exige une connexion fournisseur réelle et la livraison du ticket 1.5 ; elle ne sera pas annoncée réussie par cette préparation.

</frozen-after-approval>

## Implementation Notes

Route oneshot : documentation seulement, moins de 100 lignes applicatives ; l’adaptateur et la publication appartiennent au ticket 1.5, qui dépend de 7. Réutiliser app/README.md (backend dev dédié, auth POST/SSR), app/vite.config.ts (sans adaptateur de production), app/package.json et bun.lock. Ne modifier ni identité Convex, ni domaine, ni UX, ni ticket. Les instructions de la story 1 confirment dazzling-puffin-856 et comptes synthétiques ; elles ne prouvent pas la région ni un frontend distant. Sources officielles consultées le 2026-10-05 : TanStack hosting, Render free/regions/deploys, Convex regions/pricing. Pas de clé ou configuration CLI Render disponible ; plugin Render trouvé mais non installé/connecté, suggestion émise. Les choix sont pris selon la délégation ; l’accès de compte reste une dépendance externe.

## Plan Change Log

## Review Triage Log

Revue quick indépendante : 1 constat medium, 0 high, 0 low, 0 false, 0 maybe-false. Acceptation distante non satisfaite : fiche sans URL Render ni accès remis. Constat confirmé ; route defer pour dépendance externe de compte, sans fermeture du ticket ni annonce de résultat distant. Correction documentaire déjà présente : préparation et acceptation distinguées. Le statut built décrit l’artefact documentaire revu, pas une story done. Les angles thorough sont omis sur cette route documentaire oneshot.

## Verification

- Lire la décision contre AD-10 et les contrats des tickets 1, 5, 7 ; vérifier liens locaux et absence de secrets.
- `bun run check` depuis app : sortie 0, aucun diagnostic.
- Revue quick indépendante de la documentation et de l’acceptation restante.
- Accès frontend distant et région backend : non vérifiés tant que le fournisseur n’est pas connecté ; conserver cette limite dans le résultat.

Résultats : `bun run check` depuis app, sortie 0, 124 fichiers, zéro erreur et avertissement. Liens locaux valides ; `git diff --check` sortie 0. Aucun code exécutable modifié, aucun backend publié, aucun secret copié. Le premier essai de check à la racine a échoué faute de manifeste ; la commande requise a ensuite été exécutée depuis app. Le plugin Render disponible a été suggéré, sans installation ou connexion confirmée. Reste obligatoire : accès Render autorisé, relevé région/plan backend et recette distante après publication par 1.5. Ne pas marquer le ticket done avant ces preuves.
