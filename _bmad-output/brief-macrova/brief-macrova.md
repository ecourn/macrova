---
title: "Macrova — brief produit"
status: draft
created: 2026-10-02
updated: 2026-10-02
---

> Historique : les obligations d’enquête, de recrutement, de bêta et de résultats commerciaux préalables sont remplacées par [la décision du 10 octobre 2026](../initiative-macrova/change-mvp-sans-enquete/change-mvp-sans-enquete.md). Audit alimentaire et contrôles techniques conservés ; aucune validation utilisateur inventée. Les autres exigences restent applicables.

# Macrova — Tes macros, avec les aliments que tu manges vraiment

## Intention et cible

Macrova est un service web en français qui aide à ajuster les quantités d’un repas habituel pour approcher une cible de protéines, glucides et lipides. Un calculateur gratuit donne une estimation des besoins ; la valeur payante repose sur la composition et la réutilisation des repas.

La cible initiale est constituée d’adultes francophones en France qui suivent déjà leurs macros, pèsent leurs aliments et répètent quelques repas. [ASSUMPTION] Une interface web adaptée au mobile et un périmètre réduit conviennent à un lancement avec budget limité. Le brief prépare une première expérimentation puis une spécification. La proposition n’est encore validée par aucun entretien utilisateur, paiement réel ou usage d’une application Macrova.

## Problème à résoudre

[ASSUMPTION] Une personne sait quels aliments elle souhaite manger, mais ajuste plusieurs fois les grammes dans son outil de suivi pour approcher sa cible. Elle recommence lorsqu’une portion ou un ingrédient change. Le coût supposé est du temps de calcul et de saisie, ainsi qu’une difficulté à garder des portions pratiques. La fréquence et l’intensité de cette difficulté doivent être observées sur des repas récents.

Le résultat recherché : obtenir rapidement des quantités utilisables pour ses propres aliments, comprendre les écarts restants et reprendre le repas une autre fois.

## Expérience proposée

1. Calculer gratuitement une cible estimative sans compte, avec hypothèses visibles et possibilité de modification. La méthode de calcul reste à cadrer avant implémentation.
2. Découvrir une démonstration complète de composition avant la proposition d’abonnement.
3. Choisir 3 à 6 aliments habituels et saisir ou confirmer une cible de repas. Verrouiller les portions que l’on souhaite conserver.
4. Obtenir des quantités dans des bornes plausibles, avec calories et macros du repas et écarts à la cible. Si les contraintes sont incompatibles, comprendre ce qui empêche une proposition et quelle contrainte modifier.
5. Confirmer le repas, l’enregistrer en favori ou le copier dans un journal minimal pour retrouver les totaux du repas et de la journée.

Open Food Facts est une source obligatoire. Chaque aliment indique sa provenance, sa base de mesure et son état cru ou cuit lorsqu’il est connu. Une donnée absente reste distincte de zéro ; aucune valeur nutritionnelle n’est inventée. Les données insuffisantes bloquent la suggestion tant qu’une saisie privée sourcée ne les complète pas. Le reste journalier est indicatif lorsque le journal est incomplet et ne déclenche aucune compensation automatique. Le produit ne promet aucun résultat de santé.

## Positionnement et modèle économique

[ASSUMPTION] La préférence pour Macrova viendra de la simplicité du parcours « mes aliments → mes portions → mon repas réutilisable », en français. Le suivi nutritionnel et la génération de plans existent déjà chez [Cronometer](https://cronometer.com/features/) et [Eat This Much](https://www.eatthismuch.com/how-to/). Ce positionnement reste une hypothèse ; aucun avantage exclusif n’est démontré.

Le calcul sans compte et la démonstration servent l’acquisition. Un abonnement unique donne accès à la composition personnelle, aux favoris, à la copie et au journal minimal. **5,99 €/mois est un prix de test**, sans validation de rentabilité ; l’offre annuelle est différée. Les coûts de service et d’acquisition doivent être mesurés avant de développer l’offre.

## Premier périmètre

Construire le calculateur et observer les usages, puis expérimenter le parcours payant complet avec compte, recherche alimentaire, quantités, contraintes de portions, écarts visibles, favoris, copie et journal minimal. La popularité du calculateur ne suffit pas à valider le premium.

Différer application native, reconnaissance photo, IA nutritionnelle générative, planning hebdomadaire, gestion de stock, espace coach et suivi des micronutriments. Le scan de code-barres sera évalué après observation. La protection des données personnelles, les conditions de réutilisation des sources et la méthode nutritionnelle restent des décisions à traiter avant lancement.

## Preuves attendues et décision de poursuite

Les seuils suivants sont des critères internes proposés, sans référence de marché :

- Mener 15 entretiens sur des repas réels récents, puis une bêta de 20 à 30 personnes pendant deux semaines.
- Au moins 60 % des personnes invitées enregistrent un premier repas personnel ; au moins 30 % réutilisent un repas autour de J7.
- Obtenir au moins cinq paiements réels de 5,99 € pour poursuivre. Mesurer le gain de temps sur une tâche comparable et observer ensuite le renouvellement à un mois ; ces signaux ne démontrent pas encore la rentabilité.
- Examiner 50 recherches alimentaires représentatives avant de figer le catalogue. Une couverture insuffisante doit être résolue avant lancement ; tout catalogue complémentaire nécessite un arbitrage explicite en conservant Open Food Facts.

Si la composition est peu réutilisée, corriger une fois le problème observé. Si favoris et copie constituent seuls la valeur, tester une offre simplifiée. Après cette correction ciblée, l’absence de réutilisation ou de paiement conduit à abandonner cette offre par abonnement.

## Suite envisagée

[ASSUMPTION] Si la réutilisation, les paiements et le renouvellement confirment la valeur, Macrova pourra devenir une bibliothèque personnelle de repas ajustables, puis explorer les variantes et les recettes à plusieurs portions. Chaque extension devra servir un usage observé. Les points à instruire figurent dans l’addendum.
