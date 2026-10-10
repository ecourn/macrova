---
type: initiative
title: Macrova
parent: none
---

# Macrova

## Description

Permettre aux adultes francophones en France qui suivent déjà leurs macros et pèsent leurs aliments d’ajuster et réutiliser leurs repas habituels. Le calcul public sert l’acquisition ; le parcours personnel éprouve l’offre unique de 5,99 €/mois.

## Outcome

Livrer un MVP CAP-1 à CAP-8 fonctionnel, robuste et utilisable, avec preuves techniques reproductibles et conditions d’ouverture vérifiées. Les éventuels retours après mise à disposition servent l’apprentissage sans conditionner la livraison.

## Requirements

La source numérotée canonique est `_bmad-output/spec-macrova/spec-macrova.md`, CAP-1 à CAP-8, et ses quatre compagnons déclarés. Les critères de réussite de chaque capacité sont conservés intégralement dans cette source.

## Done when

1. CAP-1 à CAP-8 sont disponibles sur le déploiement cible avec leurs critères de réussite et contraintes vérifiés.
2. Absences nutritionnelles, contraintes strictes, confirmations, isolation des comptes et contrôle des droits sont vérifiés de bout en bout.
3. Méthode nutritionnelle, couverture, politiques de données, licences, conditions commerciales et exploitation ont leurs décisions documentées avant ouverture publique.
4. La matrice de vérification objective du protocole dispose de preuves datées ; les échecs bloquants sont corrigés et les limites/reports explicités, sans prétendre à une validation du besoin ou du prix.
5. Export, suppression, restauration et rapprochement paiement disposent de preuves de fonctionnement et de reprise après panne.

## Boundaries

Les epics suivent les capacités produit ; CAP-5 et CAP-6 partagent le module repas/journal. Le socle ouvre la construction ; le catalogue produit son corpus technique reproductible ; la recette et l’ouverture constituent le dernier résultat transversal du MVP.

TanStack Start, Convex et Better Auth sont des points d’intégration possédés par le socle, puis étendus par les propriétaires métier. Open Food Facts appartient au catalogue, le fournisseur de paiement à l’abonnement, les mesures publiques au calculateur et à la démonstration, les mesures personnelles aux repas et à l’abonnement. L’epic données personnelles coordonne leur export et suppression. L’epic validation possède la recette objective, la vérification des conditions d’ouverture et l’activation publique. Les éventuels retours post-MVP ne sont pas une condition de clôture. Les Non-goals de la spécification restent hors périmètre.

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

## Gouvernance courante — 8 octobre 2026

Decision: l’utilisateur délègue les arbitrages et leur application à l’agent sans confirmation supplémentaire. Les décisions du 7 octobre exigeant un responsable externe sont remplacées par la correction de trajectoire `change-gouvernance-a-deux/change-gouvernance-a-deux.md`. L’utilisateur porte les actions humaines et les comptes ; l’agent porte produit, architecture, développement et coordination des modules. Les observations réelles restent nécessaires.

2.1 accepte le dossier de méthode par décision produit sourcée ; 10.1 accepte le kit et le gel documentaire. Les contrôles effectifs du support privé sont déplacés au début de 10.2 avant collecte, puis vérifiés lors des remises 10.5/10.7. La prochaine story de développement est 2.2, sans dépendance à l’enquête. Les deux epics restent ouverts jusqu’à leurs livrables finaux ; la clôture de leurs premières stories ne signifie pas clôture des epics.

## Stratégie courante — 10 octobre 2026

Decision: les obligations terrain et prochaines stories mentionnées dans les notes historiques sont remplacées par [la correction MVP sans enquête](change-mvp-sans-enquete/change-mvp-sans-enquete.md). Epic 10 dropped ; 10.1 done conservée, 10.2 dropped, 10.3–10.7 retirées. Socle et calculateur déjà done ; prochain ticket 3.1. Besoin et valeur commerciale restent inconnus, sans gate MVP.
