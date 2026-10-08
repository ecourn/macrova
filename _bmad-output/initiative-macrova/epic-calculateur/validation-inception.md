# Validation de l'inception du calculateur

> Photographie historique du 7 octobre 2026. Les conditions externes, le calendrier des essais du support et les statuts ci-dessous sont remplacés par la [correction de gouvernance du 8 octobre](../change-gouvernance-a-deux/change-gouvernance-a-deux.md) ; consulter les tickets et plans courants.

Date : 2026-10-07. Périmètre : epic-calculateur et son découpage, sans implémentation ni publication.

## Sources et méthode

Lecture du parent, de CAP-1 et de ses compagnons, des contrats architecture/UX et de l'application existante ; reconnaissance en sous-agent, vérification initiale des besoins, collisions, setup partagé et handoffs par le facilitateur, puis validation indépendante par un autre sous-agent selon les checks ticket, set et dependencies de bmad-ticket.

Le découpage ne contient aucun enfant construit ou fichier de story : les huit entrées sont planned et leurs critères détaillés seront établis lors des builds à partir de l'epic, des descriptions et des vérifications. L'estimation en points est désactivée dans la configuration.

## Résultats

- CAL-1 à CAL-8 ont chacun un rattachement explicite à CAP-1 et une couverture concrète dans les huit stories ; aucune exigence de CAP-1 n'est différée.
- Les ids sont uniques, les descriptions, vérifications et incertitudes renseignées ; les quinze références locales citées existent.
- La validation de méthode possède son travail humain explicite en 2.1 ; aucun choix scientifique n'est déclaré adopté par l'inception.
- Le premier parcours possède déjà les gardes nécessaires ; les modifications de domaine, route et tests partagés suivent une chaîne sans collision parallèle.
- Les dépendances externes sont épinglées vers les stories terminées 1.1, 1.2, 1.4 et 1.5 ; aucun nouveau setup, fournisseur ou secret n'est présumé requis pour le calcul local.
- Le domaine reste pur et en mémoire ; la mesure publique minimale ne devient pas une preuve d'activation personnelle ou de personne distincte.
- Le nettoyage dépend de toutes les stories précédentes et précède la recette intégrée livrée ; l'ouverture publique reste au périmètre de validation-lancement.

## Corrections et arbitrages

La reconnaissance a rendu explicites dans 2.2 le risque du root auth commun, la disponibilité publique malgré panne distante, l'adaptation des sondes/tests de l'accueil et le traitement des intermédiaires signés si requis par la méthode.

Le validateur indépendant n'a trouvé aucun fix bloquant ni ask d'inception. Ses deux suggestions ont été adoptées : vérifier explicitement dans 2.2 la panne auth/Convex à l'entrée SSR et la distinction des erreurs privées ; vérifier dans 2.5 purge à 30 jours et protection contre les envois abusifs. La durée de conservation reste une hypothèse technique marquée, à vérifier avant ouverture publique.

## Contrôles finaux

`tickets.py status` sur l'epic : huit stories planned, aucun cycle, drift, unpinned_after, undeclared_after ou order_conflict ; `tickets.py next` désigne uniquement 2.1 dans ready_to_start et ne demande aucun raffinage préalable.

Le statut global de l'initiative confirme les dépendances inter-epics sans anomalie de graphe. Il signale trois documents préexistants nommés plan-*.md hors du ticket tree, sans champ ticket : plan-corriger-actions-retrospective-socle.md, plan-publier-corrections-socle-test.md et plan-reutiliser-shadcn.md ; ils sont ignorés par l'outil et ne sont pas des plans enfants de cet epic. Aucun de ces documents n'a été modifié ou converti en ticket.

`git diff --check` : aucune erreur d'espacement. Aucun changement dans app/ et aucun test applicatif requis pour ce travail documentaire. L'inception est achevée ; les builds, la validation réelle de méthode et la publication par commit ne sont pas exécutés.
