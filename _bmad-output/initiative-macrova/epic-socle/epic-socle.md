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

- Unknown historique (5 octobre 2026): région, hébergeur frontend, coûts et restauration restaient à définir. Leur résolution pour le test est consignée ci-dessous ; les limites numériques demeurent des hypothèses à éprouver.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire.
- Decision: 2026-10-05 — tracer initial : page publique → connexion SSR → lecture Convex privée sur backend dev isolé ; réutiliser le socle existant plutôt que recréer l’authentification.
- Decision: 2026-10-05 — séquence conservatrice des huit stories : elles partagent domaine, schéma, configuration et intégration ; pas de lanes concurrentes annoncées.
- Decision: 2026-10-05 — validations de chaque story incluses dans son Verify ; pas de suite finale séparée pour le socle, les parcours auth réels existent déjà.
- Decision: 2026-10-05 — checkpoints désactivés par défaut pour respecter la délégation ; hitl reste explicite pour les accès et interventions de compte réellement nécessaires.
- Decision: 2026-10-05 — aucun module métier ni choix nutritionnel, politique commerciale ou conformité n’est livré par cet epic ; contrats communs et décisions partagées restent régis par la spine.
- Decision: 2026-10-05 — validation indépendante : séparer choix d’hébergement, publication SSR et exercice de reprise ; préciser les sorties communes consommées par les stories dépendantes.

## État livré — réconciliation du 7 octobre 2026 (A6)

L’infrastructure de test est livrée : **Render Free Frankfurt**, SSR Nitro sur
https://macrova-socle-test.onrender.com, **Convex Free**
`dev:dazzling-puffin-856` en `aws-us-east-1`, budget de dépense nouvelle **0 €**.
La publication backend puis frontend et la recette HTTPS sont consignées dans
la [fiche de livraison](../../../app/docs/livraison-ssr-test.md).
La [preuve de reprise](../../../app/docs/exploitation-socle.md) établit une
restauration locale des tables racine, la préservation des IDs/fermetures et le
retour du frontend SSR historique. Le cron GitHub est actif et ses exécutions
planifiées réussies sont vérifiées ; réception humaine des alertes non établie.

Ces décisions résolvent les inconnues du **test**, sans adopter les régions,
coûts, RPO/RTO, SLA, sauvegardes durables ou restauration cloud complète de
**production**. Une perte totale du composant auth et les conditions de
lancement restent à vérifier séparément. Ce complément ne modifie pas les
critères Done when ni le verdict historique de la rétrospective.
