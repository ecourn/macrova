---
title: 'Corpus reproductible et audit Open Food Facts'
type: 'feature'
ticket: '1'
created: '2026-10-10'
status: 'built'
baseline_revision: 'a7356935f43691944990d2af45bc20c11ed5bf4d'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-a08c323d/app/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-a08c323d/_bmad-output/spec-macrova/protocole-validation.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-a08c323d/_bmad-output/spec-macrova/regles-repas.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-a08c323d/_bmad-output/initiative-macrova/epic-catalogue/epic-catalogue.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La story 3.1 doit instruire CAT-1/CAT-2/CAT-3 : disponibilité réelle, complétude et limites d’OFF inconnues avant gel du catalogue.

**Approach:** Livrer un manifeste technique de cinquante recherches distinctes, leurs captures OFF réelles horodatées et contrôlées par SHA-256, un replay déterministe hors réseau, des tests négatifs séparés et une décision sourcée avec références de repas pour la démonstration.

## Boundaries & Constraints

**Always:** Français ; corpus technique sans représentativité ni filiation terrain ; quatre nutriments kcal/P/G/L ; null distinct de zéro ; contrat commun v1 ; six décimales et plafond 1 000 000 sans arrondi implicite ; base g/ml explicite, densité sourcée pour conversion, états non assimilés ; provenance et attribution OFF. Conserver les captures et leurs erreurs, documenter version/commande/révision/date/attendu/observé/limites. Aucun secret ni identifiant utilisateur envoyé.

**Never:** Inventer une disponibilité, nutrition, densité ou validation moteur ; gonfler les 50 par des fixtures négatives ; collecter des données utilisateur ; ajouter un catalogue complémentaire ; prétendre clore CAP-3 ; modifier UI, schéma Convex, droits ou contrat nutritionnel. Aucun push ni publication.

**Decisions déléguées:** Utiliser des recherches techniques alimentaires variées justifiées par le protocole et, pour les marques, par les pages OFF. Lire les sources officielles actuelles ; documenter licences et conditions, sans certification juridique. Audit ponctuel en lecture seule de la base réelle ; simulations sur captures hors réseau. Séparer cette observation de la configuration staging recommandée pour le futur adaptateur applicatif. Budget conservateur ≤ 8 recherches/minute, User-Agent identifié par URL du dépôt réel à vérifier ; suspendre sur 429/503, respecter Retry-After, pas de retries automatiques. Les quantités/bornes/pas de repas sont décisions techniques de référence de l’agent, explicitement distinctes d’une recommandation alimentaire. Choisir des exemples complets disponibles ou consigner une limitation compatible CAP-3 sans masquer le blocage.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Comportement attendu | Erreur |
|---|---|---|---|
| Réponse complète | Quatre valeurs, base connue | Snapshot calculable et provenance | Aucune |
| Absence / zéro | Valeur absente puis valeur 0 | null bloque ; zéro conservé | MISSING_NUTRITION |
| Base / conversion | Base ambiguë ou g/ml sans densité | Aucun calcul arbitraire | AMBIGUOUS_BASIS / MISSING_DENSITY |
| États | cru, cuit, inconnu | Seule preuve source justifie état ; requête ne vaut pas preuve | Inconnu explicite / incompatibilité visible |
| Numérique | >6 décimales, exposant, dépassement, négatif | Rejet sans arrondi ; plafond exact accepté | INVALID_DECIMAL |
| Disponibilité | Liste vide, timeout, 429/503, capture ancienne | Aucun résultat distinct d’indisponible et ancien | Raison et date conservées |
| Intégrité / replay | Capture altérée ou replay répété | Empreinte vérifiée ; résultat identique sans réseau | Échec explicite |

</frozen-after-approval>

## Code Map

- `app/src/domain/contracts.ts`, `decimal.ts`, `food.ts` : contrat v1, parseDecimal, checkCalculability, calculatePortion à réutiliser ; ne pas redéfinir les limites.
- `app/src/domain/food.test.ts`, `food.fixtures.ts` : cas négatifs existants, à compléter par tests du normaliseur d’audit.
- `_bmad-output/spec-macrova/spec-macrova.md` et compagnons : CAP-3 et protocole ; architecture AD-3/8/12, socle livré dans `epic-socle/story-contrat-nutritionnel-et-numerique-versionne-plan.md`.
- Aucun adaptateur catalogue actuel ; audit local autonome, aucune fonction backend livrée.
- Endpoint v2/search testé : `search_terms` paraît ignoré (résultats sans rapport), ne pas l’adopter sans preuve. `cgi/search.pl?search_terms=...&search_simple=1&action=process&json=1` testé avec résultats avoine pertinents. Consigner ce constat et le statut/version de l’API ; vérifier documentation officielle et choix endpoint.

## Tasks & Acceptance

**Execution:**
- [x] `_bmad-output/initiative-macrova/epic-catalogue/audit-off-v1/manifest.json` — cinquante cas avec id, requête exacte, catégorie, marque, état/base recherchés ou inconnus, justification/source et attendu sans disponibilité supposée ; inclure bruts, produits France, cru/cuit/inconnu, liquides, incomplets et recherche sans résultat.
- [x] `app/scripts/audit-off.ts` et modules proches — CLI capture séparée du replay ; métadonnées requêtes/produits, corps conservé avec empreinte, budget, suspension, validation manifeste et intégrité ; sortie déterministe par cas et produit, raisons détaillées. Éviter la perte de précision lors du parsing des valeurs source ; conserver lexèmes numériques utiles ou parser sans arrondi.
- [x] `app/scripts/audit-off.test.ts` — couvrir toute la matrice, réponse malformée, pertinence des résultats et unités ; fixture synthétique clairement séparée.
- [x] `audit-off-v1/captures/`, `classification.json` — exécuter réellement 50 recherches distinctes avec budget ; conserver les observations et vérifier deux replays identiques hors réseau, plus test d’empreinte altérée.
- [x] `audit-off-v1/sources.md`, `README.md`, `decision.md`, `repas-reference.json` — sources officielles datées, licences/attribution, matrice exhaustive, chiffres observés, échecs et actions ; repas 3–6 aliments issus de captures avec unités cohérentes et quantités/contraintes techniques ; vérification exacte par domaine sans revendiquer solver livré. Mettre à jour les preuves et tâches du présent plan, sans modifier tickets.

