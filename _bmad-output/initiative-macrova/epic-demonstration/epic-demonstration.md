---
type: epic
title: "Démonstration complète de repas ajustables"
parent: initiative-macrova
covers: ["CAP-2"]
risk: high
---

# Démonstration complète de repas ajustables

## Description

Le moteur déterministe respecte grille, bornes, pas et verrous avec résultats et écarts explicites. Les règles applicables sont AD-2, AD-3, AD-4, AD-11, AD-12.

## Outcome

La démonstration reste en mémoire et ne crée ni repas personnel ni événement d’activation.

## Requirements

- CAP-2 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.

## Done when

1. Le moteur déterministe respecte grille, bornes, pas et verrous avec résultats et écarts explicites.
2. Un exemple sourcé permet sélection, verrouillage, proposition et reprise simulée avant affichage de l’offre.
3. La démonstration reste en mémoire et ne crée ni repas personnel ni événement d’activation.
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

- Unknown: Cet epic possède le moteur commun ; algorithme et budget CPU doivent être choisis sur les grilles réelles, avec état recherche interrompue. Les exemples viennent du catalogue.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
- Decision: 2026-10-05 — livrer le moteur ET les composants accessibles de portions/bilan réutilisables par Composition ; la démo conserve son état isolé.

- Decision: 2026-10-08 — gouvernance à deux : les responsabilités de cet epic sont coordonnées par l’agent mandaté, avec l’utilisateur pour les interventions humaines et les accès. Aucune approbation externe organisationnelle n’est requise ; les preuves techniques, terrain et conditions d’activation restent exigées au moment pertinent selon la correction `../change-gouvernance-a-deux/change-gouvernance-a-deux.md`.
