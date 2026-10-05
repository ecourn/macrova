---
type: epic
title: "Cible estimative publique"
parent: initiative-macrova
covers: ["CAP-1"]
risk: high
---

# Cible estimative publique

## Description

Une méthode documentée, ses entrées, limites et exclusions sont validées avant tout calcul automatique. Les règles applicables sont AD-1, AD-2, AD-10, AD-12.

## Outcome

Les cas exclus et entrées invalides ne produisent aucune estimation automatique.

## Requirements

- CAP-1 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.

## Done when

1. Une méthode documentée, ses entrées, limites et exclusions sont validées avant tout calcul automatique.
2. Sans compte, une personne obtient puis modifie sa cible avec hypothèses visibles et recalcul cohérent.
3. Les cas exclus et entrées invalides ne produisent aucune estimation automatique.
4. Le parcours intégré est vérifié sur le déploiement cible, avec erreurs et accès interdits ; la production publique reste conditionnée aux validations de lancement.

## Boundaries

Périmètre limité au résultat décrit et aux capacités couvertes ; appliquer les Non-goals de la spécification.

## References

- spec — _bmad-output/spec-macrova/spec-macrova.md, Capabilities, Constraints et Non-goals
- architecture — _bmad-output/initiative-macrova/architecture-app/architecture-app.md
- ux — _bmad-output/ux-macrova/DESIGN.md
- ux — _bmad-output/ux-macrova/EXPERIENCE.md
- règles — _bmad-output/spec-macrova/regles-repas.md
- lancement — _bmad-output/spec-macrova/decisions-lancement.md
- validation — _bmad-output/spec-macrova/protocole-validation.md

## Notes

- Unknown: La méthode nutritionnelle est ouverte : une investigation sourcée et sa validation ouvrent cet epic ; aucune formule présumée.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
