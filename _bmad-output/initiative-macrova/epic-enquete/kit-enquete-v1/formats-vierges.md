

> Kit historique facultatif, hors chemin critique du MVP depuis le [10 octobre 2026](../../change-mvp-sans-enquete/change-mvp-sans-enquete.md). Aucune enquête, pilote, recrutement ou quota requis. À réexaminer avant une éventuelle collecte réelle ; aucun résultat utilisateur démontré.

# Formats vierges v1 — 7 octobre 2026

**Copier uniquement dans le support privé approuvé. Aucun modèle rempli avec des données réelles dans Git, même pseudonymisées.** Les champs entre crochets sont à renseigner, pas des valeurs par défaut. Ne recueillir que les champs nécessaires approuvés dans le [cadre](cadre-protection.md).

Statut de preuve par constat : `observé` (preuve directe), `déclaré` (rapporté), `non observable` (pas de preuve disponible), avec méthode et limite. Statut de valeur : `connu` + valeur/source, `inconnu` (non établi), `absent` (champ non disponible/non applicable avec motif), `zéro` (valeur mesurée ou déclarée explicitement comme zéro). Vide signifie non renseigné, jamais zéro. Ne déduire ni nutrition, conversion, état cru/cuit, disponibilité catalogue ni unité manquante.

## A — Recrutement séparé, accès restreint

| Identifiant recrutement privé | Coordonnée strictement nécessaire | Canal réel | Adulte | Francophone en France | Macros suivies | Aliments pesés | Information version/date | Accord modalité/date/preuve privée | Statut / doublon / retrait |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [oui/non/incertain] | [oui/non/incertain] | [oui/non/incertain] | [oui/non/incertain] | [ ] | [ ] | [ ] |

Pas de nom si non nécessaire, d'adresse complète ni de diagnostic. La table A et la correspondance D ne sont pas accessibles aux destinataires catalogue.

## B — Fiche d'entretien privée

| Référence entretien privée | Version guide | Date privée | Canal | Cible / personne unique vérifiées | Repas récent réel et contexte minimal | Méthode habituelle | Début/fin, durée, unité, pauses | Erreurs | Corrections avant/après | Difficultés | Limites / complément | Admissibilité ENQ-2 et motif |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Chaque constat comporte `[statut de preuve ; statut de valeur ; source privée ; limite]`. Écarter données de santé et détails identifiants spontanément montrés. Ne pas conserver captures ni verbatim personnels par défaut.

## C — Aliments et recherches candidates privées

| Référence ligne privée | Référence entretien/repas privée | Nom tel que recherché | Marque si pertinente | État cru/cuit/inconnu | Quantité rapportée et statut | Unité rapportée et statut | Observé/déclaré/non observable | Source privée | Question à clarifier |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Les candidates sont des requêtes issues des aliments, pas des résultats OFF. Documenter regroupement et doublons sans créer cinquante lignes artificiellement : conserver chaque origine dans D, vérifier cinquante recherches effectivement traçables. Couvrir aliments bruts, produits français et états cru/cuit sans les fabriquer. Un manque déclenche un complément aux mêmes personnes, tracé séparément.

## D — Correspondance et traçabilité privées, isolées

| Référence recrutement ↔ entretien | Référence candidate ↔ lignes/repas sources | Référence preuve privée | Transformation / regroupement | Version corpus | Décision d'admissibilité | Retrait et suppressions propagées |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Ne mettre aucun identifiant recrutement, entretien, compte ni lien de preuve dans le corpus destinataire. La correspondance permet la vérification et le retrait seulement aux rôles autorisés ; sa pseudonymisation n'autorise pas sa publication.

## E — Corpus anonymisé destinataire, toujours privé

| Identifiant candidate propre au corpus | Nom recherché | Marque si pertinente | État connu/inconnu | Unité rapportée et statut | Catégorie brut/produit français/à clarifier | Limite pertinente |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Exclure coordonnées, notes, date individuelle, repas complet, quantité individuelle, citation et correspondances. Ne pas garder un identifiant stable de participant. Examiner risque de réidentification par combinaison rare ; reformuler/retirer ce qui identifie, sans inventer les champs alimentaires. Une anonymisation non recevable bloque la transmission et conserve le brouillon à accès restreint. Manifeste séparé : `[version ; nombre de personnes admissibles sans identifiants ; nombre de candidates ; classes présentes ; limites ; contrôle d'anonymisation ; auteur/preuve privés]`. Aucun seuil de couverture ni disponibilité annoncés.

## F — Mesures bêta privées

Les champs et règles exacts sont définis dans le [protocole](protocole-beta.md). Copier trois registres séparés, sans coordonnées dans les mesures :

- Cohorte : `[participantKey unique ; invitationAt ; canal ; version protocole ; début/fin fenêtre ; statut non commencé/actif/retrait ; limite]`.
- Événements : `[participantKey ; eventId ; eventType ; occurredAt ; operationId/référence commande ; mutationConfirmée ; personnel/hors démo ; destination(s) ; filiation source ; preuve serveur ; doublon traité]`.
- Paiements : `[participantKey ; référence règlement privée ; montant ; devise ; settledAt ; preuve encaissement ; remboursement au bilan ; remboursement ultérieur/date ; renouvellement attendu/observé/date/statut ; preuve privée]`.

Comparaison : `[participantKey ; tâche habituelle et tâche Macrova comparables ; ordre ; périmètre ; début/fin/durée/unité/pauses de chacune ; erreurs ; corrections portions ; compréhension écarts ; plausibilité ; statuts de preuve ; limites]`. Coûts : `[période ; service/acquisition ; montant/devise ; réel/estimé/inconnu ; justificatif privé ; périmètre]`.

Bilan : `[date ; N invités uniques incluant non commencés ; activation unique A/N ; réutilisation unique R/N ; personnes payeuses P ; seuils ceil ; limites et données manquantes ; remboursements ; renouvellements ; coûts ; décision explicite]`. Données non disponibles ne deviennent pas zéro ni succès.

## G — Transmission privée et contrôle des accès

| Livrable / version / empreinte | Destinataire et rôle privés | Périmètre sans correspondances | Date réelle | Accès autorisé vérifié / preuve privée | Accès interdit testé / preuve privée | Limites et actions | Conservation/suppression appliquées |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Corpus vers catalogue en 10.5 ; protocole et dossier final vers validation de lancement en 10.7. Préparer ce registre n'est pas une transmission. Les preuves restent privées ; seul un bilan sans identifiants peut entrer dans Git.
