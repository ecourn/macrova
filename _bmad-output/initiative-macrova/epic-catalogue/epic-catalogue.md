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

Un audit traçable de 50 recherches sur un corpus technique versionné instruit la couverture des cas retenus et les exemples de démonstration, sans prétendre représenter les repas de la cible.

## Requirements

- CAP-3 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.
- **CAT-1 → CAP-3** : constituer cinquante requêtes distinctes dans un manifeste versionné, avec justification/source, catégories, marque, états et unités ; couvrir aliments bruts, produits français, cru/cuit/inconnu, 100 g/100 ml, incomplets et absence de résultat selon protocole-validation.md ; aucune filiation terrain ou représentativité inventée.
- **CAT-2 → CAP-3** : exécuter l’audit OFF réel, consigner endpoint/paramètres/version/date/statut/identifiants et captures utiles sourcées avec empreintes et attribution ; replay déterministe des captures, disponibilité/complétude/base/état/provenance classées par cas, échecs et limites visibles. Cas synthétiques négatifs séparés, aucune nutrition inventée.
- **CAT-3 → CAP-3** : vérifier absence distincte de zéro, bases ambiguës, densité requise, états non assimilés, précision/plafonds AD-12 et scénarios d’indisponibilité ; préparer les références sourcées de repas de 3–6 aliments pour la démo. Décision datée avant gel : traiter les blocages des cas MVP, exposer les limites, aucun catalogue complémentaire implicite. La faisabilité moteur reste à vérifier par epic 4/6.

## Done when

1. La recherche explicite Open Food Facts distingue absence de résultats, source indisponible et cache ancien.
2. Source, date, base et état sont visibles ; absence et zéro restent distincts et les conversions ambiguës sont bloquées.
3. Les corrections sourcées sont privées et isolées entre comptes, avec droit actif contrôlé au backend.
4. Un audit traçable de 50 recherches sur un corpus technique versionné instruit la couverture des cas retenus et les exemples de démonstration, sans prétendre représenter les repas de la cible.
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
- Decision: 2026-10-05 — le socle fournit le contrat de droits et le dispositif de test serveur isolé ; cet epic constitue son corpus reproductible, réalise l’audit et prépare les exemples sourcés pour la démo, sans dépendance à l’enquête (décision du 10 octobre 2026).

- Decision: 2026-10-08 — gouvernance à deux : les responsabilités de cet epic sont coordonnées par l’agent mandaté, avec l’utilisateur pour les interventions humaines et les accès. Aucune approbation externe organisationnelle n’est requise ; les preuves techniques et conditions d’activation restent exigées ; les retours terrain deviennent facultatifs après livraison par décision du 10 octobre 2026, qui remplace sur ce point la correction `../change-gouvernance-a-deux/change-gouvernance-a-deux.md`.

- Decision: 2026-10-10 — remplacement du corpus terrain 10.5 par CAT-1/CAT-2/CAT-3 ; première story 3.1 prête après socle. Ce découpage est limité au premier travail désormais débloqué, pas une inception complète de CAP-3 ; les stories de recherche intégrée, corrections privées, recette et nettoyage restent à détailler après audit. La clôture de 3.1 ne clôt pas cet epic.
