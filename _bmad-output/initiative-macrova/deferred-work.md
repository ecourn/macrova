# Travaux différés

## Deferred from: code review of story-parcours-public-et-session-sur-environnement-isole-plan (2026-10-05)

- Portabilité des snapshots BMad (low, blind-hunter) : les instructions versionnées dans `_bmad/render/bmad-build/` référencent des chemins absolus sous `/home/ubuntu/macrova` et `/home/ubuntu/.agents/skills`. Définir la politique de régénération ou de versionnement pour les autres checkouts. Différé car cela modifie les instructions d’agents et leur génération, hors correctifs applicatifs du ticket 1.1.

- source_plan: `_bmad-output/initiative-macrova/epic-socle/story-choix-et-preparation-de-lhebergement-isole-plan.md`
  summary: Remettre les accès Render et la preuve du frontend HTTPS associé au backend de test pour satisfaire l’acceptation de 1.7.
  evidence: Aucun accès Render local ou connecté ; la revue quick confirme que localhost ne satisfait pas la remise distante. Connexion du compte fournisseur nécessaire, puis publication prévue par 1.5 et relevé de région/plan Convex. Ne pas clôturer 1.7 avant cette preuve.
- source_plan: `/home/ubuntu/macrova/_bmad-output/initiative-macrova/epic-socle/story-choix-et-preparation-de-lhebergement-isole-plan.md`
  summary: Relever la région effective, le plan et les quotas du backend Convex de test avant validation de la remise des accès 1.7.
  evidence: Revue quick du 2026-10-06 ; la fiche documente la cible mais pas la région observée de dazzling-puffin-856, requise par l’acceptation ; consulter le dashboard avec l’accès autorisé du propriétaire, sans modifier le backend ni extraire ses secrets.

- source_plan: `/home/ubuntu/macrova/_bmad-output/initiative-macrova/epic-socle/story-choix-et-preparation-de-lhebergement-isole-plan.md`
  summary: Confirmer le plan commercial et les quotas Convex pour vérifier le budget de test ; le contrôle de région de l’entrée précédente est résolu.
  evidence: Mise à jour du 2026-10-06 après poursuite autonome : accès Convex et région aws-us-east-1 confirmés en lecture via l’API de gestion. Ne pas reprendre le relevé de région indiqué historiquement comme manquant. Le CLI retourne 249 appels de fonctions ce mois-ci et aucune limite personnalisée, sans prouver le plan commercial ni les quotas inclus ; ces deux éléments restent à confirmer dans le dashboard.

- source_plan: `/home/ubuntu/macrova/_bmad-output/initiative-macrova/epic-socle/story-choix-et-preparation-de-lhebergement-isole-plan.md`
  summary: Suivi après connexion Render : accès fournisseur, inventaire, région et plan Convex résolus ; vérifier la facturation Render avant 1.5, puis remettre la preuve HTTPS.
  evidence: Le 6 octobre 2026, CLI Render authentifié sur My Workspace (tea-db2fsavlot8c73f24nr0), inventaire API services/previews vide. Abonnement Convex null et logique du dashboard officiel identifiant Free ; quotas inclus documentés. Les demandes historiques de connexion Render et de relevé du plan Convex ne sont plus à reprendre. Le CLI/modèle API Render n’expose pas plan, moyen de paiement ni quotas restants ; page Billing à contrôler pour respecter le budget nul. Le frontend sera créé et recetté par 1.5.

- source_plan: `/home/ubuntu/macrova/_bmad-output/initiative-macrova/epic-socle/story-choix-et-preparation-de-lhebergement-isole-plan.md`
  summary: Résolution des prérequis de 1.7 : accès Render/Convex, régions et budgets vérifiés ; seule la remise du frontend et la recette HTTPS restent à réaliser par 1.5.
  evidence: Preuve Billing fournie par le propriétaire le 6 octobre 2026 : Hobby sans carte ni charges, quotas inutilisés de 750 h Free, 5 GB de bande passante, 500 min pipeline, 25 services et 2 domaines. Les demandes historiques de contrôle Billing et de connexion fournisseur sont résolues ; ne pas les reprendre comme blocages. Conserver Free sans ajout de carte ou supplément et surveiller les quotas partagés avant publication. Aucun frontend distant créé par la préparation.

## Résolution de clôture du socle — 7 octobre 2026

- **Portabilité BMad résolue par 1.6** : `_bmad/render/` est désormais ignoré
  et retiré du suivi Git, sans modifier ni supprimer les snapshots locaux.
  La [politique de régénération](../../_bmad/README.md) décrit l’entrée depuis
  les skills installés dans chaque checkout. L’entrée historique de 1.1 est close.
