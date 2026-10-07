# Protocole bêta v1 — 7 octobre 2026

**Référence documentaire préparée avant recrutement ; gel opérationnel non acquis faute d'accord réel.** Source : [protocole canonique](../../../spec-macrova/protocole-validation.md), [epic enquête](../epic-enquete.md) et [AD-11](../../architecture-app/architecture-app.md). La bêta est réalisée par la [validation de lancement](../../epic-validation-lancement/epic-validation-lancement.md), après ses conditions d'ouverture contrôlée. Ce kit ne crée aucune instrumentation.

## Cohorte, fenêtres et critères

Recruter 20 à 30 adultes francophones en France suivant déjà leurs macros et pesant leurs aliments, sur les canaux réels consignés. Fixer les critères avant recrutement. Conserver chaque invitation individuelle et une clé privée de personne unique ; relances, comptes multiples et événements ne créent pas de nouvel invité. N comprend tous les invités uniques, y compris sans commencement. Un retrait est traité selon la politique approuvée et signalé au bilan ; ne pas retirer silencieusement un non-usager du dénominateur. Si les données nécessaires deviennent indisponibles, expliciter la limite plutôt que fabriquer un résultat.

Convention proposée v1 à approuver : invitationAt et événements en UTC millisecondes, J0 à l'invitation individuelle, observation deux semaines dans `[invitationAt, invitationAt + 14 × 24 h[`, reprise J6–J8 dans `[invitationAt + 6 × 24 h, invitationAt + 9 × 24 h[`. J8 est inclus, J9 exclu. Ce détail de fenêtre est une précision du kit, pas une règle déjà spécifiée par AD-11 ; son acceptation explicite et son implémentation cohérente sont nécessaires avant invitations. Fixer la date du bilan après toutes les fenêtres ; une cohorte interrompue ou hors 20–30 exige un bilan explicite, pas extrapolation.

- Activation : A personnes uniques avec premier repas personnel confirmé en favori ou journal pendant leur fenêtre de deux semaines ; A/N ≥ 60 %.
- Réutilisation : R personnes uniques avec copie/reprise ayant filiation puis enregistrement confirmé en favori ou journal dans leur fenêtre J6–J8 ; R/N ≥ 30 %, même dénominateur N. Une connexion ou copie de brouillon seule ne suffit pas.
- Paiement : P personnes distinctes ayant réellement payé **5,99 € (599 centimes EUR)**, encaissés et non remboursés au bilan de bêta ; P ≥ 5. Ni retour de page, ni droit actif, ni paiement de test ne prouvent encaissement.
- Renouvellement : observer un mois après **chaque** premier paiement les paiements du mois suivant, et rapprocher les remboursements ultérieurs. Pas de seuil ajouté ; utiliser l'échéance mensuelle effectivement établie, pas une conversion implicite en trente jours.
- Coûts de service et d'acquisition : montant, période, périmètre et preuve, distinguer réel/estimé/inconnu ; aucun seuil de rentabilité inventé.

Arrondi supérieur pour chaque effectif :

| N invités uniques | Activation minimale ceil(0,60N) | Réutilisation minimale ceil(0,30N) | Personnes payeuses minimales |
| --- | --- | --- | --- |
| 20 | 12 | 6 | 5 |
| 21 | 13 | 7 | 5 |
| 22 | 14 | 7 | 5 |
| 23 | 14 | 7 | 5 |
| 24 | 15 | 8 | 5 |
| 25 | 15 | 8 | 5 |
| 26 | 16 | 8 | 5 |
| 27 | 17 | 9 | 5 |
| 28 | 17 | 9 | 5 |
| 29 | 18 | 9 | 5 |
| 30 | 18 | 9 | 5 |

## Correspondance des champs et collecte AD-11

Le [format F](formats-vierges.md) est une grille privée de collecte, pas un nouveau schéma d'événement applicatif. Les noms de preuve ci-dessous décrivent les éléments à vérifier auprès du contrat et des modules propriétaires. Aucune collecte réelle avant cadre et accès approuvés.

