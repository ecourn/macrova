

> Historique remplacé pour le MVP par [la décision du 10 octobre 2026](../change-mvp-sans-enquete/change-mvp-sans-enquete.md). Aucune reprise terrain obligatoire ; les constats et preuves absentes ci-dessous restent historiques.

# Validation de l'inception des entretiens et repas de référence

> Photographie historique du 7 octobre 2026. Les conditions externes, le calendrier des essais du support et les statuts ci-dessous sont remplacés par la [correction de gouvernance du 8 octobre](../change-gouvernance-a-deux/change-gouvernance-a-deux.md) ; consulter les tickets et plans courants.

Date : 2026-10-07. Périmètre : epic 10 de l'initiative Macrova, sans exécution de l'enquête ni publication par commit.

## Sources et méthode

Lecture du parent, de la spécification et de ses quatre compagnons, des epics destinataires et des contrats architecture/UX ; reconnaissance du contexte et du code en sous-agent, puis vérification par le facilitateur des besoins, collisions, setup partagé et transmissions du brouillon ; validation indépendante par un autre sous-agent selon checks.ticket, checks.set et checks.dependencies de bmad-ticket.

L'initiative explicitement désignée par l'utilisateur résout l'absence de core.active_initiative ; aucune configuration globale n'est changée. Les arbitrages sont délégués à l'agent et enregistrés comme Decision ou Assumption. Les sept entries restent planned, sans fichiers enfants, plans de build ou critères refined:true. L'estimation est désactivée.

## Couverture et limites

- ENQ-1 à ENQ-6 ont chacune une source explicite et une couverture concrète ; aucun périmètre de l'epic n'est différé. Les ids locaux ne possèdent pas une capacité CAP et covers reste vide conformément à l'enveloppe transversale.
- 10.1 possède le setup documentaire, le support privé vérifié, les règles approuvées de collecte et le gel du protocole avant recrutement ; son exercice est explicitement exclu des preuves réelles.
- 10.2 éprouve le guide sur un pilote admissible ; 10.3 et 10.4 ajoutent sept entretiens chacune pour parvenir à quinze personnes distinctes, sans compter doublons ou simulations.
- 10.5 produit et transmet cinquante recherches traçables incluant aliments bruts, produits français et états cru/cuit ; les éventuels compléments proviennent des mêmes participants et ne sont pas inventés.
- 10.6 nettoie les documents sans modifier les résultats ; 10.7 vérifie les accès et la remise finale au catalogue et à la validation de lancement, avec responsabilités et échéances de conservation/suppression.
- La séquence tient compte du guide, du registre et du support partagés : aucune exécution parallèle sans dépendance n'est annoncée. Aucun prérequis applicatif n'est nécessaire à l'enquête.
- L'audit OFF appartient au catalogue ; les invitations bêta, la tâche comparative Macrova et les mesures réelles appartiennent à la validation de lancement. La préparation du protocole ne prouve ni activation, ni paiement, ni conformité juridique.
- Les cinq Done when sont couverts ; la livraison est une remise privée vérifiée, sans déploiement applicatif ou ouverture publique artificiellement requis.

## Revue indépendante et corrections

La revue indépendante confirme couverture, taille des étapes, fidélité aux sources, ownership du setup, interventions humaines et transmissions. Son seul correctif bloquant était le nom d'une section UX : le renvoi est corrigé vers Key Flows et Décisions amont à instruire dans EXPERIENCE.md.

La suggestion facultative est adoptée : 10.1 matérialisera la correspondance entre champs de mesure, définitions AD-11 et règles de collecte. Les Notes explicitent repas confirmé, filiation et enregistrement de la réutilisation, invitation individuelle pour J6 à J8, déduplication et traitement séparé des remboursements/renouvellements/coûts.

Les besoins de l'initiative nomment désormais 10.5 pour le corpus catalogue et 10.7 pour le dossier/protocole bêta. Ces epics futurs n'ont aucune story à réépingler aujourd'hui ; leurs inceptions utiliseront les ids fournisseurs, sans attendre l'epic entier par défaut.

Aucun correctif bloquant ni question d'inception ne reste ouvert. Les identités des responsables, le support effectivement maîtrisé, les autorisations de contact et les preuves terrain restent des travaux humains à réaliser dans les stories, jamais des faits acquis par cette validation.

## Contrôles finaux

- Analyse TOML : sept ids uniques, descriptions, vérifications et incertitudes présentes ; couverture exacte des ids ENQ-1 à ENQ-6 ; toutes les dépendances internes ciblent une entry existante antérieure.
- Neuf références documentaires locales existent et ont été ouvertes ; aucune modification dans app/.
- tickets.py status sur l'epic : sept planned, aucune anomalie ; tickets.py next : seulement 10.1 ready_to_start, aucun raffinage préalable requis.
- tickets.py status sur l'initiative : aucun unpinned_after, undeclared_after ou order_conflict ; les trois avertissements préexistants de plan-corriger-actions-retrospective-socle.md, plan-publier-corrections-socle-test.md et plan-reutiliser-shadcn.md concernent des documents hors du ticket tree sans champ ticket, déjà signalés dans la validation du calculateur ; ils sont ignorés par l'outil et ne sont pas modifiés ici.
- git diff --check : aucune erreur d'espacement.

L'inception est achevée et enregistrée localement. Le premier build peut partir de 10.1 avec l'epic et son entry ; les preuves humaines et done_checkpoint doivent être respectés. Les entretiens, le recrutement, les builds et la publication par commit n'ont pas été réalisés.
