---
type: epic
title: "Aliments sourcés et corrections privées"
parent: initiative-macrova
covers: ["CAP-3"]
risk: high
status: in-progress
---

# Aliments sourcés et corrections privées

## Description

Livrer recherche explicite OFF, détail sourcé, complétion privée et sélection de snapshots calculables. Appliquer AD-1, AD-3, AD-6, AD-8, AD-9, AD-10 et AD-12.

## Outcome

Une personne retrouve ses aliments OFF, distingue les limites de la source et complète ses données privément avec une référence identifiable ; les consommateurs reçoivent un FoodSnapshot v1 vérifié. L’audit livré instruit les protections et exemples sans prétendre représenter les repas de la cible.

## Requirements

- CAP-3 : contrat de la capacité dans _bmad-output/spec-macrova/spec-macrova.md, Capabilities ; cet epic en possède la livraison complète.
- **CAT-1 → CAP-3** : constituer cinquante requêtes distinctes dans un manifeste versionné, avec justification/source, catégories, marque, états et unités ; couvrir aliments bruts, produits français, cru/cuit/inconnu, 100 g/100 ml, incomplets et absence de résultat selon protocole-validation.md ; aucune filiation terrain ou représentativité inventée.
- **CAT-2 → CAP-3** : exécuter l’audit OFF réel, consigner endpoint/paramètres/version/date/statut/identifiants et captures utiles sourcées avec empreintes et attribution ; replay déterministe des captures, disponibilité/complétude/base/état/provenance classées par cas, échecs et limites visibles. Cas synthétiques négatifs séparés, aucune nutrition inventée.
- **CAT-3 → CAP-3** : vérifier absence distincte de zéro, bases ambiguës, densité requise, états non assimilés, précision/plafonds AD-12 et scénarios d’indisponibilité ; préparer les références sourcées de repas de 3–6 aliments pour la démo. Décision datée avant gel : traiter les blocages des cas MVP, exposer les limites, aucun catalogue complémentaire implicite. La faisabilité moteur reste à vérifier par epic 4/6.

- **CAT-4 → CAP-3** : recherche texte sur soumission explicite uniquement, adaptateur côté Convex avec endpoints/version configurés et User-Agent identifié, aucune donnée de compte/profil transmise ; résultats, liste vide, panne, suspension et réponse invalide distingués ; réponse tardive sans remplacement d’une recherche plus récente.
- **CAT-5 → CAP-3** : détail produit relu par identifiant OFF, normalisation conservatrice vers FoodSnapshot v1 partagé avec champs sources, référence produit, nom français disponible sans traduction trompeuse, marque, dates de consultation/index distinctes, base 100 g/100 ml et état raw/cooked/unknown ; valeurs null ou décimales AD-12, préparations non prises en charge et obsolescence explicites, aucune valeur computed/estimate ni kcal inférée ; produits obsolètes écartés et recontrôlés avant réutilisation.
- **CAT-6 → CAP-3** : cache public séparé des données privées, clé requête normalisée/langue/filtres/version adaptateur, horodatage/ancienneté visibles, déduplication concurrente et budgets durables centralisés recherche/produit ; suspension globale sur 429/503, respect de Retry-After sans retry automatique, aucun cache ancien présenté comme frais ; attribution OFF/ODbL/DbCL et lien produit, images différées.
- **CAT-7 → CAP-3** : corrections et aliments saisis privément depuis une source identifiable même sans résultat OFF, sans catalogue partagé supplémentaire ; révisions par propriétaire avec source/date/base/état et densité sourcée si conversion, absences conservées et blocages ciblés ; aucune publication OFF ni fuite cache/autre compte ; identité, propriété, droit actif et ouverture contrôlés dans chaque opération interactive de correction ; toute transaction interne créatrice/modificatrice vérifie la fermeture ; conflits de révision/retries sans écrasement ni duplication, inventaire et opérations internes paginées pour epic 8 avec propriétaire dérivé du travail durable, sans session ni droit actif requis et nettoyage autorisé après fermeture selon AD-6/AD-9.
- **CAT-8 → CAP-3** : parcours Aliments/Données privées en français avec recherche, détail, complétion, accusé d’enregistrement puis sélection explicite du snapshot courant ; absence ou base/conversion ambiguë bloque la remise calculable et indique la donnée à confirmer, état inconnu affiché sans assimilation ; retour/erreurs conservent les saisies, actualisation jamais automatique d’un snapshot sélectionné ou historique ; remise testable au brouillon CAP-4 sans moteur ni sauvegarde repas.
- **CAT-9 → CAP-3** : interface mobile/clavier avec shadcn existant, états vide/chargement/hors ligne/erreur/accès, annonces et reprise explicite ; recette cible isolée avec identité réelle, deux comptes, sessions absente/expirée/révoquée et droits actifs/inactifs ; backend publié avant frontend, preuves versionnées et retour arrière ; ouverture publique soumise aux contrôles licences/exploitation epic 9.

