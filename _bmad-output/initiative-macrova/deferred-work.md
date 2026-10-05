# Travaux différés

## Deferred from: code review of story-parcours-public-et-session-sur-environnement-isole-plan (2026-10-05)

- Portabilité des snapshots BMad (low, blind-hunter) : les instructions versionnées dans `_bmad/render/bmad-build/` référencent des chemins absolus sous `/home/ubuntu/macrova` et `/home/ubuntu/.agents/skills`. Définir la politique de régénération ou de versionnement pour les autres checkouts. Différé car cela modifie les instructions d’agents et leur génération, hors correctifs applicatifs du ticket 1.1.

- source_plan: `_bmad-output/initiative-macrova/epic-socle/story-choix-et-preparation-de-lhebergement-isole-plan.md`
  summary: Remettre les accès Render et la preuve du frontend HTTPS associé au backend de test pour satisfaire l’acceptation de 1.7.
  evidence: Aucun accès Render local ou connecté ; la revue quick confirme que localhost ne satisfait pas la remise distante. Connexion du compte fournisseur nécessaire, puis publication prévue par 1.5 et relevé de région/plan Convex. Ne pas clôturer 1.7 avant cette preuve.
