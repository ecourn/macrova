---
id: SPEC-macrova
companions:
  - regles-repas.md
  - protocole-validation.md
  - decisions-lancement.md
  - ../brief-macrova/addendum.md
sources:
  - ../brief-macrova/brief-macrova.md
  - ../forge-macrova/forge-macrova.md
---

# Macrova — repas habituels ajustables

Ce fichier et ses compagnons constituent le contrat produit. L’addendum est adopté pour ses références, les arbitrages antérieurs et les pistes différées ; les décisions explicites de cette spécification précisent ses points ouverts.

## Why

Aider les adultes francophones en France qui suivent déjà leurs macros et pèsent leurs aliments à ajuster puis réutiliser leurs repas habituels. La difficulté, le gain de temps et la valeur d’un abonnement restent à démontrer ; le calcul gratuit sert l’acquisition et la composition personnelle porte l’hypothèse payante.

## Capabilities

- **CAP-1**
  - **intent:** Obtenir gratuitement une cible estimative de calories, protéines, glucides et lipides, puis la modifier sans compte.
  - **success:** Le parcours affiche les hypothèses et limites, permet une modification et recalcule les résultats ; une situation hors périmètre ne reçoit pas d’estimation automatique.
- **CAP-2**
  - **intent:** Essayer une démonstration complète de composition avant de décider de s’abonner.
  - **success:** Un repas de démonstration montre sélection, verrouillage, proposition, écarts et réutilisation avant la proposition payante ; il ne compte pas comme repas personnel.
- **CAP-3**
  - **intent:** Retrouver ses aliments et compléter privément leurs données avec une provenance identifiable.
  - **success:** La recherche inclut Open Food Facts ; source, base de mesure et état connu sont visibles ; toute donnée manquante est distinguée de zéro et bloque la suggestion jusqu’à complétion sourcée.
- **CAP-4**
  - **intent:** Approcher une cible de repas confirmée avec 3 à 6 aliments habituels et des portions contrôlables.
  - **success:** La proposition respecte verrous, bornes et pas, affiche calories, macros et écarts ; une impossibilité explique les contraintes à modifier sans modification silencieuse, selon regles-repas.md.
- **CAP-5**
  - **intent:** Confirmer, enregistrer en favori et reprendre ou copier un repas personnel.
  - **success:** Les aliments, quantités, unités et données nutritionnelles du repas confirmé sont retrouvés ; une copie peut être modifiée sans altérer l’original et n’entre au journal qu’après confirmation.
- **CAP-6**
  - **intent:** Consulter un journal minimal et les totaux de ses repas et de sa journée.
  - **success:** Ajout, modification et retrait d’un repas recalculent les totaux ; le reste journalier reste indicatif tant que la journée n’est pas déclarée complète et ne déclenche aucune compensation.
- **CAP-7**
  - **intent:** Accéder aux fonctions personnelles par un compte et un abonnement mensuel simple.
  - **success:** Une offre unique de test à 5,99 €/mois donne accès à composition personnelle, favoris, copie et journal ; prix et récurrence sont visibles avant paiement et la résiliation est accessible depuis le compte.
- **CAP-8**
  - **intent:** Garder le contrôle de ses données personnelles.
  - **success:** Un utilisateur peut demander export et suppression de son compte et de ses données ; les exceptions de conservation et délais doivent être définis avant ouverture publique.

## Constraints

- Interface en français ; première expérience web adaptée au mobile, retenue comme hypothèse de lancement.
- Open Food Facts demeure obligatoire ; aucun catalogue complémentaire sans décision explicite après l’audit de couverture.
- Aucune nutrition inventée, donnée absente assimilée à zéro, conversion ml/g sans densité sourcée ou assimilation automatique cru/cuit.
- Les contraintes de portions sont strictes ; seule la proximité à la cible peut être imparfaite et doit être explicitée.
- Cible de repas explicitement confirmée ; aucune compensation automatique, promesse de santé ou correction silencieuse.
- Le calculateur vise l’usage adulte général ; méthode et exclusions font l’objet d’une décision produit sourcée et versionnée par l’agent avant son implémentation. Une signature externe n’est pas exigée ; les contrôles numériques et protections restent obligatoires.
- Minimiser les données personnelles ; règles de protection, réutilisation des sources et modalités commerciales à vérifier avant lancement, selon decisions-lancement.md.

## Non-goals

- Application native, reconnaissance photo, IA nutritionnelle générative, montres connectées, micronutriments, planning hebdomadaire, stock et espace coach.
- Offre annuelle, scan de code-barres, variantes, recettes à plusieurs portions, liste de courses, usages en couple et repas modulaires au premier périmètre.
- Diagnostic, prescription nutritionnelle ou garantie de résultat de santé ; preuve de rentabilité déduite du trafic gratuit.

## Success signal

- Sur une bêta de 20 à 30 personnes pendant deux semaines après 15 entretiens : au moins 60 % enregistrent un premier repas personnel, 30 % réutilisent un repas entre J6 et J8 après invitation et cinq paiements de 5,99 € sont encaissés et non remboursés au bilan. Mesurer le temps sur une tâche comparable puis observer le renouvellement à un mois.
- Les seuils sont internes et hypothétiques. La couverture alimentaire et les décisions de lancement doivent être résolues avant ouverture ; une correction ciblée puis absence de réutilisation ou de paiement conduit à abandonner l’offre, selon protocole-validation.md.

## Assumptions

- Le besoin récurrent, le budget limité, le choix web mobile et le prix ne sont pas validés par un usage réel.
- Les règles de portions, le classement des propositions, la conservation des repas et le traitement des remboursements sont des arbitrages autonomes à tester, détaillés dans les compagnons.

## Open Questions

- Méthode estimative v1 retenue pour le développement isolé le 8 octobre 2026 en 2.1 : dossier dans initiative-macrova/epic-calculateur/methode-estimative-v1. Sources, limites, exclusions et vecteurs sont documentés ; validité clinique non démontrée. Les tests applicatifs sont à exécuter lors des stories de construction.
- La couverture des 50 recherches permet-elle les repas usuels, et faut-il un catalogue complémentaire ? Bloque le gel du catalogue.
- Quelles obligations et conditions actuelles encadrent données personnelles, réutilisation Open Food Facts, paiement et résiliation ? Bloque l’ouverture publique ; fournisseur et hébergement non arrêtés.

## Gouvernance à deux — décision du 8 octobre 2026

L’utilisateur porte Macrova et les actions nécessitant sa présence, ses comptes ou des participants réels. L’agent reçoit les arbitrages produit, techniques et documentaires, les applique et enregistre les décisions et preuves sans nouvelle confirmation dans le périmètre délégué. Les fonctions produit, catalogue, enquête, validation, architecture et développement sont des responsabilités du même binôme, pas des intervenants externes à recruter.

Une validation produit sourcée et reproductible par l’agent autorise la construction ; elle ne constitue pas une validation clinique ou une certification juridique. Les preuves d’accès, les consentements et les résultats terrain restent des faits à vérifier au moment de l’action concernée. L’absence de support d’enquête ne bloque pas le développement isolé. Aucun contact externe ou invitation n’est effectué sans instruction explicite.

Décision canonique et calendrier des contrôles : [correction de trajectoire](../initiative-macrova/change-gouvernance-a-deux/change-gouvernance-a-deux.md).
