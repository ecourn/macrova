---
type: epic
title: "Aliments sourcés et corrections privées"
parent: initiative-macrova
covers: ["CAP-3"]
risk: high
---

# Aliments sourcés et corrections privées

## Description

La recherche explicite Open Food Facts distingue absence de résultats, source indisponible et cache ancien. Les règles applicables sont AD-3, AD-6, AD-8, AD-12.

## Outcome

Un audit traçable de 50 recherches instruit la couverture et les exemples de démonstration.

## Requirements

- CAP-3 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.

## Done when

1. La recherche explicite Open Food Facts distingue absence de résultats, source indisponible et cache ancien.
2. Source, date, base et état sont visibles ; absence et zéro restent distincts et les conversions ambiguës sont bloquées.
3. Les corrections sourcées sont privées et isolées entre comptes, avec droit actif contrôlé au backend.
4. Un audit traçable de 50 recherches instruit la couverture et les exemples de démonstration.
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

- Unknown: Audit, conditions OFF et adéquation des limites numériques restent à instruire ; aucun catalogue supplémentaire adopté. Les corrections pourront être vérifiées avec un droit de test serveur isolé avant intégration du paiement.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
- Decision: 2026-10-05 — le socle fournit le contrat de droits et le dispositif de test serveur isolé ; l’enquête fournit les repas et requêtes, cet epic réalise l’audit et prépare les exemples complets pour la démo.

- Decision: 2026-10-08 — gouvernance à deux : les responsabilités de cet epic sont coordonnées par l’agent mandaté, avec l’utilisateur pour les interventions humaines et les accès. Aucune approbation externe organisationnelle n’est requise ; les preuves techniques, terrain et conditions d’activation restent exigées au moment pertinent selon la correction `../change-gouvernance-a-deux/change-gouvernance-a-deux.md`.
