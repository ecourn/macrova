---
title: 'Réutiliser les primitives shadcn'
type: 'refactor'
ticket: ''
created: '2026-10-07'
status: 'built'
baseline_revision: '6aaa299414bdf5c975d6a9d78aab9261fdbbb566'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** La réutilisation de shadcn n'est pas explicitement prescrite ; des groupes de champs et messages d'erreur sont assemblés manuellement dans les routes d'authentification.

**Approche :** Vérifier les composants et routes de `app/src`, remplacer les primitives UI personnalisées ayant un équivalent par les composants locaux shadcn, et inscrire cette convention dans `AGENTS.md`. Aligner les mentions contradictoires des contrats UX sur ce choix. Préserver les composants métier, le HTML sémantique de structure, les labels, les attributs de validation, la soumission POST et les protections avant hydratation.

</frozen-after-approval>

## Implementation Notes

- Route oneshot : moins de 100 lignes modifiées, réutilisation de composants locaux sans nouvelle dépendance ni modification du backend.
- Inspection : les contrôles utilisent déjà Button, Input et Label ; seules les primitives de groupes de champs et les deux alertes d'erreur nécessitent une substitution. Les composants de page et CurrentUser portent la logique applicative.

- Remplacements : `Field` / `FieldLabel` pour les trois groupes de champs de connexion et inscription ; `Alert` / `AlertDescription` pour les erreurs de connexion et déconnexion. Les attributs des contrôles et la logique auth restent identiques.
- Convention ajoutée dans `AGENTS.md` et mentions du système UI alignées dans `DESIGN.md` et `EXPERIENCE.md`.
- Vérification : `bun run check` (145 fichiers, zéro diagnostic), `bun run typecheck` et `bun run build` réussis. Le build signale des avertissements de bundling des directives « use client » dans les dépendances Base UI ; aucune modification de ces dépendances. Aucun parcours d’authentification réelle exécuté.

## Plan Change Log

## Review Triage Log

- Revue indépendante quick : aucun constat, aucun élément différé.

## Verification

- Depuis `app/`, `bun run check` : zéro erreur, zéro avertissement.
- Depuis `app/`, `bun run typecheck` : code de sortie 0.
- Inspection du diff : labels et validation inchangés, `method="post"`, blocages `busy || !ready`, annonces `role="alert"` préservés.
