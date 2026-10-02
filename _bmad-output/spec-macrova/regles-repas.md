# Règles des repas

## Données et états

Chaque aliment conserve identifiant, nom français disponible, marque si pertinente, provenance, date de consultation ou de saisie, protéines/glucides/lipides/calories et base 100 g ou 100 ml. Afficher l’état cru/cuit lorsqu’il est connu, sinon « état inconnu ». Ne pas traduire un nom de manière trompeuse. Une correction privée ne modifie pas Open Food Facts ni les données d’autres comptes ; conserver sa source, par exemple l’étiquette.

Une proposition exige les quatre valeurs nutritionnelles et une base compatible avec la quantité. Zéro explicitement fourni est valide ; une absence ne l’est pas. Ne pas déduire silencieusement les calories des macros. Une densité documentée est nécessaire pour convertir ml en g. Toute ambiguïté de base bloque le calcul concerné et indique la donnée à confirmer.

## Portions et proposition — arbitrages autonomes

Avant calcul, chaque aliment reçoit une quantité initiale confirmée, une borne minimale et maximale et un pas strictement positif, dans une même unité. Ne pas inventer des bornes universelles : l’utilisateur peut confirmer ou modifier des valeurs issues d’une référence documentée. Quantité et bornes sont positives ou nulles, ordonnées et compatibles avec le pas. Un verrou fixe exactement la quantité confirmée et prime sur la recherche de proximité.

La cible de repas comporte protéines, glucides et lipides non négatifs, confirmés par la personne ; les calories restent un résultat informatif. Classer les propositions selon la moyenne des écarts absolus normalisés aux trois cibles : abs(quantité obtenue − cible) / max(cible, 1 g). À égalité, préférer la plus faible modification des portions initiales, puis un ordre stable des aliments. Ce classement déterministe est un choix de calcul à tester, sans prétention nutritionnelle.

Afficher une proposition « proche » seulement si chaque macro est dans une tolérance de max(10 % de la cible, 2 g). Cette tolérance provisoire n’est pas une recommandation de santé. Sinon, afficher « cible non atteinte » et les écarts signés ; la personne décide d’accepter ou de modifier ses contraintes. Une proposition doit toujours respecter bornes, pas et verrous. Si aucune combinaison admissible n’existe, ne pas présenter de repas valide ; distinguer entrée incorrecte, donnée manquante et contraintes incompatibles, puis suggérer une contrainte à réexaminer sans la changer.

Le nombre d’aliments est compris entre 3 et 6 pour la composition. Aucune substitution ou variante automatique au premier périmètre. La plausibilité des portions doit être observée auprès de la cible ; un bon score ne suffit pas.

## Confirmation et réutilisation — arbitrages autonomes

Enregistrer avec le repas un instantané de ses valeurs et sources afin qu’une évolution du catalogue ne modifie pas silencieusement l’historique. Une mise à jour nutritionnelle demande confirmation. Favori et journal sont distincts : sauvegarder un favori ne l’ajoute pas automatiquement à une journée. Reprendre un favori ou copier un repas crée une nouvelle instance modifiable ; confirmer ajoute cette instance au jour choisi, une seule fois.

Le journal permet d’ajouter, modifier et retirer un repas. Afficher les totaux de calories et macros ; permettre de déclarer une journée complète, sans inférer sa complétude à partir du nombre de repas. Une modification remet cette déclaration à confirmer. Le reste journalier peut être négatif et reste exprimé sans jugement, sans rattrapage ni mécanisme culpabilisant.
