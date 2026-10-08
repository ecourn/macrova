---
type: epic
title: "Validation d’usage et ouverture maîtrisée"
parent: initiative-macrova
covers: []
risk: high
---

# Validation d’usage et ouverture maîtrisée

## Description

Les conditions de données, licences, paiement et exploitation sont approuvées avant toute ouverture publique. Les règles applicables sont AD-8, AD-9, AD-10, AD-11.

## Outcome

Temps, erreurs, plausibilité des portions, coûts et renouvellement à un mois alimentent une décision explicite de poursuite, correction ou abandon.

## Requirements

- Exigences transversales — _bmad-output/initiative-macrova/architecture-app/architecture-app.md, AD-8, AD-9, AD-10, AD-11 ; protocole-validation.md pour les observations et conditions d’ouverture.

## Done when

1. Les conditions de données, licences, paiement et exploitation sont approuvées avant toute ouverture publique.
2. À partir des quinze entretiens de l’epic enquête, une bêta de 20 à 30 personnes sur deux semaines est documentée avec invitation et canaux.
3. Activation, réutilisation J6 à J8 et cinq paiements encaissés non remboursés sont évalués selon le protocole, hors démonstration.
4. Temps, erreurs, plausibilité des portions, coûts et renouvellement à un mois alimentent une décision explicite de poursuite, correction ou abandon.
5. Le parcours intégré est vérifié sur le déploiement cible, avec erreurs et accès interdits ; la production publique reste conditionnée aux validations de lancement.

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

- Unknown: Travaux humains et observations réelles requis ; ils ne peuvent être remplacés par des scénarios fictifs. Les seuils internes ne prouvent pas la rentabilité.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
- Decision: 2026-10-05 — dérouler cet epic en phases : vérifier les conditions et autoriser l’ouverture contrôlée avant recrutement bêta et paiements réels, puis collecter les usages, dresser le bilan à deux semaines et observer le renouvellement à un mois ; le bilan n’est pas une condition préalable d’ouverture.
- Decision: 2026-10-05 — les prérequis des epics techniques sont leurs capacités utilisables de mesure et de paiement ; les résultats observés sont produits ici, jamais attendus en amont.

- Decision: 2026-10-08 — gouvernance à deux : les responsabilités de cet epic sont coordonnées par l’agent mandaté, avec l’utilisateur pour les interventions humaines et les accès. Aucune approbation externe organisationnelle n’est requise ; les preuves techniques, terrain et conditions d’activation restent exigées au moment pertinent selon la correction `../change-gouvernance-a-deux/change-gouvernance-a-deux.md`.
