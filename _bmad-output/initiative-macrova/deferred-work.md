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