| Champ de mesure | Définition / correspondance AD-11 | Règle de collecte et contrôle |
| --- | --- | --- |
| participantKey | Personne unique dans cohorte ; liaison au compte strictement privée | Dédupliquer invitations/personnes ; correspondance isolée, jamais dans corpus/Git |
| invitationAt | Date individuelle pour tous les invités, sans usage inclus | Registre réel d'invitation ; ne pas substituer première connexion |
| canal, version protocole, statut, limites | Provenance et interprétation, complément du kit | Consigner canal réel, version appliquée et données indisponibles sans réduire N silencieusement |
| début/fin fenêtres, date bilan | Deux semaines et J6–J8 après invitation | Calculer depuis invitationAt selon convention approuvée ; conserver bornes et horodatages |
| eventId, doublon traité | Identifiant et déduplication serveur | Garder une occurrence effective ; livraison répétée d'un événement ne gonfle aucun compte |
| eventType | first_personal_meal, meal_reused, payment_settled, distincts | Utiliser contrat partagé ; calculator_completed/demo_completed classés à part sans contenu profil, exclus des numérateurs |
| occurredAt, preuve serveur, mutationConfirmée | Émission serveur après mutation effective | Vérifier accusé effectif et référence privée ; clic client/optimisme/échec de mutation ne compte pas |
| operationId/référence commande, destinations | Une commande aux deux destinations compte une fois | Rapprocher commande et événement ; favori+journal n'ajoute pas deux usages |
| personnel/hors démo | Premier repas confirmé personnel, hors démonstration | Démo et connexion exclues ; vérifier favori ou journal confirmé |
| filiation source | meal_reused conserve filiation copie/reprise puis confirmation | Vérifier source enregistrée et nouvelle confirmation dans au moins une destination ; filiation absente = non recevable |
| montant, devise, settledAt, référence règlement, preuve encaissement | payment_settled, règlement réel distinct du droit | Rapprochement côté module paiement ; 599 EUR centimes, preuve réelle, une personne comptée une fois |
| remboursement au bilan | Condition non remboursé au bilan | Vérifier statut au bilan, exclure règlement remboursé ; remboursement partiel signalé et règlement exclu du seuil de 5,99 € net |
| remboursement ultérieur/date | Observation séparée après bilan | Journal daté lié au règlement ; conserver bilan historique et publier addendum explicite, pas réécriture silencieuse |
| renouvellement attendu/observé/date/statut/preuve | Paiement du mois suivant, un mois après chaque paiement | Rapprocher échéance et encaissement effectifs ; inconnu ≠ absent, aucun seuil |
| N, A, R, P et seuils | Dénominateur commun invités uniques, numérateurs uniques | Calculer à partir de registres dédupliqués ; montrer comptes et ratios, pas seuls pourcentages |
| tâches/durées/erreurs/corrections/compréhension/plausibilité | Comparaison canonique, complément qualitatif | Observer tâche habituelle puis comparable Macrova ; relever chaque mesure et sa preuve séparément |
| coûts/période/périmètre/statut/justificatif | Observation économique canonique | Sources privées, sans déduire rentabilité à partir des seuils |
| décision/limites/politique de données | Interprétation et périmètre export/delete AD-11 | Décision explicite ; mesures personnelles soumises à politique approuvée, accès privés et export/delete effectifs à vérifier |

Un élément non observable ne peut valider un événement. Pour les données manquantes, rapporter comptes vérifiés et incertitudes ; si la validité des seuils ne peut être établie, conclure « non démontré ». Aucun traqueur tiers imposé.

## Comparaison et remboursements

Préparer deux tâches de repas comparables en composition, nombre d'aliments, états et unités, avec périmètre début/fin identique ; observer méthode habituelle puis Macrova. Documenter différences et effet d'apprentissage plutôt que prétendre une comparaison contrôlée. Relever durées avec pauses, erreurs, corrections de portions, compréhension des écarts et plausibilité déclarée/observée. Ne pas déduire un gain de temps minimal ni une vérité médicale.

Le kit propose d'exclure tout règlement remboursé, même partiellement, du seuil au bilan. Cet arbitrage autonome doit être approuvé avant bêta avec les règles commerciales effectives ; il ne change pas les contrats parents. Les remboursements postérieurs sont datés et signalés séparément. Ni paiement ni renouvellement ne sont sollicités par ce document.

## Décision et journal sans rétroactivité

Si les trois seuils sont atteints, poursuivre l'observation des renouvellements et coûts. Si composition peu réutilisée, corriger une fois le problème observé ; si favoris/copie seuls apportent valeur, tester une offre simplifiée. Après correction ciblée, absence de réutilisation ou paiement : abandonner l'abonnement. Seuils partiels : bilan explicite, pas poursuite automatique. Calculateur évalué séparément ; aucun seuil ne prouve préférence concurrentielle ou rentabilité.

| Version | Date | Changement et motif | Date d'effet / cohorte | Décision attribuable privée |
| --- | --- | --- | --- | --- |
| v1 | 2026-10-07 | Préparation des critères canoniques et conventions proposées | Aucune invitation réelle | Non reçue |

Avant toute évolution : nouvelle version, motif, décision et date d'effet ; conserver version appliquée à chaque invité et résultats d'origine. Aucun critère modifié après observation pour transformer un échec en succès. Si changement pendant cohorte, présenter séparément les résultats par version et la limite de comparaison.
