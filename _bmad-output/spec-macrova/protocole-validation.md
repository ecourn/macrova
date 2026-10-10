# Protocole de validation

## Livraison et preuves techniques — 10 octobre 2026

Construire le MVP CAP-1 à CAP-8 puis le mettre à disposition après recette et décisions d’ouverture. Aucun entretien pilote, enquête de quinze personnes, recrutement ou bêta imposée. La préparation historique 10.1 ne constitue ni une validation des besoins ni un prérequis de livraison. La présente version remplace les obligations antérieures selon la [décision produit](../initiative-macrova/change-mvp-sans-enquete/change-mvp-sans-enquete.md).

| Domaine | Vérification objective obligatoire | Portée de la preuve |
|---|---|---|
| Calculateur | Vecteurs exacts du dossier v1, frontières, exclusions, recalcul, invalidation, panne réseau et confidentialité ; tests du domaine et rendu/parcours | Conformité à la méthode adoptée, aucune validité clinique démontrée |
| Catalogue | Cinquante requêtes versionnées, résultats sourcés/horodatés, replay déterministe, disponibilité, quatre valeurs, unités, état et provenance ; absence ≠ zéro, base ambiguë et densité absente bloquées | Couverture des cas retenus uniquement |
| Moteur / portions | Cas documentés de 3–6 aliments, contraintes valides/invalides, pas, bornes, verrous, cible atteinte/non atteinte, impossibilité et interruption ; totaux exacts, départage stable et revalidation serveur | Respect des contraintes choisies, pas plausibilité réelle des besoins |
| Repas / journal | Confirmation unique, copie indépendante, snapshots historiques, totaux, complétude et filiation ; erreurs et retries | Cohérence et absence de doublons |
| Accès / paiement / données | Refus anonyme/autre compte/session expirée ou révoquée, droits backend, paiement signé et rapprochement, export/suppression/reprise/fermeture | Fonctionnement technique, pas conformité présumée |
| Interface / exploitation | Recette intégrée mobile/clavier, reflow/zoom, erreurs/reprise, contrôles lecteur d’écran/appareil selon limites déclarées, sauvegarde/restauration, surveillance et rollback | Usabilité technique et preuves réellement observées, pas validation des besoins |

Chaque preuve indique version/révision, commande ou procédure, jeu d’entrée, attendu, observé, date et limites. Conserver les échecs et réexécuter après correction. Les fixtures peuvent simuler une réponse réseau, jamais un retour utilisateur. Ne pas neutraliser l’authentification dans une recette prétendant vérifier l’identité réelle. Les rapports et reports techniques existants conservent leurs échéances.

## Couverture et décision — corpus technique reproductible

Epic 3 possède la constitution et l’audit de **cinquante requêtes distinctes**, sans dépendance à 10.5. Documenter le choix de chaque cas : aliment brut, produit commercialisé en France ou exemple sourcé pertinent ; inclure états cru/cuit/inconnu, bases 100 g/100 ml, cas incomplets et absence de résultat. Ne pas revendiquer de représentativité de la cible ni de filiation à un repas réel observé.

Le manifeste versionné contient id technique stable, requête exacte, catégorie, marque pertinente, état recherché, base/unité attendue ou inconnue, justification/source du cas et résultat attendu documenté sans inventer sa disponibilité. Les catégories peuvent se recouper ; les échecs de réseau sont testés séparément, sans gonfler le compte des cinquante recherches. Séparer les cas négatifs synthétiques, explicitement étiquetés, des valeurs alimentaires sourcées.

Pour chaque interrogation OFF réelle, enregistrer endpoint/paramètres et version adaptateur, date, statut, identifiants des produits retournés, extrait des champs utiles et empreinte du contenu conservé selon les licences. Vérifier disponibilité, complétude P/G/L/kcal, base, état et provenance. Aucune valeur absente remplacée par zéro ; aucune nutrition inventée ni conversion/assimilation implicite. Un replay hors réseau relit les captures et produit les mêmes classifications ; le contrôle courant sur OFF, avec son horodatage, est distinct de ce replay et documente les évolutions.

Documenter la faisabilité des exemples complets de 3–6 aliments avec quantités et contraintes de référence sourcées/confirmées, sans déclarer la faisabilité du moteur tant que celui-ci n’est pas construit. Les vérifications moteur communes seront exécutées par l’epic démonstration puis composition.

Avant gel du catalogue, produire une matrice par cas (utilisable / complétion privée sourcée nécessaire / non pris en charge / indisponible), les raisons, limites et actions ; résoudre les blocages des cas nécessaires à la démonstration et au parcours MVP ou tracer une limitation compatible avec CAP-3. Aucun seuil arbitraire de couverture n’est fixé. Tout catalogue complémentaire exige une décision explicite et conserve OFF. L’audit reste à réaliser, sa préparation ne vaut pas résultat.

## Retours après mise à disposition — facultatifs

Besoin récurrent, temps gagné, compréhension, plausibilité personnelle, valeur payante et rentabilité restent inconnus. Les retours spontanés ou observations volontaires peuvent motiver une correction après livraison. Aucun contact externe sans instruction explicite ; information, consentement, minimisation, accès et conservation doivent être définis avant collecte.

Si une bêta comparative est décidée ultérieurement, définir avant invitations ses effectifs, durée, dénominateurs, fenêtres et critères ; séparer observations et déclarations, compter les invités uniques même sans usage, exclure démonstration/connexion de l’activation et réutilisation. AD-11 conserve les définitions métier et la déduplication. Les anciens repères 20–30 personnes / deux semaines / 60 % activation / 30 % réutilisation J6–J8 / cinq paiements de 5,99 € sont historiques, sans caractère obligatoire ni résultat atteint. Les renouvellements, remboursements et coûts nécessitent des faits réels ; ni le trafic gratuit ni les tests synthétiques ne prouvent le premium.

Une décision de poursuite, correction ou arrêt ne peut prétendre reposer sur des données absentes. L’absence d’étude n’équivaut ni à un succès ni à un échec commercial et ne bloque pas la livraison du MVP fiable.
