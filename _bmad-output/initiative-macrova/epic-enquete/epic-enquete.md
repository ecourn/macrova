---
type: epic
status: in-progress
title: "Entretiens et repas de référence"
parent: initiative-macrova
covers: []
risk: high
---

# Entretiens et repas de référence

## Description

Réaliser les quinze entretiens sur les repas récents de la cible avant l’audit catalogue, sans les confondre avec une validation du produit construit.

## Outcome

Le catalogue reçoit cinquante recherches candidates issues de quinze entretiens réels et la validation de lancement reçoit le protocole bêta versionné, sans présumer couverture, gain de temps ou intérêt payant.

## Requirements

Les ids ENQ-1 à ENQ-6 sont locaux ; `covers: []` est conservé car l'enquête relève des exigences transversales, sans posséder une capacité CAP-1 à CAP-8.

- **ENQ-1 — Cadre préalable.** _bmad-output/spec-macrova/decisions-lancement.md, Données personnelles et Nutrition personnelle : définir avant recrutement les champs nécessaires, l'information des participants, les responsabilités du binôme, les accès, la conservation et le retrait/suppression ; distinguer coordonnées de recrutement, notes pseudonymisées et livrables anonymisés, sans données personnelles dans Git ou sur le site public.
- **ENQ-2 — Entretiens réels.** _bmad-output/spec-macrova/protocole-validation.md, Ordre et mesures : consigner quinze adultes francophones en France suivant déjà leurs macros et pesant leurs aliments, leur canal de recrutement, un repas réel récent, la méthode habituelle observée, sa durée, ses erreurs, les corrections de portions et les difficultés ; distinguer une observation d'une déclaration ou d'un élément non observable, sans personnage fictif ni doublon dans le compte des quinze.
- **ENQ-3 — Corpus pour le catalogue.** _bmad-output/spec-macrova/protocole-validation.md, Couverture et décision : fournir cinquante requêtes candidates traçables vers les repas des entretiens, couvrant aliments bruts, produits français et états cru/cuit ; conserver nom recherché, marque si pertinente, état connu ou inconnu et unité rapportée, sans inventer nutrition, conversion, état ou disponibilité.
- **ENQ-4 — Protocole bêta.** _bmad-output/spec-macrova/protocole-validation.md, Ordre et mesures et Couverture et décision : figer avant recrutement les critères versionnés pour vingt à trente adultes pendant deux semaines, activation ≥ 60 %, réutilisation J6 à J8 ≥ 30 % de tous les invités uniques, cinq personnes distinctes ayant payé 5,99 € encaissés et non remboursés au bilan, arrondi supérieur des effectifs requis, renouvellement un mois après chaque paiement et coûts sans seuil ajouté ; préparer la comparaison avec la méthode habituelle, la collecte des erreurs, corrections et compréhension des écarts, et tracer toute modification sans réécrire rétroactivement les résultats.
- **ENQ-5 — Transmission privée.** _bmad-output/spec-macrova/decisions-lancement.md, Données personnelles ; _bmad-output/spec-macrova/protocole-validation.md, Couverture et décision : rendre les résultats anonymisés accessibles aux responsables produit sur un support privé maîtrisé, transmettre le corpus au catalogue et le protocole à la validation de lancement, vérifier leurs accès et conserver la correspondance avec les preuves seulement dans le support privé autorisé.
- **ENQ-6 — Limites de preuve.** _bmad-output/spec-macrova/spec-macrova.md, Success signal et Assumptions ; _bmad-output/spec-macrova/protocole-validation.md, Couverture et décision : distinguer résultats constatés, déclarations, limites et questions ouvertes ; aucun entretien ne valide le produit construit, la couverture OFF, les seuils de bêta, la préférence concurrentielle ou la rentabilité.

## Done when

1. Les critères et le protocole bêta sont figés avant invitations selon protocole-validation.md ; le protocole, l’information des participants et la minimisation des données de l’enquête sont documentés avant recrutement.
2. Quinze entretiens réels sont consignés avec canaux, méthode habituelle, repas et difficultés observées ; les personnages fictifs sont exclus.
3. Cinquante requêtes candidates traçables sont transmises au catalogue, sans inventer leur disponibilité ni une couverture satisfaisante.
4. Les résultats anonymisés sont accessibles aux responsables produit depuis un support privé maîtrisé ; aucune donnée personnelle d’entretien n’est publiée dans le dépôt ou sur le site public.
5. Le dossier versionné est effectivement transmis aux responsables catalogue et validation de lancement avec accès vérifiés, limites de preuve et actions de conservation/suppression ; aucune livraison applicative ni ouverture publique n'est requise pour cette enquête.

## Boundaries

Enquête préalable humaine et préparation du protocole. Le catalogue réalise l'audit de disponibilité, complétude des quatre valeurs, unités, provenance et capacité à produire une proposition ; la validation de lancement réalise les invitations bêta, la tâche Macrova comparable et son bilan. Aucun accès au produit construit n'est nécessaire pour commencer. Ne pas créer de module enquête, de table Convex, de page de recrutement ou de traqueur tiers ; les mesures applicatives communes gardent leur domicile en AD-11.

Le dépôt peut accueillir guides, schémas vierges et comptes rendus de décisions sans données personnelles ; coordonnées, notes, repas individuels, liens de correspondance et preuves terrain restent hors du dépôt, même pseudonymisés. Les droits et durées propres à l'enquête ne sont pas réputés livrés par l'epic données personnelles du produit.

## References

