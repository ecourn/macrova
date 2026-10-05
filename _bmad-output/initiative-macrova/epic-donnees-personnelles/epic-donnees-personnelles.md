---
type: epic
title: "Export et suppression vérifiables"
parent: initiative-macrova
covers: ["CAP-8"]
risk: high
---

# Export et suppression vérifiables

## Description

Export et suppression restent accessibles au propriétaire sans abonnement actif. Les règles applicables sont AD-6, AD-9, AD-10, AD-11.

## Outcome

Les reprises après panne et événements tardifs ne recréent aucune donnée après fermeture ; délais et exceptions affichés suivent la politique approuvée.

## Requirements

- CAP-8 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.

## Done when

1. Export et suppression restent accessibles au propriétaire sans abonnement actif.
2. Un export paginé versionné fournit manifeste et accès privé temporaire révocable.
3. Une suppression confirmée ferme les écritures, traite abonnement et données, révoque les sessions et indique sa progression réelle.
4. Les reprises après panne et événements tardifs ne recréent aucune donnée après fermeture ; délais et exceptions affichés suivent la politique approuvée.
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

- Unknown: Périmètre, conservation légale, délais, sauvegardes et informations minimales de fermeture doivent être approuvés avant ouverture ; coordination de tous les propriétaires nécessaire.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
