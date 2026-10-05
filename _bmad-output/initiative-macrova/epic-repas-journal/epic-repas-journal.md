---
type: epic
title: "Repas réutilisables et journal minimal"
parent: initiative-macrova
covers: ["CAP-5", "CAP-6"]
risk: high
---

# Repas réutilisables et journal minimal

## Description

La confirmation serveur revalide le repas et enregistre favori, journal ou les deux atomiquement et sans doublon. Les règles applicables sont AD-3, AD-4, AD-5, AD-6, AD-11, AD-12.

## Outcome

Les événements premier repas et réutilisation sont émis une seule fois après enregistrement effectif.

## Requirements

- CAP-5 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.
- CAP-6 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.

## Done when

1. La confirmation serveur revalide le repas et enregistre favori, journal ou les deux atomiquement et sans doublon.
2. Reprendre ou copier crée une instance indépendante ; sources et nutrition historiques ne changent pas silencieusement.
3. Ajout, modification et retrait recalculent les totaux et remettent la complétude à confirmer.
4. La cible journalière est un instantané explicite ; sans cible aucun reste, avec cible un reste neutre même négatif.
5. Les événements premier repas et réutilisation sont émis une seule fois après enregistrement effectif.
6. Le parcours intégré est vérifié sur le déploiement cible, avec erreurs et accès interdits ; la production publique reste conditionnée aux validations de lancement.

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

- Unknown: CAP-5 et CAP-6 sont couplées sous le propriétaire repas/journal ; révisions, operationId et jour local suivent AD-5.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
