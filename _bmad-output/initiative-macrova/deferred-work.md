# Travaux différés

## Deferred from: code review of story-parcours-public-et-session-sur-environnement-isole-plan (2026-10-05)

- Portabilité des snapshots BMad (low, blind-hunter) : les instructions versionnées dans `_bmad/render/bmad-build/` référencent des chemins absolus sous `/home/ubuntu/macrova` et `/home/ubuntu/.agents/skills`. Définir la politique de régénération ou de versionnement pour les autres checkouts. Différé car cela modifie les instructions d’agents et leur génération, hors correctifs applicatifs du ticket 1.1.
