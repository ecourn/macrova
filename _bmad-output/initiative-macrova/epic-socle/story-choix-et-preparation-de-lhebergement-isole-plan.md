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

## Review Triage Log

Revue quick indépendante : 1 constat medium, 0 high, 0 low, 0 false, 0 maybe-false. Acceptation distante non satisfaite : fiche sans URL Render ni accès remis. Constat confirmé ; route defer pour dépendance externe de compte, sans fermeture du ticket ni annonce de résultat distant. Correction documentaire déjà présente : préparation et acceptation distinguées. Le statut built décrit l’artefact documentaire revu, pas une story done. Les angles thorough sont omis sur cette route documentaire oneshot.

- Revue quick de reprise, 2026-10-06 — medium / defer / carried : `app/docs/hebergement-test.md`, fiche de remise, même constat d’accès fournisseur non vérifié et de frontend HTTPS non livré. Le report précédent reste applicable ; aucune nouvelle déférence de ce constat. La connexion fournisseur demandée au propriétaire est toujours nécessaire, puis la recette relève de 1.5.
- Revue quick de reprise, 2026-10-06 — medium / defer : `app/docs/hebergement-test.md`, régions et fiche de remise, région effective du backend non renseignée malgré la condition d’acceptation sur les régions observées. Constat confirmé par la fiche ; absence de preuve préexistante, non créée par la reprise documentaire. À relever avec l’accès Convex du propriétaire avant de valider la remise ; conserver le déploiement de test actuel.
- Deuxième revue quick, 2026-10-06 — medium / defer / carried : accès Render, workspace/budget et frontend HTTPS toujours absents ; même constat antérieur, preuves inchangées sur ces points. Aucune déférence supplémentaire ; validation de connexion fournisseur en attente.
- Deuxième revue quick, 2026-10-06 — medium / defer : plan commercial et quotas inclus Convex non vérifiés ; les métriques d’usage et limites personnalisées ne prouvent pas le budget. Dépendance préexistante, consignée au registre avec la résolution du contrôle de région.
- Deuxième revue quick, 2026-10-06 — low / patch : registre des travaux différés conservant l’ancien constat de région manquante sans résolution locale. Risque réel de refaire ce contrôle ; correction documentaire directe par ajout d’une entrée de suivi indiquant aws-us-east-1 vérifié et les seuls plan/quotas restant ouverts. Entrées historiques conservées selon le workflow.

## Verification

- Lire la décision contre AD-10 et les contrats des tickets 1, 5, 7 ; vérifier liens locaux et absence de secrets.
- `bun run check` depuis app : sortie 0, aucun diagnostic.
- Revue quick indépendante de la documentation et de l’acceptation restante.
- Accès frontend distant et région backend : non vérifiés tant que le fournisseur n’est pas connecté ; conserver cette limite dans le résultat.

Résultats : `bun run check` depuis app, sortie 0, 124 fichiers, zéro erreur et avertissement. Liens locaux valides ; `git diff --check` sortie 0. Aucun code exécutable modifié, aucun backend publié, aucun secret copié. Le premier essai de check à la racine a échoué faute de manifeste ; la commande requise a ensuite été exécutée depuis app. Le plugin Render disponible a été suggéré, sans installation ou connexion confirmée. Reste obligatoire : accès Render autorisé, relevé région/plan backend et recette distante après publication par 1.5. Ne pas marquer le ticket done avant ces preuves.

Reprise du 2026-10-06 : recherche fournisseur confirmant Render non installé ; suggestion d’installation/connexion renouvelée. CLI, variables Render et configurations locales usuelles absents (inspection de présence uniquement, aucune valeur de secret affichée). Le navigateur T3 a explicitement signalé son indisponibilité à `status` puis `open`. Aucun accès distant authentifié, workspace, dépôt autorisé ou service ne peut être déclaré vérifié. Intervention du propriétaire nécessaire pour la connexion ; livraison 1.5 non lancée. Contrôles documentés dans `app/docs/hebergement-test.md`.

Vérification de reprise : `bun run check` depuis `app/`, sortie 0, 124 fichiers, aucun diagnostic ; liens locaux valides ; `git diff --check`, sortie 0. Revue quick indépendante : deux constats medium de dépendances externes restantes (accès/recette distante et région backend), aucun défaut de code identifié. Artefact documentaire revu ; objectif d’accès réel non atteint et ticket non déclaré done.

Poursuite autonome : `render --version` confirme v2.28.0 ; inventaire des workspaces refusé faute de connexion. `render login` lancé, attend l’autorisation du propriétaire dans son dashboard (aucun navigateur authentifié Render disponible). GitHub confirme dépôt public et droits ADMIN ; `git ls-remote` sans credential helper confirme main distante `8468aa47f06aaf1a4db9e73567d19305e4b4cda2`, sans push. API de gestion Convex authentifiée : dazzling-puffin-856, type dev, référence dev/socle-auth-tests, région aws-us-east-1, projet macrova 3148832. CLI usage ciblé : 249 appels/mois ; limites personnalisées : []. Le constat de région manquante est résolu ; l’entrée de déférence initiale est conservée comme historique. Plan et quotas commerciaux encore non vérifiés. `bun run check` relancé après documentation de ces résultats : sortie 0, aucun diagnostic. Aucun secret affiché, aucun service créé, aucun backend modifié.

Résultat final de revue : prérequis Git et outillage local résolus ; région et accès Convex vérifiés. Dépendances restantes clairement distinguées : autorisation Render, contrôle workspace/budget/inventaire, plan et quotas Convex, puis recette HTTPS de 1.5. Le statut built porte sur la préparation documentaire, pas sur l’accès fournisseur demandé ni sur la fermeture du ticket. Contrôles locaux après correction du registre : check applicatif et liens locaux valides, diff sans erreur.
