---
title: 'Bun check sans diagnostic'
type: 'chore'
ticket: ''
created: '2026-10-05'
status: 'built'
baseline_revision: '8672814f5b426891fd7f30cbfe43e89ca305994b'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent">

## Intent

Corriger les dix avertissements de masquage de variables dans les composants
Calendar, Carousel, ChartStyle et SidebarProvider sans modifier leur comportement.
Rendre les avertissements bloquants dans le script check et documenter dans
app/AGENTS.md l’obligation de terminer avec zéro erreur et zéro avertissement.
Périmètre approuvé par le « go ahead » de l’utilisateur.

</frozen-after-approval>

## Implementation Notes

- Route courte : renommages mécaniques et consignes de vérification, six fichiers.
- Diagnostic initial : 97 fichiers, zéro erreur, dix avertissements noShadow.
- Renommage des variables du calendrier et des paramètres des callbacks.
- Ajout de --error-on-warnings au script check et de la consigne dans AGENTS.md.

## Plan Change Log

## Review Triage Log

- Revue indépendante rapide : aucun constat, aucun élément différé.

## Verification

- Depuis app, `bun run check` doit terminer avec zéro diagnostic et le code 0.
- `git diff --check` doit terminer avec le code 0.
- Résultat : 97 fichiers vérifiés, zéro erreur et zéro avertissement, code 0.
- Vérification du diff : code 0.
