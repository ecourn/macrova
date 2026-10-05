---
type: initiative
title: Macrova
parent: none
---

# Macrova

## Description

Permettre aux adultes francophones en France qui suivent déjà leurs macros et pèsent leurs aliments d’ajuster et réutiliser leurs repas habituels. Le calcul public sert l’acquisition ; le parcours personnel éprouve l’offre unique de 5,99 €/mois.

## Outcome

Vérifier activation, réutilisation et paiements réels selon le protocole de validation, puis observer renouvellement et coûts sans présumer la rentabilité.

## Requirements

La source numérotée canonique est `_bmad-output/spec-macrova/spec-macrova.md`, CAP-1 à CAP-8, et ses quatre compagnons déclarés. Les critères de réussite de chaque capacité sont conservés intégralement dans cette source.

## Done when

1. CAP-1 à CAP-8 sont disponibles sur le déploiement cible avec leurs critères de réussite et contraintes vérifiés.
2. Absences nutritionnelles, contraintes strictes, confirmations, isolation des comptes et contrôle des droits sont vérifiés de bout en bout.
3. Méthode nutritionnelle, couverture, politiques de données, licences, conditions commerciales et exploitation ont leurs décisions documentées avant ouverture publique.
4. Les observations et mesures du protocole sont réalisées et un bilan explicite justifie la poursuite, une correction ciblée ou l’abandon de l’offre.
5. Export, suppression, restauration et rapprochement paiement disposent de preuves de fonctionnement et de reprise après panne.

## Boundaries

Les epics suivent les capacités produit ; CAP-5 et CAP-6 partagent le module repas/journal. Le socle ouvre la construction ; l’enquête préalable fournit les repas nécessaires à l’audit catalogue ; la validation d’usage en constitue le dernier résultat transversal.

TanStack Start, Convex et Better Auth sont des points d’intégration possédés par le socle, puis étendus par les propriétaires métier. Open Food Facts appartient au catalogue, le fournisseur de paiement à l’abonnement, les mesures publiques au calculateur et à la démonstration, les mesures personnelles aux repas et à l’abonnement. L’epic données personnelles coordonne leur export et suppression. L’epic validation possède recrutement bêta, observations du produit, bilan, vérification des conditions d’ouverture et activation publique. Les Non-goals de la spécification restent hors périmètre.

## References

- spec — _bmad-output/spec-macrova/spec-macrova.md, Capabilities, Constraints et Non-goals
- architecture — _bmad-output/initiative-macrova/architecture-app/architecture-app.md
- ux — _bmad-output/ux-macrova/DESIGN.md
- ux — _bmad-output/ux-macrova/EXPERIENCE.md
- règles — _bmad-output/spec-macrova/regles-repas.md
- lancement — _bmad-output/spec-macrova/decisions-lancement.md
- validation — _bmad-output/spec-macrova/protocole-validation.md
- compagnon — _bmad-output/brief-macrova/addendum.md

## Notes

- Decision: 2026-10-05 — délégation des arbitrages de découpage par l’utilisateur ; suivi local dans Git sans tracker externe.
- Decision: 2026-10-05 — compléter l’initiative, créer les enveloppes et détailler seulement le socle d’ouverture ; les epics futurs attendent leur inception.
- Decision: 2026-10-05 — premier parcours démontrable : socle public puis calculateur après validation de sa méthode ; parcours premium : catalogue, démonstration et moteur, abonnement, composition, repas/journal.
- Decision: 2026-10-05 — contrats partagés et décisions communes ont leur domicile dans architecture-app.md ; ne pas transformer AD-4, AD-7 ou AD-12 en décisions adoptées par le seul découpage.
- Assumption: ordre conservateur pour une réalisation autonome ; les dépendances nomment les livrables réellement nécessaires et seront affinées vers les ids de stories lors des inceptions suivantes.
- Open question: les validations scientifiques, commerciales, juridiques et les observations terrain restent des travaux à réaliser ; le découpage ne fournit pas leur résultat.
- Decision: 2026-10-05 — validation indépendante : séparer les entretiens préalables de la bêta finale et distinguer capacités techniques livrées des résultats observés pour supprimer les cycles fonctionnels.
