---
title: Publier les corrections du socle sur le test existant
type: chore
ticket: ''
created: '2026-10-07'
status: built
baseline_revision: 1b7e060328c7a32153f41ecb0c83cb1179553830
route: oneshot
route_source: auto
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - /home/ubuntu/macrova/AGENTS.md
  - /home/ubuntu/macrova/app/AGENTS.md
---

<frozen-after-approval reason="Publication et décisions autorisées par le propriétaire">

## Intent

Publier la révision existante `1b7e060328c7a32153f41ecb0c83cb1179553830`, contenant les corrections auth et les primitives shadcn, sur le service de test Render existant. La cible publiée actuelle exécute encore `95bc8899e88aeb3ef9f8bfb965a0b411a21cb226` ; les recettes distantes précédentes ne prouvent donc pas les corrections récentes.

Vérifier les contrôles locaux, la correspondance des URL et la disponibilité du backend dédié avant publication manuelle du frontend. Conserver service Free Frankfurt, workspace `tea-db2fsavlot8c73f24nr0`, backend `dev:dazzling-puffin-856`, origine HTTPS exacte et secret Better Auth existant. Aucun changement de production, de contrat métier, de schéma, de budget ou de secret. La révision est déjà accessible sur main GitHub : aucun push applicatif nécessaire. L’utilisateur délègue les choix et l’approbation du plan ; choix retenu : approuver et poursuivre.

Étant donné la révision validée, lorsque Render termine la publication, alors le déploiement actif référence exactement son SHA complet. Étant donné ce déploiement HTTPS, lorsque la recette distante réelle s’exécute, alors public, assets, protections préhydratation, inscription, connexion POST, persistance SSR, révocation, déconnexion et contrôles privés réussissent. Étant donné les preuves relevées, lorsque la fiche de livraison est lue, alors elle distingue explicitement cette nouvelle publication des preuves historiques.

</frozen-after-approval>

## Implementation Notes

Route oneshot : publication opérationnelle et complément documentaire, aucun code applicatif à ajouter. Investigation indépendante confirme les corrections déjà revues, les accès CLI Render disponibles et les six scénarios distants créant leurs comptes synthétiques sans identifiants préexistants.

Fichiers réutilisés : `render.yaml`, `app/docs/livraison-ssr-test.md`, `app/playwright.config.ts`, `app/tests/e2e/`, `app/tests/integration/start-abort.mjs`. Compléter uniquement la fiche de livraison et ce plan avec les preuves actuelles. Préserver l’histoire.

## Plan Change Log

## Review Triage Log

Revue quick indépendante : aucun constat ; SHA actif, recette HTTPS et contrôles
locaux corroborés par les preuves. Lentilles thorough non exécutées, publication
opérationnelle et complément documentaire uniquement. Aucun report supplémentaire.

## Verification

- Depuis app : tests unitaires, typecheck, check sans avertissement, build et intégration serveur compilé.
- Relire sélection Convex et SITE_URL sans extraire BETTER_AUTH_SECRET. Confirmer service et révision par CLI Render.
- Publication manuelle du SHA précis ; attendre état live, vérifier monitor:socle et test:e2e:remote en HTTPS, sans capture auth.
- Vérifier assets HTTP200 et journaux sous forme agrégée uniquement, sans données brutes.
- Revue quick indépendante du complément documentaire et des preuves ; commit final du relevé.

### Résultats exécutés

Backend dédié synchronisé le 7 octobre à 17:52:55 UTC. Render live :
`dep-db38e2mgekts73ak9n60`, révision
`1b7e060328c7a32153f41ecb0c83cb1179553830`, terminé
`2026-10-07T17:54:09.812142Z`. Sept variables Render conformes ; offre Free
Frankfurt, auto-deploy et previews off. Secret backend préservé.

Tests 195/195, typecheck/check sortie 0 (145 fichiers sans diagnostic), build
et intégration compilée 1/1. Recette auth HTTPS 6/6 en 23,8 s sur la nouvelle
publication, monitor SSR/Convex OK et six assets HTTP200. Aucun marqueur de
credential détecté dans les échantillons runtime inspectés ; historique Convex
collecté avec arrêt intentionnel après cinq secondes. Aucun changement applicatif
ni push nécessaire : révision déjà sur main distante. Navigateur T3 indisponible
explicitement ; recette Playwright existante utilisée. Fiche effective complétée
dans app/docs/livraison-ssr-test.md sans altérer la preuve historique.
