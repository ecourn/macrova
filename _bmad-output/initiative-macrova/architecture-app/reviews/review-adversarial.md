# Revue adversariale — architecture app

Verdict final après vérification des corrections : **conforme, aucun constat adversarial bloquant restant**. Les trois scénarios ci-dessous sont conservés comme trace de la revue initiale et sont désormais empêchés par AD-5, AD-7 et AD-9.

## Vérification finale des corrections

- **Constat 1 résolu — AD-7 :** génération croissante réservée avant appel fournisseur, application conditionnée à la génération courante et relance explicite après échec. Une observation obsolète ne peut plus écraser une observation concurrente admise.
- **Constat 2 résolu — AD-9 et AD-7 :** fermeture durable antérieure au nettoyage, relue dans chaque transaction interne créant ou modifiant des données personnelles ; seule la progression et le nettoyage restent permis au travail de suppression.
- **Constat 3 résolu — AD-5 :** cible journalière confirmée et embarquée dans le jour, distincte de la cible repas, stable historiquement et modifiable sous révision ; absence de cible = absence de reste.
- **AD-12 vérifié :** représentation décimale commune, limites explicites, calcul rationnel exact et versionnement ferment le choix local de précision précédemment différé.

Les conditions produit et d’ouverture explicitement différées restent visibles ; elles ne constituent pas de nouveaux détails d’implémentation exigés par cette revue.

## 1. Réconciliation paiement : publication d’une observation périmée — priorité haute

**Unités indépendantes.** L’adaptateur A lit le fournisseur : abonnement actif. Avant sa mutation interne, l’adaptateur B lit le fournisseur après résiliation : accès expiré, puis publie sa projection. A termine ensuite et republie son observation active. Chaque adaptateur a vérifié un événement signé, dédupliqué et rapproché le statut courant à l’instant de sa lecture ; AD-7 ne fixe pas l’ordre des observations appliquées.

**Incompatibilité.** La projection peut rouvrir un droit après application d’un état fournisseur plus récent. La réconciliation planifiée répare éventuellement le résultat, mais n’empêche pas un accès entretemps.

**Correctif minimal AD-7.** Fixer une coordination unique des réconciliations par souscription : une génération/lease réservée avant lecture fournisseur, puis une mutation d’application qui refuse une génération obsolète. Une invalidation pendant le rapprochement oblige une nouvelle lecture. L’ordre d’arrivée des événements et leurs dates ne suffisent pas à ordonner les états lus.

## 2. Suppression : barrière vérifiée trop tôt — priorité haute

**Unités indépendantes.** Abonnement consulte la fermeture du compte avant de traiter l’événement, puis attend le fournisseur. Demandes de données clôt le compte et purge la projection. Abonnement reprend et applique sa mutation interne. Il a bien consulté la fermeture « avant tout événement » selon AD-9 ; aucune règle n’oblige la vérification dans la transaction qui écrit.

**Incompatibilité.** Un droit, un événement identifiant ou un lien de souscription peut être recréé après son passage dans la purge. Le refus des écritures métier par AD-6 ne définit pas explicitement le traitement des écritures internes de réconciliation et de leurs tâches différées.

**Correctif minimal AD-6/AD-9.** Toutes les mutations internes susceptibles de créer des données du compte relisent la barrière de fermeture dans la transaction de leur écriture. Définir les seules commandes internes autorisées après clôture : progression du travail, clôture fournisseur et nettoyage. La barrière/tombstone doit survivre aux tâches différées et webhooks ; sa rétention détaillée reste une politique différée.

## 3. Reste journalier : cible sans propriétaire ni temporalité — priorité moyenne

**Unités indépendantes.** Composition détient une cible de repas et transmet son dernier objectif au journal. Journal déduit une cible journalière de la dernière estimation gratuite ou d’un objectif courant du compte. Les deux respectent AD-2, AD-4 et AD-5 : aucune AD ne définit la cible servant au reste journalier, sa confirmation, son unité temporelle ou son propriétaire.

**Incompatibilité.** Le même historique affiche des restes différents selon le parcours et peut changer rétroactivement lors d’un nouvel objectif. La spécification CAP-6 demande pourtant un reste journalier.

**Correctif minimal AD-5.** Le module repas/journal possède la cible journalière explicitement confirmée, versionnée et associée au jour choisi ; elle ne provient jamais implicitement de la cible d’un repas. Le reste = cible de ce jour − totaux confirmés. Sans cible journalière confirmée, afficher uniquement les totaux et un état « cible à confirmer ». Une modification explicite suit expectedRevision et invalide la confirmation de complétude si celle-ci doit porter sur cette cible.

## Points sans constat

- Identité et propriété : AD-6 interdit effectivement les références intercomptes et les identifiants client faisant autorité.
- Catalogue OFF : propriétaire et séparation cache/corrections sont fixés ; quotas et licence demeurent des conditions explicites d’ouverture.
- Moteur : normalisation définie dans regles-repas.md, départage et grille fixés ; la précision numérique est différée avec interdiction de distribuer moteur/adaptateurs avant décision commune.
- Confirmation : transaction, révision et operationId fixent suffisamment l’unicité d’une intention.
