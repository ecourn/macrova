---
type: epic
title: "Socle partagé et livraison maîtrisée"
parent: initiative-macrova
covers: []
risk: high
---

# Socle partagé et livraison maîtrisée

## Description

Le socle existant fournit un parcours public et une session privée fiables dans un environnement de test isolé. Les règles applicables sont AD-1, AD-3, AD-6, AD-9, AD-10, AD-11, AD-12.

## Outcome

La publication backend puis frontend, les secrets et la restauration sont documentés et exercés sur un environnement isolé.

## Requirements

- SOC-1 : environnement isolé, session et parcours SSR vérifiables ; source architecture-app.md, AD-6 et AD-10, et app/README.md, Connexion réelle.
- SOC-2 : domaine pur, FoodSnapshot et décimales versionnés, erreurs et événements communs ; source architecture-app.md, AD-1, AD-3, AD-11 et AD-12.
- SOC-3 : identité backend, propriété, contrat des droits et fermeture durable vérifiés à chaque écriture ; source architecture-app.md, AD-6, AD-7 et AD-9.
- SOC-4 : livraison compatible, secrets isolés, alertes, restauration, régions et budget documentés ; source architecture-app.md, AD-10.

## Done when

1. Le socle existant fournit un parcours public et une session privée fiables dans un environnement de test isolé.
2. Les contrats nutritionnels, erreurs, identité et fermeture de compte ont une définition commune versionnée.
3. La publication backend puis frontend, les secrets et la restauration sont documentés et exercés sur un environnement isolé.
4. Le parcours intégré est vérifié sur le déploiement cible, avec erreurs et accès interdits ; la production publique reste conditionnée aux validations de lancement.

## Boundaries

Socle web, contrats communs et exploitation ; les modules métier sont livrés par leurs epics.

## References

- spec — _bmad-output/spec-macrova/spec-macrova.md, Capabilities, Constraints et Non-goals
- architecture — _bmad-output/initiative-macrova/architecture-app/architecture-app.md
- ux — _bmad-output/ux-macrova/DESIGN.md
- ux — _bmad-output/ux-macrova/EXPERIENCE.md
- règles — _bmad-output/spec-macrova/regles-repas.md
- lancement — _bmad-output/spec-macrova/decisions-lancement.md
- validation — _bmad-output/spec-macrova/protocole-validation.md

## Notes

- Unknown: Région, hébergeur frontend, coûts et restauration restent à définir ; les limites numériques demeurent des hypothèses à éprouver.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
- Decision: 2026-10-05 — tracer initial : page publique → connexion SSR → lecture Convex privée sur backend dev isolé ; réutiliser le socle existant plutôt que recréer l’authentification.
- Decision: 2026-10-05 — séquence conservatrice des huit stories : elles partagent domaine, schéma, configuration et intégration ; pas de lanes concurrentes annoncées.
- Decision: 2026-10-05 — validations de chaque story incluses dans son Verify ; pas de suite finale séparée pour le socle, les parcours auth réels existent déjà.
- Decision: 2026-10-05 — checkpoints désactivés par défaut pour respecter la délégation ; hitl reste explicite pour les accès et interventions de compte réellement nécessaires.
- Decision: 2026-10-05 — aucun module métier ni choix nutritionnel, politique commerciale ou conformité n’est livré par cet epic ; contrats communs et décisions partagées restent régis par la spine.
- Decision: 2026-10-05 — validation indépendante : séparer choix d’hébergement, publication SSR et exercice de reprise ; préciser les sorties communes consommées par les stories dépendantes.
