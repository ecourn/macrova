---
title: Audit factuel des dépendances, parcours sensibles et règles BMAD
type: chore
ticket: ""
created: 2026-10-10
status: built
baseline_revision: afa792bc8b9852dbbb85535aef9348b1d8616129
route: oneshot
route_source: auto
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - app/AGENTS.md
  - _bmad-output/spec-macrova/spec-macrova.md
  - _bmad-output/initiative-macrova/architecture-app/architecture-app.md
  - _bmad-output/ux-macrova/DESIGN.md
  - _bmad-output/ux-macrova/EXPERIENCE.md
---

<frozen-after-approval reason="périmètre délégué par utilisateur ; décisions autonomes autorisées le 10 octobre">

## Intent

**Problème :** Vérifier le dépôt actuel plutôt que reprendre des conclusions non démontrées sur ses dépendances et parcours. Rendre les consignes pertinentes durables lors des actualisations BMAD et livrer les preuves de vérification avec leurs limites.

**Approche :** Inventorier manifestes/verrou et usages directs, indirects, CSS, configurations, CLI, scripts et tests ; examiner auth/SSR/hydratation/POST, sessions/erreurs, calculateur/URL/accessibilité et droits Convex. Corriger seulement les défauts prouvés ; conserver les décisions de non-modification et les suggestions facultatives dans le rapport.

**Décisions :** Travail rattaché à initiative-macrova. Pas de migration Form/Zod/Table/nuqs, suppression sur absence d’import, nouvelle fonctionnalité, modification de secret ni intervention sur backend externe. Garder les consignes existantes et ajouter une entrée de personnalisation BMAD versionnée. Traduire uniquement le message 404 anglais. Valider les contrôles locaux et E2E réalisables ; déclarer les prérequis absents sans les contourner. L’utilisateur demande de répondre à sa place et d’achever la tâche sans nouvel arrêt.

**Acceptation :** Étant donné le dépôt à la révision initiale, quand l’audit est livré, alors chaque dépendance directe possède sa version verrouillée et sa décision motivée. Étant donné les parcours sensibles, quand les contrôles sont exécutés, alors leurs résultats distinguent mocks, réseau simulé et identité réelle. Étant donné une actualisation BMAD, quand sa personnalisation est résolue, alors les règles app/AGENTS et les sources UX sont présentes sans déplacement ni suppression des règles existantes. Étant donné une URL inconnue, quand la page 404 s’affiche, alors son message est français.

</frozen-after-approval>

## Implementation Notes

- Route oneshot : modifications applicatives et de configuration estimées à moins de 100 lignes ; l’essentiel de la livraison est documentaire. Investigation parallèle en lecture seule sur dépendances/calculateur et BMAD/backend.
- Le dépôt était propre avant configuration de l’initiative. Révision complète enregistrée ci-dessus. Aucun rapport antérieur couvrant cet audit trouvé ; les audits OFF sont un autre périmètre.
- Source du bloc : skill installé bmad-project-context ; ses defaults sont remplaçables, les overrides équipe dans _bmad/custom sont la surface pérenne. Le skill exige déjà un registre de conservation : aucune perte automatique n’est démontrée. Ajout demandé de sources permanentes, sans régénérer le bloc ni modifier app/AGENTS.
- Contrôles initiaux : check/typecheck/test échouent 127 faute d’installation ; bun install --frozen-lockfile réussit sans modification du verrou. Puis check : 181 fichiers, aucun diagnostic ; typecheck : 0 ; tests : 29 fichiers, 561 tests réussis.

- Reprise de la même mission avec vérification indépendante des artefacts existants. Ajout de conventions bibliothèque sourcées et de deux déclencheurs au bloc racine, sans retrait de règle. app/AGENTS inchangé.
- Validation actuelle : installation frozen, check, typecheck, 561 tests et build réussis. Premier E2E isolé : 37/38, échec Chromium ERR_INSUFFICIENT_RESOURCES conservé ; seconde recette : 34/38, mêmes erreurs de ressources ; comparaison finale : 25/25 E2E compilés et 13/13 catalogue Vite standard réussis. Auth réelle non exécutée, cinq prérequis absents ; aucune intervention externe.

## Plan Change Log

## Review Triage Log

- patch : cache Python __pycache__ produit par unittest et présent dans le snapshot de revue ; retiré de la livraison. Aucun autre constat établi par le reviewer context-free ; versions des 49 dépendances et résolution des règles BMAD contrôlées indépendamment.

## Verification

- Depuis app/ : bun install --frozen-lockfile, bun run check, bun run typecheck, bun run test.
- Depuis app/ : bun run verify:calculator pour E2E et compilation isolés ; E2E catalogue ciblé séparé si nécessaire.
- Résoudre la personnalisation bmad-project-context et vérifier le chargement des sources/règles.
- Examiner git diff --check et le diff complet ; revue indépendante context-free selon le workflow oneshot.
- Examiner seulement la présence des prérequis auth réelle, sans afficher les secrets, modifier leur configuration ni appeler le backend externe.

## Livraison

Rapport complet : [audit-dependances-parcours-regles.md](audit-dependances-parcours-regles.md). Six fichiers livrés : contexte racine, un littéral 404, conventions, personnalisation BMAD, rapport et plan. Critères couverts avec limites de validation explicites ; recette isolée non verte, aucune modification des assertions pour masquer ses échecs.
