<!-- bmad:context -->
<!-- Vérifié le 2026-10-05 contre c80ce0f3f28ab7fe2cbfd1e0d325b9aab4f4be0a. Géré par bmad-project-context ; ce bloc est remplacé lors des actualisations. Conserver les consignes personnelles hors des marqueurs. -->

## Politique

- Répondre toujours en français.
- Pour tout travail dans `app/`, lire et appliquer `app/AGENTS.md`, même si la session démarre à la racine.

## Points d’entrée

- Pour une fonctionnalité produit, lire `_bmad-output/spec-macrova/spec-macrova.md` et ses compagnons déclarés.
- Pour les frontières, contrats partagés ou changements de persistance dans `app/`, lire `_bmad-output/initiative-macrova/architecture-app/architecture-app.md` ; distinguer le socle existant des modules à construire et les décisions adoptées des hypothèses.
- Pour une modification de l’interface ou d’un parcours, lire `_bmad-output/ux-macrova/DESIGN.md` et `_bmad-output/ux-macrova/EXPERIENCE.md`.
- Pour configurer Convex ou exécuter les parcours d’authentification, lire les sections correspondantes de `app/README.md`.

## Exécution et vérification

- Lancer les commandes de l’application depuis `app/` ; la racine ne possède pas de manifeste applicatif.
- Démarrer Convex avec `bun run convex:dev` : `scripts/convex-dev.sh` gère les répertoires temporaires et leurs verrous, et exige `flock`.
- Ne pas interpréter `bun run test:e2e` comme une validation de l’authentification réelle : ce mode neutralise les URL Convex. Utiliser `bun run test:e2e:auth` avec un backend `dev:` et un compte de test, selon le README ; le port doit être libre et correspondre au `SITE_URL` du backend.
- Ne placer aucun secret dans Git ni dans une variable `VITE_*` ; conserver les secrets d’authentification côté backend.

## Pièges observés

- Lors d’une modification de session, traiter explicitement son absence, son expiration ou sa révocation sans masquer les véritables erreurs backend ; consulter `_bmad-output/plan-corriger-session-inscription.md`.
- Pour les formulaires et boutons d’authentification rendus côté serveur, préserver les protections avant hydratation et la soumission POST : les parcours ont révélé des clics perdus et une transmission des identifiants dans l’URL sans ces protections.
- Ne pas remplacer le contrôle d’identité dans Convex par la garde d’une page : chaque opération privée doit vérifier la session côté backend ; les tables d’authentification appartiennent au composant Better Auth.

<!-- /bmad:context -->
