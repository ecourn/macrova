---
type: epic
title: "Composition personnelle contrôlée"
parent: initiative-macrova
covers: ["CAP-4"]
risk: high
---

# Composition personnelle contrôlée

## Description

Une personne autorisée confirme sa cible et les contraintes de 3 à 6 aliments puis obtient une proposition contrôlable. Les règles applicables sont AD-3, AD-4, AD-6, AD-12.

## Outcome

Une modification invalide la proposition ; le brouillon conserve les saisies au retour et le backend refuse un accès direct sans droit.

## Requirements

- CAP-4 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.

## Done when

1. Une personne autorisée confirme sa cible et les contraintes de 3 à 6 aliments puis obtient une proposition contrôlable.
2. Les écarts signés, impossibilités et interruptions sont expliqués sans correction silencieuse ni nutrition inventée.
3. Une modification invalide la proposition ; le brouillon conserve les saisies au retour et le backend refuse un accès direct sans droit.
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

- Unknown: Les bornes et pas sont confirmés depuis une référence ou une saisie utilisateur ; aucune portion universelle. La sauvegarde appartient à l’epic repas/journal.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
