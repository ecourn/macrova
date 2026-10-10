# Validation de l’inception — 10 octobre 2026

Périmètre : clôture explicite de 3.1 demandée par l’utilisateur et inception complète de l’epic 3 à partir de l’audit OFF livré. Arbitrages de découpage délégués, aucun développement applicatif effectué. Estimations désactivées ; neuf entrées nouvelles, aucun fichier leaf tiré et aucun travail démarré.

## Sources et contrôles

Sources ouvertes : spécification CAP-3 et ses compagnons, initiative et arbre, architecture AD-1/3/6/8/9/10/12, DESIGN/EXPERIENCE, plan 3.1 et dossier audit decision/sources/verification. Exploration indépendante du socle et de l’application existante ; contrat FoodSnapshot, gardes, commandes et environnement isolé réutilisables, adaptateur catalogue et corrections restant à construire.

Personnalisations résolues par resolve_customization.py : checks.ticket, checks.set, checks.dependencies, slice_to_tickets, ordering et refinement. Autocontrôle des besoins, collisions, setup et remises, puis validation en lecture seule par un agent indépendant sans historique de conversation. Verdict final après correctifs : validé pour inception, aucun constat bloquant résiduel.

Couverture : CAT-1/2 par 3.1 et recette 3.10 ; CAT-3 par 3.1/3.3/3.7 et décision finale 3.10 ; CAT-4/5/6 par recherche, détails et cache 3.2–3.4 ; CAT-7 par backend/formulaires privés 3.5/3.6 ; CAT-8 par parcours et remise de snapshots 3.2/3.6/3.7 ; CAT-9 par parcours, accessibilité et livraison 3.6/3.8/3.10. Nettoyage 3.9 après toutes les implémentations. Toutes les exigences remontent à CAP-3 ; fonctionnalités et limites numériques restent celles des sources.

## Constats appliqués

- Fix : distinguer gardes interactives de correction et exceptions export/nettoyage AD-6/AD-9 ; propriétaire dérivé du travail durable, export sans droit actif, travail sans session, nettoyage après fermeture et refus de recréation.
- Fix : donner à 3.10 le bilan daté des cas MVP et la décision explicite de gel ou maintien ouvert ; la photographie d’audit ne suffit pas à geler le catalogue applicatif.
- Suggestion appliquée : réduire la charge de 3.2 par réutilisation explicite du contrat/gardes socle et parsing/normalisation audit ; déduplication minimale en vol, cache/reprise générale réservés à 3.4. Décision de conserver ce parcours traversant enregistrée.
- Suggestion appliquée : 3.7 vérifie un produit ancien devenu obsolète à la relecture, refuse une nouvelle sélection et préserve le snapshot antérieurement sélectionné.

## Résultats reproductibles

Depuis la racine :

- `uv run /home/ubuntu/.agents/skills/bmad-ticket/scripts/tickets.py --project-root . status _bmad-output/initiative-macrova/epic-catalogue` : dix stories, une done et neuf planned ; aucun cycle, drift, unpinned_after, undeclared_after ou order_conflict.
- `uv run /home/ubuntu/.agents/skills/bmad-ticket/scripts/tickets.py --project-root . next _bmad-output/initiative-macrova/epic-catalogue` : seule 3.2 dans ready_to_start, aucun ticket à raffiner.
- Lecture TOML et contrôle de couverture : ids 1–10 uniques, descriptions/verify/unknown remplis, CAT-1–CAT-9 définis et couverts, références des entrées existantes.
- `git diff --check` : aucun diagnostic.
- `status` sur toute l’initiative : aucune dépendance non déclarée/non épinglée ou conflit d’ordre ; quatre avertissements préexistants concernent les plans documentaires racine sans champ ticket (`plan-actions-immediates-r1-r5.md`, `plan-corriger-actions-retrospective-socle.md`, `plan-publier-corrections-socle-test.md`, `plan-reutiliser-shadcn.md`), hors de l’epic et laissés inchangés.

L’epic reste in-progress. Ses entrées peuvent être confiées à bmad-build, qui dérive les critères et le plan au démarrage ; aucun tirage/refinement préalable nécessaire pour 3.2. Checkpoints des arbitrages délégués désactivés ; 3.10 hitl pour les éventuels accès humains. Futures dépendances vers epics 4/6/8/9 documentées, à épingler dans leurs stories lors de leur inception ; aucun epic futur détaillé ici. Conditions de diffusion publique et d’ouverture à vérifier par epic 9, aucune activation publique effectuée.
