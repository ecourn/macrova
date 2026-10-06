---
title: 'Choix et préparation de l’hébergement isolé'
type: 'chore'
ticket: 7
created: '2026-10-05'
status: 'built'
baseline_revision: '9e3b1e10fc3fef90e89bf6fe2827156c21ea71d1'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['app/AGENTS.md', 'app/README.md', '_bmad-output/initiative-macrova/architecture-app/architecture-app.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le ticket 1.7 doit fournir au ticket 1.5 une décision d’hébergement SSR, un budget, des régions et des accès de test identifiables. Le backend synthétique du ticket 1 existe ; aucun accès Render n’est configuré.

**Approach:** Documenter Render Web Service Free à Francfort, la séparation des variables, l’ordre backend puis frontend, les prérequis Nitro et la recette de remise des accès. Budget autonome retenu : aucune dépense ; aucun changement de compte payant. Réutiliser le backend dédié existant sans prétendre connaître sa région. La délégation de l’utilisateur vaut résolution des choix et poursuite sans checkpoint intermédiaire. L’ouverture de compte et sa connexion ne peuvent être inventées ; consigner distinctement préparation achevée et acceptation distante restante.

**Acceptation :** Étant donné le socle existant, lorsque le responsable consulte la décision, alors hébergeur, régions cibles et observées, budget, variables et livraison sont documentés. Étant donné un compte fournisseur autorisé, lorsque les accès de test sont remis, alors le responsable accède au frontend HTTPS et au backend associé, sans secret versionné et sans données réelles. Cette seconde condition exige une connexion fournisseur réelle et la livraison du ticket 1.5 ; elle ne sera pas annoncée réussie par cette préparation.

</frozen-after-approval>

## Implementation Notes

Route oneshot : documentation seulement, moins de 100 lignes applicatives ; l’adaptateur et la publication appartiennent au ticket 1.5, qui dépend de 7. Réutiliser app/README.md (backend dev dédié, auth POST/SSR), app/vite.config.ts (sans adaptateur de production), app/package.json et bun.lock. Ne modifier ni identité Convex, ni domaine, ni UX, ni ticket. Les instructions de la story 1 confirment dazzling-puffin-856 et comptes synthétiques ; elles ne prouvent pas la région ni un frontend distant. Sources officielles consultées le 2026-10-05 : TanStack hosting, Render free/regions/deploys, Convex regions/pricing. Pas de clé ou configuration CLI Render disponible ; plugin Render trouvé mais non installé/connecté, suggestion émise. Les choix sont pris selon la délégation ; l’accès de compte reste une dépendance externe.

## Plan Change Log

- 2026-10-06 — Reprise demandée pour résoudre les prérequis Render avant 1.5. Ajout d’un contrôle d’accès séparé de la recette après publication : workspace et budget, autorisation du dépôt `ecourn/macrova`, inventaire du service existant, accès et région Convex. Conserver la décision Render Free Frankfurt, le budget nul et la séparation des secrets. Aucune publication ni création distante sans accès réel ; le frontend déjà publié n’est pas un prérequis à sa propre livraison.
- 2026-10-06 — Délégation renouvelée, voie CLI choisie sans nouvelle question. Installation locale officielle de Render 2.28.0, SHA-256 vérifié ; échec du téléchargement HTTP direct puis succès via GitHub. Dépôt public lisible anonymement, accès GitHub ADMIN confirmé. Accès Convex existant utilisé en lecture pour vérifier déploiement, projet, région et usage. KEEP : ne pas changer le backend, ne pas publier 1.5 avant contrôle du workspace et budget Render, ne pas stocker de jeton ou lien d’autorisation temporaire dans Git.
- 2026-10-06 — Autorisation CLI reçue et vérifiée : accès au workspace My Workspace, tea-db2fsavlot8c73f24nr0, sélection locale et inventaire API vide, previews incluses. Abonnement Convex lu par l’endpoint GET utilisé par le dashboard officiel : null ; Free confirmé par la logique FreePlan, quotas documentés depuis la grille officielle. Connexion fournisseur et plan Convex ne sont plus des obstacles. Budget Render encore non vérifié : ni CLI ni modèle Owner de l’API n’exposent facturation/quotas ; demande factuelle sur Billing adressée au propriétaire. Ne créer aucune ressource avant cette preuve ; frontend et recette restent du ressort de 1.5.
- 2026-10-06 — Preuve Billing fournie par le propriétaire : Hobby, aucune carte, aucune charge, crédit nul, aucune facture, quotas inutilisés (750 h Free, 5 GB bande passante, 500 min pipeline, 25 services, 2 domaines). Budget nul vérifié pour le service Free prévu. Les accès et budgets ne bloquent plus 1.5 ; seule la création/configuration et la recette HTTPS restent à livrer dans 1.5. Ne pas modifier les offres ni ajouter de moyen de paiement.

## Review Triage Log

Revue quick indépendante : 1 constat medium, 0 high, 0 low, 0 false, 0 maybe-false. Acceptation distante non satisfaite : fiche sans URL Render ni accès remis. Constat confirmé ; route defer pour dépendance externe de compte, sans fermeture du ticket ni annonce de résultat distant. Correction documentaire déjà présente : préparation et acceptation distinguées. Le statut built décrit l’artefact documentaire revu, pas une story done. Les angles thorough sont omis sur cette route documentaire oneshot.

- Revue quick de reprise, 2026-10-06 — medium / defer / carried : `app/docs/hebergement-test.md`, fiche de remise, même constat d’accès fournisseur non vérifié et de frontend HTTPS non livré. Le report précédent reste applicable ; aucune nouvelle déférence de ce constat. La connexion fournisseur demandée au propriétaire est toujours nécessaire, puis la recette relève de 1.5.
- Revue quick de reprise, 2026-10-06 — medium / defer : `app/docs/hebergement-test.md`, régions et fiche de remise, région effective du backend non renseignée malgré la condition d’acceptation sur les régions observées. Constat confirmé par la fiche ; absence de preuve préexistante, non créée par la reprise documentaire. À relever avec l’accès Convex du propriétaire avant de valider la remise ; conserver le déploiement de test actuel.
- Deuxième revue quick, 2026-10-06 — medium / defer / carried : accès Render, workspace/budget et frontend HTTPS toujours absents ; même constat antérieur, preuves inchangées sur ces points. Aucune déférence supplémentaire ; validation de connexion fournisseur en attente.
- Deuxième revue quick, 2026-10-06 — medium / defer : plan commercial et quotas inclus Convex non vérifiés ; les métriques d’usage et limites personnalisées ne prouvent pas le budget. Dépendance préexistante, consignée au registre avec la résolution du contrôle de région.
- Deuxième revue quick, 2026-10-06 — low / patch : registre des travaux différés conservant l’ancien constat de région manquante sans résolution locale. Risque réel de refaire ce contrôle ; correction documentaire directe par ajout d’une entrée de suivi indiquant aws-us-east-1 vérifié et les seuls plan/quotas restant ouverts. Entrées historiques conservées selon le workflow.
- Revue quick après connexion et preuve Billing, 2026-10-06 — medium / defer / carried : frontend HTTPS non encore livré, seul constat antérieur restant applicable. La fiche le reporte explicitement à 1.5 ; aucune nouvelle déférence. Les accès et budgets ne bloquent plus la livraison, aucun nouveau défaut documentaire ou règle cassée identifié. Résumé historique clarifié avant verdict final.

## Verification

- Lire la décision contre AD-10 et les contrats des tickets 1, 5, 7 ; vérifier liens locaux et absence de secrets.
- `bun run check` depuis app : sortie 0, aucun diagnostic.
- Revue quick indépendante de la documentation et de l’acceptation restante.
- Vérifier les accès fournisseur, régions, plans, budgets et inventaire existant ; distinguer les preuves CLI/API des éléments Billing fournis par le propriétaire. La recette du frontend distant reste du ressort de 1.5.

Résultats : `bun run check` depuis app, sortie 0, 124 fichiers, zéro erreur et avertissement. Liens locaux valides ; `git diff --check` sortie 0. Aucun code exécutable modifié, aucun backend publié, aucun secret copié. Le premier essai de check à la racine a échoué faute de manifeste ; la commande requise a ensuite été exécutée depuis app. Le plugin Render disponible a été suggéré, sans installation ou connexion confirmée. Reste obligatoire : accès Render autorisé, relevé région/plan backend et recette distante après publication par 1.5. Ne pas marquer le ticket done avant ces preuves.

Reprise du 2026-10-06 : recherche fournisseur confirmant Render non installé ; suggestion d’installation/connexion renouvelée. CLI, variables Render et configurations locales usuelles absents (inspection de présence uniquement, aucune valeur de secret affichée). Le navigateur T3 a explicitement signalé son indisponibilité à `status` puis `open`. Aucun accès distant authentifié, workspace, dépôt autorisé ou service ne peut être déclaré vérifié. Intervention du propriétaire nécessaire pour la connexion ; livraison 1.5 non lancée. Contrôles documentés dans `app/docs/hebergement-test.md`.

Vérification de reprise : `bun run check` depuis `app/`, sortie 0, 124 fichiers, aucun diagnostic ; liens locaux valides ; `git diff --check`, sortie 0. Revue quick indépendante : deux constats medium de dépendances externes restantes (accès/recette distante et région backend), aucun défaut de code identifié. Artefact documentaire revu ; objectif d’accès réel non atteint et ticket non déclaré done.

Poursuite autonome : `render --version` confirme v2.28.0 ; inventaire des workspaces refusé faute de connexion. `render login` lancé, attend l’autorisation du propriétaire dans son dashboard (aucun navigateur authentifié Render disponible). GitHub confirme dépôt public et droits ADMIN ; `git ls-remote` sans credential helper confirme main distante `8468aa47f06aaf1a4db9e73567d19305e4b4cda2`, sans push. API de gestion Convex authentifiée : dazzling-puffin-856, type dev, référence dev/socle-auth-tests, région aws-us-east-1, projet macrova 3148832. CLI usage ciblé : 249 appels/mois ; limites personnalisées : []. Le constat de région manquante est résolu ; l’entrée de déférence initiale est conservée comme historique. Plan et quotas commerciaux encore non vérifiés. `bun run check` relancé après documentation de ces résultats : sortie 0, aucun diagnostic. Aucun secret affiché, aucun service créé, aucun backend modifié.

Résultat historique de la deuxième revue, avant connexion Render : prérequis Git et outillage local résolus ; région et accès Convex vérifiés. Dépendances alors restantes : autorisation Render, contrôle workspace/budget/inventaire, plan et quotas Convex, puis recette HTTPS de 1.5. Le statut built porte sur la préparation documentaire, pas sur la fermeture du ticket. Contrôles locaux après correction du registre : check applicatif et liens locaux valides, diff sans erreur. Les preuves ultérieures ci-dessous résolvent les prérequis fournisseur et budgets.

Après succès de `render login` : `render workspaces -o json` et `render workspace set tea-db2fsavlot8c73f24nr0 -o json --confirm` réussissent. `render services -o json` retourne null ; GET `/v1/services` avec ownerId explicite et includePreviews retourne []. Aucun service existant ni doublon. Configuration CLI privée conservée hors Git ; aucune valeur de jeton affichée. API dashboard Convex GET `/api/dashboard/teams/471593/get_orb_subscription` retourne null ; `FreePlan.tsx` officiel sélectionne Free lorsque l’abonnement est absent. GET get_spending_limits retourne des seuils et un état nuls ; absence de seuils personnalisés seulement. La grille tarifaire officielle fournit les quotas inclus, distincts de l’usage relevé sur le seul déploiement. Budget Render encore non vérifié : CLI et schéma API ne l’exposent pas, navigateur collaboratif explicitement indisponible. Source code officielle consultée en lecture uniquement ; aucune création, dépense, modification de backend ou publication.

Preuve humaine ultérieure du 2026-10-06 : Billing My Workspace Hobby sans carte, sans charges en attente, sans factures ; usage 0/750 heures Free, 0 MB/5 GB bande passante, 0/500 min pipeline, 0/25 services, 0/2 domaines, crédit 0 $. Budget levé, données attribuées au propriétaire et non à une lecture API. Les choix Free sans carte ni supplément respectent le budget nul ; surveiller les quotas partagés avant livraison. Objectif de reprise (résoudre les prérequis d’accès avant 1.5) atteint ; l’acceptation du frontend distant attend légitimement la livraison 1.5. Ne pas déclarer le ticket done avant cette recette.

Résultat actuel : prérequis d’accès et de budget résolus, fiche et registre mis à jour, revue quick indépendante sans nouveau défaut. `bun run check` depuis app : sortie 0, 124 fichiers, aucun diagnostic ; liens locaux valides, `git diff --check` sortie 0. Aucun service créé ni publication, aucun secret versionné. Le ticket 1.5 peut commencer sa livraison sur ce workspace dans le budget documenté ; la remise HTTPS finale reste à réaliser par ce ticket.