- parent — _bmad-output/initiative-macrova/initiative-macrova.md, Requirements
- protocole — _bmad-output/spec-macrova/protocole-validation.md
- protection — _bmad-output/spec-macrova/decisions-lancement.md
- spec — _bmad-output/spec-macrova/spec-macrova.md, Why, Constraints, Success signal et Assumptions
- compagnon — _bmad-output/brief-macrova/addendum.md, Sources et priorité des décisions et Protocole d'apprentissage
- architecture — _bmad-output/initiative-macrova/architecture-app/architecture-app.md, AD-3, AD-8 et AD-11
- ux — _bmad-output/ux-macrova/EXPERIENCE.md, Key Flows et Décisions amont à instruire (Validation d'usage)
- destinataire — _bmad-output/initiative-macrova/epic-catalogue/epic-catalogue.md, Done when et Notes
- destinataire — _bmad-output/initiative-macrova/epic-validation-lancement/epic-validation-lancement.md, Done when et Notes

## Notes

- Decision: 2026-10-05 — séparer enquête préalable et validation finale pour ne pas attendre le catalogue avant de recueillir les repas nécessaires à son audit.
- Unknown: participants, canaux et support privé restent à choisir ; ce travail humain ne peut être remplacé par des données fictives.
- Decision: 2026-10-07 — inception autonome demandée par l'utilisateur ; initiative-macrova est explicitement désignée, même sans active_initiative configurée ; conserver le store local et ne pas modifier la configuration globale.
- Decision: 2026-10-07 — conserver les exigences dans cet epic plutôt que créer une spécification supplémentaire ; aucune capacité produit n'est transférée et aucun prérequis technique n'est ajouté à l'enquête.
- Assumption: un responsable produit conduit l'enquête et administre un support privé existant avec accès nominatifs ; les canaux proposés sont son réseau et des communautés francophones pertinentes, sous réserve de leurs règles ; leur disponibilité et les autorisations réelles doivent être vérifiées au début de 10.2 avant collecte, jamais présumées par l'inception.
- Decision: 2026-10-07 — première démonstration : parcourir le kit de bout en bout, depuis l'information et une fiche vierge jusqu'au format de cinquante recherches et à la grille bêta, puis prévoir la vérification effective du support privé au début de 10.2 ; toute donnée d'exercice est étiquetée simulation et exclue des quinze entretiens et des cinquante candidates.
- Decision: 2026-10-07 — après le kit, un entretien pilote réel éprouve recrutement et guide ; il compte parmi les quinze seulement s'il satisfait ENQ-2 ; deux lots de sept complètent l'enquête, les remplacements ne gonflent pas le dénominateur ; des mises à jour du guide sont versionnées sans changer silencieusement les critères figés.
- Decision: 2026-10-07 — les lots et le corpus sont séquentiels car ils partagent registre, guide et support privé ; aucune voie parallèle n'est annoncée ; si quinze entretiens ne fournissent pas cinquante recherches traçables, demander des précisions aux mêmes participants, consigner cette collecte complémentaire et ne jamais compléter avec des repas fictifs.
- Decision: 2026-10-07 — 10.5 fournit le corpus au catalogue ; 10.7 remet le dossier final et le protocole à la validation de lancement ; leurs futures stories épingleront ces ids, sans attendre une implémentation enquête.
- Decision: 2026-10-07 — intégrer un nettoyage documentaire en 10.6 puis une recette de transmission en 10.7 ; les guides et la protection sont vérifiés dans chaque story, sans suite E2E applicative dédiée ; estimation désactivée.
- Decision: 2026-10-07 — les entries n'exigent pas de raffinage préalable ; plan_checkpoint est désactivé, done_checkpoint marque les preuves et interventions humaines à respecter lors d'un futur build-auto ; la délégation d'inception ne vaut ni consentement des participants, ni accord du responsable, ni autorisation d'envoyer des invitations.
- Decision: 2026-10-07 — appliquer les définitions communes AD-11 au protocole de 10.1 : premier repas personnel confirmé enregistré en favori ou journal, reprise/copie avec filiation puis enregistrement confirmé, commande aux deux destinations comptée une seule fois ; ni démonstration ni connexion ne comptent ; J6 à J8 est calculé depuis l'invitation individuelle ; noter séparément remboursements ultérieurs, renouvellements et coûts.
- Decision: 2026-10-07 — adopter la suggestion de validation indépendante : en 10.1, matérialiser dans le kit la correspondance entre chaque champ de mesure, la définition AD-11 et sa règle de collecte, sans créer ici l'instrumentation bêta.
- Open question: responsabilités et règles documentaires adoptées par le binôme le 8 octobre 2026 ; support effectif, contact, canaux et personnes à recruter restent à vérifier au début de 10.2 avant collecte, sans preuve terrain anticipée.
- Decision: 2026-10-07 — l'inception enregistre les sept stories planned ; elle ne réalise pas les entretiens, ne lance pas de build et ne publie pas par commit.

- Decision: 2026-10-08 — les responsables produit/enquête/catalogue/validation désignent les fonctions du binôme. L’utilisateur conduit les entretiens et administre le support ; l’agent prépare les documents, arbitre et contrôle les preuves qui lui sont accessibles. Aucune validation d’un tiers n’est exigée.
- Decision: 2026-10-08 — 10.1 clôt le kit et le protocole documentaire adopté par l’agent ; hitl=false, done_checkpoint=false. Le choix effectif du support, ses essais d’accès/révocation/suppression, l’information finale avec contact, les canaux autorisés et l’accord du participant sont des tâches de 10.2 avant toute collecte. Les remises effectives restent en 10.5/10.7. Les anciennes conditions de clôture et questions demandant ces preuves en 10.1 sont remplacées.
- Decision: 2026-10-08 — les checkpoints des stories terrain contrôlent une preuve réelle ou une intervention inaccessible à l’agent ; ils ne demandent aucun arbitrage supplémentaire déjà délégué. Aucun consentement, entretien ou résultat n’est inventé. Le support d’enquête ne bloque aucune story du calculateur.
