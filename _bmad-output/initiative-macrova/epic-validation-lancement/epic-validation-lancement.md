---
type: epic
title: "Recette du MVP et ouverture maîtrisée"
parent: initiative-macrova
covers: []
risk: high
---

# Recette du MVP et ouverture maîtrisée

## Description

Les conditions de données, licences, paiement et exploitation sont approuvées avant toute ouverture publique. Les règles applicables sont AD-8, AD-9, AD-10, AD-11.

## Outcome

Un MVP utilisable est livré après recette objective et vérification des conditions d’ouverture ; les retours réels sont facultatifs après mise à disposition, sans affirmation de validation du besoin ou du prix.

## Requirements

- Exigences transversales — _bmad-output/initiative-macrova/architecture-app/architecture-app.md, AD-8, AD-9, AD-10, AD-11 ; protocole-validation.md pour la matrice de vérification objective et les retours post-MVP facultatifs.

## Done when

1. Les conditions de données, licences, paiement et exploitation sont instruites et documentées avant toute ouverture publique, sans conformité présumée.
2. CAP-1 à CAP-8 sont vérifiées sur la cible avec preuves datées des tests automatisés, cas de référence, jeux reproductibles et recette intégrée ; les défaillances bloquantes sont corrigées.
3. L’audit de cinquante recherches techniques, la provenance des exemples, les contraintes strictes et les accès interdits ont leurs preuves ; aucun résultat d’entretien ou paiement d’un participant n’est exigé.
4. Les reports techniques sont traités selon leur échéance, dont R2 avant ouverture et R3 avant consommation de cibles externes ; R4 demeure un contrôle réel d’accessibilité selon la portée revendiquée, sans recrutement obligatoire.
5. Exploitation, surveillance, coûts, reprise/rollback, rapprochement paiement, export et suppression sont vérifiés ; décision d’ouverture et limites sont consignées. L’absence de retours ne bloque ni ouverture ni clôture MVP.

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

- Unknown: Besoin, temps gagné, compréhension réelle, plausibilité personnelle, prix et rentabilité restent non validés. Les tests et scénarios fictifs ne remplacent pas les observations réelles ; celles-ci sont facultatives après livraison.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
- Decision: 2026-10-05 — dérouler cet epic en phases : vérifier les conditions et autoriser l’ouverture contrôlée avant recrutement bêta et paiements réels, puis collecter les usages, dresser le bilan à deux semaines et observer le renouvellement à un mois ; le bilan n’est pas une condition préalable d’ouverture.
- Decision: 2026-10-05 — les prérequis des epics techniques sont leurs capacités utilisables de mesure et de paiement ; les résultats observés sont produits ici, jamais attendus en amont.

- Decision: 2026-10-08 — gouvernance à deux : les responsabilités de cet epic sont coordonnées par l’agent mandaté, avec l’utilisateur pour les interventions humaines et les accès. Aucune approbation externe organisationnelle n’est requise ; les preuves techniques et conditions d’activation restent exigées ; les retours terrain deviennent facultatifs après livraison par décision du 10 octobre 2026, qui remplace sur ce point la correction `../change-gouvernance-a-deux/change-gouvernance-a-deux.md`.

- Decision: 2026-10-10 — obligations de bêta/recrutement/bilan remplacées par recette et ouverture MVP. Les anciennes notes du 5/8 octobre décrivent l’ancien phasage ; aucun dossier 10.7 requis. Si des retours sont décidés après livraison, définir protection et critères avant collecte, sans rouvrir la clôture MVP.