## Done when

1. La recherche explicite Open Food Facts distingue absence de résultats, source indisponible et cache ancien.
2. Source, date, base et état sont visibles ; absence et zéro restent distincts et les conversions ambiguës sont bloquées.
3. Les corrections sourcées sont privées et isolées entre comptes, avec droit actif contrôlé au backend.
4. Un audit traçable de 50 recherches sur un corpus technique versionné instruit la couverture des cas retenus et les exemples de démonstration, sans prétendre représenter les repas de la cible.
5. Le parcours intégré est vérifié sur le déploiement cible, avec erreurs et accès interdits ; la production publique reste conditionnée aux validations de lancement.

## Boundaries

Le catalogue possède adaptateur OFF, cache public, corrections privées, leurs écrans et la remise de snapshots au brouillon. Epic 4 possède démonstration/moteur, epic 6 la composition complète, epic 7 les repas historiques, epic 8 les travaux export/suppression, epic 9 l’activation publique. Contrats communs au socle et dans l’architecture, sans redéfinition locale. Aucun catalogue complémentaire, image, scan, moteur, paiement ou enquête. Droit de test serveur isolé du socle pour vérifier les corrections avant epic 5, jamais un contournement public.

## References

- spec — _bmad-output/spec-macrova/spec-macrova.md, Capabilities, Constraints et Non-goals
- architecture — _bmad-output/initiative-macrova/architecture-app/architecture-app.md
- ux — _bmad-output/ux-macrova/DESIGN.md
- ux — _bmad-output/ux-macrova/EXPERIENCE.md
- règles — _bmad-output/spec-macrova/regles-repas.md
- lancement — _bmad-output/spec-macrova/decisions-lancement.md
- validation — _bmad-output/spec-macrova/protocole-validation.md
- audit — _bmad-output/initiative-macrova/epic-catalogue/audit-off-v1/decision.md, Décision et limites et Portions techniques
- sources — _bmad-output/initiative-macrova/epic-catalogue/audit-off-v1/sources.md, Sources techniques et Licences et attribution
- preuves — _bmad-output/initiative-macrova/epic-catalogue/audit-off-v1/verification.md, Vérification finale après revue quick

## Notes

- Unknown: disponibilité future OFF et conditions de diffusion publique à recontrôler ; audit livré comme photographie technique, sans couverture générale démontrée. Aucun catalogue supplémentaire. Droit de test serveur isolé pour les corrections avant paiement.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
- Decision: 2026-10-05 — le socle fournit le contrat de droits et le dispositif de test serveur isolé ; cet epic constitue son corpus reproductible, réalise l’audit et prépare les exemples sourcés pour la démo, sans dépendance à l’enquête (décision du 10 octobre 2026).

- Decision: 2026-10-08 — gouvernance à deux : les responsabilités de cet epic sont coordonnées par l’agent mandaté, avec l’utilisateur pour les interventions humaines et les accès. Aucune approbation externe organisationnelle n’est requise ; les preuves techniques et conditions d’activation restent exigées ; les retours terrain deviennent facultatifs après livraison par décision du 10 octobre 2026, qui remplace sur ce point la correction `../change-gouvernance-a-deux/change-gouvernance-a-deux.md`.

