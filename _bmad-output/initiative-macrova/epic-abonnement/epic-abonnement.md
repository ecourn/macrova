---
type: epic
title: "Compte et abonnement mensuel"
parent: initiative-macrova
covers: ["CAP-7"]
risk: high
---

# Compte et abonnement mensuel

## Description

Le compte gère connexion, session expirée ou révoquée, vérification e-mail et récupération avant ouverture publique. Les règles applicables sont AD-6, AD-7, AD-9, AD-10, AD-11.

## Outcome

La résiliation et son effet approuvé sont accessibles sans droit actif ; paiements encaissés et remboursements sont distingués.

## Requirements

- CAP-7 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.

## Done when

1. Le compte gère connexion, session expirée ou révoquée, vérification e-mail et récupération avant ouverture publique.
2. L’offre unique affiche 5,99 €/mois et les conditions approuvées avant paiement.
3. Seule une confirmation fournisseur rapprochée accorde un droit ; doublons, désordre et réconciliation sont traités.
4. La résiliation et son effet approuvé sont accessibles sans droit actif ; paiements encaissés et remboursements sont distingués.
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

- Unknown: Stripe reste proposé ; fournisseur, statuts vers droits, grâce, résiliation, remboursement et envoi e-mail nécessitent une décision explicite avant paiement public.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.

- Decision: 2026-10-08 — gouvernance à deux : les responsabilités de cet epic sont coordonnées par l’agent mandaté, avec l’utilisateur pour les interventions humaines et les accès. Aucune approbation externe organisationnelle n’est requise ; les preuves techniques et conditions d’activation restent exigées ; les retours terrain deviennent facultatifs après livraison par décision du 10 octobre 2026, qui remplace sur ce point la correction `../change-gouvernance-a-deux/change-gouvernance-a-deux.md`.
