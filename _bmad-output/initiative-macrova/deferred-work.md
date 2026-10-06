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
