# Parcours guidé du commit 380d4b7

Cible : `380d4b7` — constituer le corpus reproductible et auditer Open Food Facts.

Parcours terminé ; aucun bloc courant. Les acceptations relèvent de la délégation explicite de l’utilisateur et ne constituent pas une validation humaine indépendante.

- [x] Bloc 1 — Intention — accepté par délégation utilisateur ; contenu inchangé pendant le parcours.
- [x] Bloc 2 — Vue d’ensemble — accepté par délégation utilisateur ; contenu inchangé pendant le parcours.
- [x] Bloc 3 — Collecte — accepté par délégation utilisateur ; contenu inchangé pendant le parcours.
- [x] Bloc 4 — Normalisation — accepté par délégation utilisateur ; contenu inchangé pendant le parcours.
- [x] Bloc 5 — Replay et intégrité — accepté par délégation utilisateur ; contenu inchangé pendant le parcours.
- [x] Bloc 6 — Références de repas — accepté par délégation utilisateur ; contenu inchangé pendant le parcours.
- [x] Bloc 7 — Périphérie — accepté par délégation utilisateur ; contenu inchangé pendant le parcours.

## Bloc 1 — Intention

Texte repris verbatim de la section Intent du [plan de la story](../initiative-macrova/epic-catalogue/story-constituer-le-corpus-reproductible-et-auditer-open-food-fact-plan.md).

**Problem:** La story 3.1 doit instruire CAT-1/CAT-2/CAT-3 : disponibilité réelle, complétude et limites d’OFF inconnues avant gel du catalogue.

**Approach:** Livrer un manifeste technique de cinquante recherches distinctes, leurs captures OFF réelles horodatées et contrôlées par SHA-256, un replay déterministe hors réseau, des tests négatifs séparés et une décision sourcée avec références de repas pour la démonstration.

## Bloc 2 — Vue d’ensemble

Le changement livre un audit local : les observations réseau sont conservées, puis exploitées hors réseau avec le contrat nutritionnel existant. Quatre entrées permettent de suivre le mécanisme et sa conclusion produit.

- [audit-off.ts](../../app/scripts/audit-off.ts) pilote collecte, normalisation et replay des recherches.
- [audit-off-products.ts](../../app/scripts/audit-off-products.ts) conserve les lectures produit v3 et leur filiation.
- [audit-off-meals.ts](../../app/scripts/audit-off-meals.ts) vérifie exactement les références et leurs contraintes.
- [decision.md](../initiative-macrova/epic-catalogue/audit-off-v1/decision.md) traduit les observations en limites et actions pour le catalogue.

## Bloc 3 — Collecte

Chaque recherche dispose d’une requête exacte et d’une capture conservant corps, date, statut et empreinte. Le collecteur impose un espacement minimal de huit secondes, suspend la collecte sur 429/503 et demande une reprise explicite ; les captures principales existantes ne sont pas écrasées.

Le [collecteur](../../app/scripts/audit-off.ts) utilise le [manifeste de cinquante recherches](../initiative-macrova/epic-catalogue/audit-off-v1/manifest.json). Les [captures principales](../initiative-macrova/epic-catalogue/audit-off-v1/captures/) gardent les observations finales, tandis que les [tentatives](../initiative-macrova/epic-catalogue/audit-off-v1/attempts/) et la [trace des reprises](../initiative-macrova/epic-catalogue/audit-off-v1/attempts/resume.md) conservent pannes et projection initiale incomplète.

## Bloc 4 — Normalisation

Le parsing conserve les lexèmes numériques et laisse le contrat commun rejeter précision excessive, exposants et dépassements sans arrondi. Une valeur absente reste distincte de zéro ; base, unité et état doivent disposer d’une preuve source, et la pertinence demeure une heuristique.

Le [normaliseur commun](../../app/scripts/audit-off.ts) prépare les snapshots pour les [règles du domaine](../../app/src/domain/food.ts). Son mapping v3 accepte la source packaging et la préparation as_sold ; le [replay produit](../../app/scripts/audit-off-products.ts) l’appelle après contrôle de filiation, sans substituer une estimation ni assimiler un produit préparé à son état vendu.

## Bloc 5 — Replay et intégrité

Le replay lit cinquante captures sans réseau et vérifie chaque corps par SHA-256 avant de classer les cas : 2 utilisables, 39 à compléter, 6 non pris en charge et 3 indisponibles. Les lectures produit v3 constituent des enrichissements séparés, dont la filiation vérifie l’empreinte de la recherche d’origine.

Le [replay](../../app/scripts/audit-off.ts) produit la [classification](../initiative-macrova/epic-catalogue/audit-off-v1/classification.json). Les [captures produit](../initiative-macrova/epic-catalogue/audit-off-v1/products/), leur [classification d’enrichissement](../initiative-macrova/epic-catalogue/audit-off-v1/enrichment-classification.json) et le [rapport](../initiative-macrova/epic-catalogue/audit-off-v1/decision.md) rendent visible la chaîne recherche, code produit et nutrition exploitable.

## Bloc 6 — Références de repas

Deux références de trois et six aliments contrôlent les calculs exacts, les unités, les bornes, les pas et les quantités verrouillées. Ce sont des vecteurs techniques avec quantités choisies par l’agent ; leur réussite ne démontre ni un repas habituel avec portions plausibles, ni un solver livré.

Les [références sourcées](../initiative-macrova/epic-catalogue/audit-off-v1/repas-reference.json) renvoient aux captures utilisées. Le [vérificateur de repas](../../app/scripts/audit-off-meals.ts) réutilise les [calculs du domaine](../../app/src/domain/food.ts), tandis que la [décision](../initiative-macrova/epic-catalogue/audit-off-v1/decision.md) conserve les limites de démonstration et l’ouverture de CAP-3.

## Bloc 7 — Périphérie

- [vitest.config.ts](../../app/vitest.config.ts) inscrit les tests d’audit dans la suite applicative.
- [audit-off.test.ts](../../app/scripts/audit-off.test.ts) couvre protections, replay, intégrité et références avec fixtures négatives distinctes.
- [sources.md](../initiative-macrova/epic-catalogue/audit-off-v1/sources.md) consigne les sources officielles, l’attribution et les conditions consultées.
- [README.md](../initiative-macrova/epic-catalogue/audit-off-v1/README.md) décrit les commandes de collecte et de replay séparées.
- [verification.md](../initiative-macrova/epic-catalogue/audit-off-v1/verification.md) rattache les preuves historiques aux commandes exécutées.
- [plan de la story](../initiative-macrova/epic-catalogue/story-constituer-le-corpus-reproductible-et-auditer-open-food-fact-plan.md) conserve périmètre, critères et état d’implémentation.