- **Reports de 1.7 résolus** : accès, régions et budgets sont vérifiés dans le
  [plan de préparation](epic-socle/story-choix-et-preparation-de-lhebergement-isole-plan.md).
  La livraison HTTPS et sa recette 6/6 sont prouvées par le
  [plan de livraison 1.5](epic-socle/story-livraison-ssr-isolee-et-parcours-integre-plan.md)
  et la [fiche effective](../../app/docs/livraison-ssr-test.md).
  Les cinq entrées successives ci-dessus sont closes ; elles restent conservées
  pour retracer les contrôles et ne doivent plus être reprises comme obstacles.
- État de clôture historique, antérieur à la rétrospective : les plans des autres stories ne conservaient aucun défaut applicatif établi.
  Le cron distant de supervision attend une publication explicite selon
  [1.8](epic-socle/story-reprise-et-exploitation-du-socle-plan.md) ; cette limite
  documentée et les validations produit avant lancement restent distinctes
  des dettes de nettoyage du socle.

## Réconciliation supervision — 7 octobre 2026 (A6)

Le report « cron à publier » ci-dessus est résolu : workflow socle-monitor
actif et trois exécutions `schedule` réussies, dont
[37627836923](https://github.com/ecourn/macrova/actions/runs/37627836923)
créée à 13:21:25 UTC sur `26dc7a76a1f17ce8cad1b000837ba256c4146d73`.
Voir le [relevé d’exploitation](../../app/docs/exploitation-socle.md).
Les défauts A1/A2 et la lacune A3 découverts ensuite sont traités par le
[plan de remédiation](plan-corriger-actions-retrospective-socle.md).

- source_plan: `plan-corriger-actions-retrospective-socle.md`
  summary: Confirmer la réception humaine des alertes GitHub d’échec du socle par le propriétaire du dépôt.
  evidence: Cron actif vérifié, mais aucune notification du dépôt ni aucun échec disponible ; préférences de souscription non lisibles (HTTP404/portée notifications). Valider lors d’un incident réel ou d’un test du canal explicitement autorisé, sans confondre réussite du cron et réception humaine.

## Actions maintenues après clôture de l’épic socle — 7 octobre 2026

Decision: la clôture de `epic-socle` conserve les six actions ouvertes de la
[rétrospective](epic-socle/epic-socle-retrospective.md), section « Action items —
état courant (phase 4) ». Elles restent différées ; aucun correctif ni engagement
humain n’est déclaré réalisé par cette clôture. Les responsables ci-dessous sont
des rôles proposés. A1/A2/A3/A6 sont clôturées selon les preuves de la rétrospective.
L’entrée de notification ci-dessus correspond à A6b et n’est pas une septième action.

| ID | Action et preuve attendue | Responsable proposé |
| --- | --- | --- |
| A4 | Borner l’attente JWT, transport et corps compris ; vérifier qu’un flux bloqué produit UNAVAILABLE avec un test synthétique. | Propriétaire socle auth/SSR |
| A5 | Partager le prédicat UTC pour capturedAt et density.capturedAt ; tester la borne Date et son dépassement dans le domaine et le transport Convex, avant adoption par le catalogue. | Propriétaire domaine partagé et catalogue |
| A7 | Clarifier la version du contrat de fermeture et son évolution compatible avant consommation par les demandes de données, sans migration implicite. | Architecte et propriétaire demandes de données |
| A6b | Prouver la réception humaine d’une notification d’échec lors d’un incident ou d’un test de canal autorisé ; consigner une preuve datée sans données sensibles. | Propriétaire dépôt/exploitation |
| A8 | Compter les appels /api/query en mode valid et leur absence en empty/blank ; mesurer les logs après chaque abandon. Les assertions doivent échouer si l’appel ou le log ciblé disparaît. | Propriétaire vérification SSR |
| A9 | Libérer explicitement le corps 5xx rejeté sans retarder la réponse sanitizée ; vérifier un corps ouvert et un échec d’annulation. | Propriétaire socle auth/SSR |

Les validations de lancement et la reprise cloud complète de production restent
hors de cette clôture, conformément au périmètre accepté de la rétrospective.

- source_plan: `_bmad-output/initiative-macrova/epic-calculateur/story-documenter-et-valider-la-methode-estimative-plan.md`
  summary: Réception effective de la décision du responsable sur la méthode estimative v1 toujours nécessaire à l'acceptation finale de 2.1.
  evidence: Revue quick de reprise du 7 octobre 2026 ; validation.md conserve identité, rôle, date et preuve absents. Formulaire décision-responsable préparé et non signé ; condition externe préexistante conservée dans 2.1, aucune autorisation de 2.2.

## Résolution de gouvernance — 8 octobre 2026

Le report historique demandant une décision externe pour 2.1 est clos par remplacement explicite de l’exigence, pas par réception d’une signature. Décision produit v1 sourcée adoptée sous mandat utilisateur ; 2.2 autorisée. Essais du support d’enquête possédés par 10.2 avant collecte et vérifications de remise par 10.5/10.7 ; ils ne bloquent pas le développement.

Les rôles proposés A4/A5/A7/A8/A9 désignent désormais des responsabilités de l’agent dans le binôme ; A6b requiert la réception réelle par l’utilisateur. Les actions techniques et leurs preuves restent ouvertes, à traiter lors du changement de leur zone ou avant consommation du contrat concerné ; aucun résultat d’essai n’est inventé par la réattribution.

## Suivi calculateur — 9 octobre 2026 après actions immédiates

Source canonique : [rétrospective calculateur](epic-calculateur/epic-calculateur-retrospective.md),
« Actualisation du 9 octobre 2026, après exécution R1/R5 » ;
[plan](plan-actions-immediates-r1-r5.md). Les passages antérieurs restent
historiques. R1 est close par 6/6 tests du véritable rendu et mutation
5 échecs / 1 témoin réussi avec restauration exacte. R5 est close dans la
portée locale préparée : commande isolée, 25/25 E2E avant build code 0,
ports finaux libres, collisions et arrêt ciblé vérifiés ; échecs et limites
conservés dans la recette. Le premier clic sur Vite froid n'est pas validé.

| ID | État et condition de reprise | Responsable |
| --- | --- | --- |
| R2 | Ouvert, avant ouverture publique : proposer/appliquer la grammaire UUIDv4 au collecteur calculateur, vérifier refus HTTP/mutation, UUID livré et replay dédupliqué ; préserver identifiants privés. | Agent backend/contrats |
| R3 | Ouvert, avant consommation de cibles externes : vérifier exactement 4P+4G+9L=E dans le validateur, refus 2000/75/200/80 et vecteurs valides inchangés. | Agent domaine partagé |
| R4 | Ouvert, avant affirmation d'accessibilité vérifiée : lecteur d'écran avec audio et appareil mobile avec clavier virtuel, labels/erreurs/annonces/édition/confirmation, visibilité et conservation des saisies ; consigner outils et observations réelles. | Utilisateur pour observations ; agent préparation et consignation |

R2/R3/R4 ne sont pas réalisés par R1/R5. Les six reports du socle gardent
leurs conditions précédentes. Aucune preuve auth, cloud ou certification
accessibilité nouvelle n'est annoncée.

Finalisation R1/R5 du 9 octobre 2026 : revue quick terminée, défaut de nettoyage
d'un enfant détaché après disparition du parent corrigé et revérifié sans
nouveau constat. Recette finale `macrova-calculator.lknABqFI` : 25/25 E2E puis
build code 0 (16:24:25–16:24:29 UTC), ports libres ; 418/418 tests, typage et
check sans diagnostic. Aucun report supplémentaire ; R2/R3/R4 restent ouverts.

## Clôture du calculateur — 9 octobre 2026

Decision: à la demande de l’utilisateur, l’[epic calculateur](epic-calculateur/epic-calculateur.md#clôture--9-octobre-2026)
est clôturé `done` avec huit stories terminées et le verdict de rétrospective
`accepted-with-open-items` conservé. **R2, R3 et R4 restent ouverts**, avec
les responsables, conditions de reprise et preuves attendues du tableau
« Suivi calculateur » ci-dessus. R1/R5 restent clos dans leur portée documentée.
La clôture ne réalise aucun de ces reports et n’autorise pas l’ouverture
publique ; celle-ci reste possédée par `epic-validation-lancement`.

## Stratégie MVP — 10 octobre 2026

Decision: [MVP sans enquête préalable](change-mvp-sans-enquete/change-mvp-sans-enquete.md). Les tâches de support et collecte 10.2/10.5/10.7 mentionnées plus haut sont retirées du chemin critique, sans essais déclarés réussis. R2, R3, R4 et tous les reports techniques du socle restent ouverts selon leurs échéances ; ne pas les supprimer au motif de cette simplification. Audit technique désormais 3.1, retours post-livraison facultatifs.