- Decision: 2026-10-10 — remplacement du corpus terrain 10.5 par CAT-1/CAT-2/CAT-3 ; première story 3.1 prête après socle. Ce découpage est limité au premier travail désormais débloqué, pas une inception complète de CAP-3 ; les stories de recherche intégrée, corrections privées, recette et nettoyage restent à détailler après audit. La clôture de 3.1 ne clôt pas cet epic.

- Decision: 2026-10-10 — story 3.1 done à la demande explicite de l’utilisateur après livraison/revue et preuves finales (50 recherches, 461 tests, replays déterministes) ; epic in-progress. Inception complète autonome : dix stories au total, 3.1 conservée ; ces décisions remplacent le découpage partiel historique.
- Decision: 2026-10-10 — 3.2 ouvre le parcours applicatif démontrable recherche → action Convex → OFF → liste/détail sourcé, sur cible isolée avec droit de test. Search-a-licious est la première méthode texte à vérifier/configurer ; v3.6 pour lecture produit en 3.3 ; v2/search n’est pas une recherche texte. Pas de bascule automatique vers legacy. Le plan consigne le choix et les preuves, sans changer les contrats communs.
- Assumption: 2026-10-10 — fraîcheur du cache 24 heures au plus, conservation publique technique maximale 7 jours ; valeurs configurables à éprouver en 3.4 et revalider avant ouverture. Cache ancien signalé, rafraîchissement explicite, éviction après 7 jours ; date d’index séparée, un TTL ne prouve aucune validité nutritionnelle.
- Decision: 2026-10-10 — budget de développement plafonné à 8 recherches/12 lectures produit par minute par déploiement, partagé entre instances et réduit si les conditions recontrôlées l’imposent ; réservation transactionnelle et déduplication dès 3.2, extension produit en 3.3, cache/durcissement en 3.4. Suspension avec Retry-After valide, sinon au moins 60 secondes ; reprise explicite uniquement.
- Decision: 2026-10-10 — une seule lane : 3.2 à 3.8 séquencées pour éviter collisions Convex/schéma/parcours ; 3.9 nettoie après toutes, 3.10 livre et vérifie la cible. Tests inclus dans chaque slice, aucun travail fonctionnel reporté au nettoyage. Checkpoints désactivés pour les arbitrages délégués ; interventions humaines éventuelles dans 3.10 hitl.
- Decision: 2026-10-10 — 3.5 possède corrections et saisie privée sourcée sans résultat OFF ; aucune image d’étiquette conservée au premier périmètre. 3.7 fournit la remise en mémoire testable sans construire CAP-4. Les consommateurs confirment toute actualisation de snapshot.
- Decision: 2026-10-10 — dépendances à épingler lors des futures inceptions : epic 4 vers 3.1 (vecteurs techniques, plausibilité de démo/moteur à vérifier chez lui), epic 6 vers 3.7 (sélection/corrections), epic 8 vers 3.5 (modèle privé et opérations export/nettoyage), epic 9 vers 3.1 et 3.10 (audit/recette). Aucune inception anticipée des futurs epics.
- Assumption: 2026-10-10 — comptes/backend isolés du socle réutilisables ; tout accès humain ou secret nécessaire à la livraison appartient à 3.10 sans paiement public ni participants à recruter.
- Open question: conditions OFF et diffusion à l’ouverture effective à recontrôler en epic 9 ; construction/recette isolées permises avec notices de l’audit, aucune conformité publique présumée.

- Decision: 2026-10-10 — validation indépendante : les opérations interactives de correction exigent un droit actif ; export/suppression et travaux internes suivent les exceptions AD-6/AD-9 et peuvent terminer après révocation/fermeture. 3.10 porte explicitement le bilan des cas MVP et la décision datée de gel ou maintien ouvert, distincte de l’ouverture publique.

- Decision: 2026-10-10 — conserver 3.2 comme parcours traversant : réutilisation explicite du contrat/gardes socle et parsing/normalisation audit, déduplication minimale des appels en vol uniquement ; cache et reprise générale des réservations appartiennent à 3.4. 3.7 vérifie explicitement le refus d’un produit devenu obsolète à la relecture sans altérer la sélection antérieure.