**Acceptance Criteria:**
- Étant donné le manifeste, quand on le valide, alors exactement 50 identifiants et requêtes uniques sont justifiés et toutes les catégories requises apparaissent.
- Étant donné les captures réelles, quand le replay s’exécute hors réseau deux fois, alors les classifications sont identiques et chaque résultat possède trace requête/date/statut/source/empreinte ; une altération échoue.
- Étant donné la matrice et les cas négatifs séparés, quand les tests s’exécutent, alors toutes les protections nutritionnelles et états réseau sont vérifiés sans valeur inventée.
- Étant donné les observations, quand on lit la décision et les repas, alors chaque cas a statut/raison/action et chaque référence alimentaire renvoie à une capture ; limites de couverture, ouverture publique et moteur restent explicites.

## Implementation Notes

- Audit autonome livré dans `app/scripts/audit-off*.ts` ; domaine v1 réutilisé sans changement de contrat, UI ou Convex. Vitest inclut explicitement le test d’audit.
- Cinquante captures principales distinctes : 47 HTTP 200, 3 HTTP 503 préservés. CLI suspendue avec verrou sur 429/503, reprises manuelles datées et délai≥60s sans Retry-After. Première panne et projection erronée restent dans `audit-off-v1/attempts/`.
- Documentation actuelle confirme absence de texte libre v2/search ; legacy intermittent. Alternative officielle Search-a-licious API 0.1.0 tracée, projectionCSV corrigée après observation de réponses limitées. Source/base absente et ancienneté d’index restent des limites, jamais complétées implicitement.
- Trois lectures produit v3.6 distinctes de codes retournés : mapping explicite nutrition.aggregated_set.per/value/unit/source packaging, sans computed/estimate ; tofu complet, amandes précision excessive, yaourt obsolete=on. Filiation par SHA dans products/ et enrichment-classification.json.
- Matrice50 cas, décision datée, attribution/conditions, deux références techniques 3/6 aliments sourcées et contraintes d’agent explicites. Une démo de repas habituel/portions plausibles et le solver restent à vérifier dans les epics suivants ; CAP-3 n’est pas clôturé.

## Plan Change Log

- 2026-10-10 — choix de méthode opérationnel délégué : recherches legacy puis Search-a-licious officiel après503 réels, observations/échecs conservés, budget inchangé. Projection répétée corrigée en CSV puis recontrôlée manuellement ; aucun changement d’intention/périmètre gelé.

## Review Triage Log

Revue quick indépendante : high=0, medium=2, low=0, false=0, maybe-false=0.

| Constat | Verdict / route | Preuve / action |
|---|---|---|
| JSON numérique invalide accepté par parseLossless | medium / patch | Reproduction Bun : `{"x":01}` accepté ; validation JSON avant conservation des lexèmes, avec test de réponse alimentaire malformée. Correction appliquée : validation originale via JSON.parse avant conservation des lexèmes, trois régressions alimentaires ; aucun changement du corpus. |
| Préparation nutritionnelle v3.6 ignorée | medium / patch | Reproduction Bun : riz nommé cru avec agrégat `preparation: prepared` classé utilisable ; bloquer les préparations différentes de `as_sold` dans cet adaptateur conservateur et ajouter cas négatif. Les captures réelles sont `as_sold` ; aucune assimilation d’état autorisée. Correction appliquée : reason UNSUPPORTED_PREPARATION, valeurs non consommées, tests prepared/as_prepared/absent. |

## Verification

Depuis `app/` : `bun run check` (zéro erreur/avertissement), `bun run typecheck`, `bun run test`, commande replay documentée (résultat identique aux classifications versionnées). Commande capture documentée séparément, non exécutée par tests. Vérifier corpus/captures/repas via test automatisé hors réseau et garder la sortie des contrôles dans le dossier.

Preuves du 10 octobre 2026 : [audit-off-v1/verification.md](audit-off-v1/verification.md) et sorties versionnées. `bun run check` :169 fichiers, zéro diagnostic, sortie 0 ; `bun run typecheck` : sortie 0 ; `bun run test` :25 fichiers/455 tests passent (37audit). Deux replays byte-identiques et identiques à classification.json, SHA256 `3b88500b6eda909d9147d958e98e94eec2a9164c742f47529c50264f5037debb`. Altérations de capture réelle et références échouent explicitement ; replay interdit le réseau. Références3/6vérifiées exactement avec bornes/pas/verrou/unités/filiation. Aucun ticket modifié, aucun push/publication.

### Vérification finale après revue

Le 2026-10-10T09:13:17.475586+00:00 : 25 fichiers / 461 tests passent (43 audit) ; `bun run check` : 169 fichiers, zéro erreur/avertissement, sortie 0 ; `bun run typecheck` sortie 0. Deux replays identiques aux classifications et enrichissements versionnés. Matrice entièrement couverte par les tests exécutés ; deux constats medium corrigés, aucun report. Workflow achevé selon délégation utilisateur ; commit local sans push. Le statut built concerne 3.1, pas la clôture de CAP-3 ; tickets inchangés.
