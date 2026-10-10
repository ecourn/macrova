---
title: Enrichir et valider les détails produit sourcés
type: feature
ticket: 3
created: 2026-10-10
status: built
baseline_revision: c6f983acee6d9eba40aa58dcfcb31fc39cef303c
route: full
route_source: auto
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - app/AGENTS.md
  - app/convex/_generated/ai/guidelines.md
  - _bmad-output/initiative-macrova/architecture-app/architecture-app.md
  - _bmad-output/ux-macrova/DESIGN.md
  - _bmad-output/ux-macrova/EXPERIENCE.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le détail de 3.2 est un hit de recherche dont l’index peut être ancien et incomplet. La story 3.3 doit relire le produit par son code OFF et fournir un instantané v1 vérifié ou des blocages précis.

**Approach:** Étendre le module catalogue avec une action produit v3.6, normalisation conservatrice partagée, quota produit durable et suspension commune. Relier cette relecture explicite au détail existant pour rendre la fonction utilisable ; garder le hit initial et les dates distinguées, sans remplacement automatique ni sélection calculable nouvelle.

## Boundaries & Constraints

**Always:** Contrat FoodSnapshot v1 et AD-1/3/6/8/10/12 inchangés. Session, ouverture et droit actif vérifiés avant réseau et remise via gardes socle. Réservation/dédup transactionnelles centralisées, plafond glissant 12 lectures produit/minute distinct des 8 recherches ; 429/503 suspendent globalement les deux types, Retry-After respecté sans retry. Endpoint/version/User-Agent configurés côté serveur, requête minimisée au code produit et champs publics, aucun profil/cookie/compte transmis. Seules valeurs explicites packaging de nutrition.aggregated_set, source_per correspondant et préparation as_sold ; aucune valeur computed/estimate, kcal inférée ou fallback nutriments legacy en v3.6. Absence ≠ zéro ; précision/plafond et unités invalides bloquent sans arrondi. Base explicitement prouvée, état inconnu sans assimilation cru/cuit ; aucune conversion g/ml sans densité sourcée. Conserver champs source utiles sans images/identifiants contributeurs, référence OFF, date consultation produit et date index recherche séparées. Produit obsolète non calculable ; réponse invalide, produit absent et panne distingués. Snapshot précédent immuable. Reprise explicite et réponse tardive ignorée dans UI, erreurs backend originales conservées. Réutiliser shadcn local.

**Never:** Cache durable, reprise générale réservations (3.4), corrections privées (3.5/6), sélection/consommateur (3.7), moteur, repas, images, catalogue supplémentaire, push, production ou paiement.

**Décisions déléguées:** L’utilisateur mandate les arbitrages et la poursuite sans checkpoints ; plan approuvé et continuation choisie en son nom. Initiative résolue explicitement par dossier. Tests reproductibles hors réseau avec captures réelles immuables et négatifs synthétiques séparés ; configuration staging autorisée pour essais, production configurable seulement pour lecture réelle explicite selon documentation. Aucun besoin de déployer pour cette slice ; recette cible globale en 3.10. L’action reçoit un code syntaxiquement valide obtenu normalement du hit UI, sans transformer ce contrat en scan/recherche par nom. Une relecture échouée laisse le hit daté lisible mais ne le présente pas comme produit frais. Les protections de préparation/obsolescence doivent être portées par un résultat bloqué explicite, pas seulement checkCalculability du snapshot.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Sortie attendue | Traitement |
|---|---|---|---|
| Enrichissement réel | Captures tofu/amandes/yaourt v3.6, code retourné | tofu complet, précision excessive bloquée, obsolète refusé | Replay hors réseau avec champs/dates |
| Nutrition | quatre null ou zéro, valeurs invalides, source computed/estimate, source_per incompatible | null reste absence, zéro valide, aucun numérique inventé | Blocages ciblés par champ |
| Base/état/conversion | 100g/100ml/ambigu, raw/cooked/unknown, unité différente sans densité | Base/état affichés sans inference ; conversion bloquée | Contrat canonique réutilisé |
| Préparation / schéma | as_sold/autre/absente, aggregate absent, code incohérent, JSON invalide | Blocage ou réponse malformée, aucun fallback nutritionnel | Aucune donnée calculable fausse |
| Réseau / accès | timeout, corps trop grand, HTTP, produit absent, session/droit/fermeture | Aucun snapshot neuf sur panne ; refus avant fetch et remise | Vraie erreur backend préservée |
| Budgets / concurrence | mêmes codes, codes différents, recherches mêlées, 13e produit, 429/503 | Un appel en vol, quotas distincts, suspension commune | Aucun retry automatique |
| Interface / immutabilité | Relecture explicite, panne, autre hit ouvert avant réponse | Nouvelle consultation identifiée séparément, précédent inchangé | Saisie/retour conservés, ancien résultat ignoré |

</frozen-after-approval>

## Code Map

- `app/src/domain/off-normalization.ts` : normalizeProduct/parseLossless audités ; v3.6 aggregate packaging/source_per/as_sold déjà gérés. Attention fallback legacy si aggregate absent et valeurs invalides conservées : enveloppe détail doit neutraliser sans changer classifications audit.
- `app/src/domain/catalogue.ts`, `food.ts`, `decimal.ts`, `contracts.ts` : wrapper recherche sanitise nutrition ; réutiliser validateFoodSnapshot/checkCalculability/calculatePortion et limites canoniques. Ajouter contrat détail et provenance source bornée.
- `app/convex/catalogue.ts`, `catalogueState.ts`, `contracts/catalogue.ts`, `schema.ts`, `convex.config.ts`, `_generated/` : action recherche existante, travaux/participants éphémères, RateLimiter offProduct déjà déclaré mais inutilisé. Étendre type de travail/index quota et résultat sans casser search/tests ni anciens travaux ; génération locale si nécessaire.
- `app/src/components/catalogue-search.tsx`, `src/routes/aliments.tsx` : détail hit existant et focus restauré ; intégrer relecture explicite et état produit séparé, shadcn locaux.
- `app/convex/catalogue.test.ts`, `src/domain/catalogue.test.ts`, `tests/e2e/catalogue.spec.ts` : fixtures/gardes/concurrence/harness UI existants.
- `epic-catalogue/audit-off-v1/products/`, `enrichment-classification.json`, `app/scripts/audit-off-products.ts` : captures immuables et construction URL v3.6 ; replay 3.1 doit rester identique. Documentation officielle consultée le 10 octobre : https://openfoodfacts.github.io/openfoodfacts-server/api/ (v3.6, produit/staging et quotas).

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/catalogue.ts` et tests domaine — contrat et normalisation produit conservatrice avec source/date et blocages.
- [x] `app/convex/catalogue.ts`, `catalogueState.ts`, validateurs/schéma/config/générés — action produit et budgets distincts, dédup/suspension/gardes partagés sans cache.
- [x] `app/src/components/catalogue-search.tsx`, route et tests UI — relecture explicitement déclenchée, rendu français accessible sans remplacement silencieux.
- [x] Tests domaine/Convex/UI et `app/README.md` — couvrir toutes lignes de matrice, replays et configuration/documentation ; consigner preuves dans ce plan.

**Acceptance Criteria:**
- Étant donné un produit issu de recherche, lorsque sa relecture est demandée, alors le détail distingue consultation et index, expose provenance et données source, et fournit un snapshot v1 valide ou ses blocages.
- Étant donné plusieurs comptes et appels concurrents, lorsqu’ils lisent des produits ou rencontrent une suspension, alors les quotas globaux et gardes empêchent les appels interdits et toute remise non autorisée.
- Étant donné un instantané déjà affiché ou retenu, lorsqu’une source change ou échoue, alors son contenu reste inchangé et la nouvelle lecture est un résultat distinct explicitement déclenché.

## Implementation Notes

- Enveloppe `normalizeProductBody` séparée du normaliseur audité : neutralisation explicite des nutriments ET de la base legacy, nutrition v3.6 packaging/as_sold uniquement. Les valeurs invalides deviennent `null` avec blocage ciblé ; les lexèmes publics utiles restent bornés et exposés. Préparation absente/non prise en charge et obsolescence portent `status: blocked`, indépendamment de la calculabilité mathématique du snapshot.
- Action `api.catalogue.product({ code })` et exécution réseau commune avec la recherche : gardes avant réservation/fetch/remise, délai 15 s, lecture 256 000 octets, SHA-256 de la réponse, erreurs backend originales préservées. Staging `.net` avec Basic public OFF `off:off` exclusivement ; production `.org` configurable sans Authorization. Aucun réseau OFF réel ni déploiement effectué.
- Réservations transactionnelles et RateLimiter distincts ; nouvel index type/temps avec compatibilité des travaux recherche sans type, clés historiques inchangées. Déduplication en vol, suspension commune et nettoyage transitoire 90 s conservés.
- UI shadcn locale : bouton de consultation explicite, historique des lectures réussies distinct du hit initial, dates recherche/index/produit différenciées, résultat absent et blocages expliqués ; retour/changement de hit/hors ligne ignorent les réponses tardives. Aucune sélection nouvelle ni remplacement silencieux.
- `bun run convex:codegen` ne peut démarrer sans `CONVEX_DEPLOYMENT` dans ce worktree. Les deux déclarations Env de `convex/_generated/server.d.ts` ont été synchronisées avec la configuration ; API et DataModel dérivent déjà des modules/schéma locaux. Régénérer normalement avant une publication ultérieure, qui reste hors de cette slice.

## Plan Change Log

## Review Triage Log

Revue quick indépendante : 2 constats medium, 0 high/low/false/maybe-false. Les deux relèvent de corrections locales sans nouvelle surface publique.

| Constat | Verdict | Route | Preuve et résolution |
| --- | --- | --- | --- |
| Messages de blocage fusionnant les nutriments dans `catalogue-search.tsx` | medium | patch | Les suffixes transmis par le domaine sont supprimés par reasonText puis dédupliqués ; deux nutriments invalides deviennent un seul message non ciblé. Conserver leurs noms français et vérifier deux erreurs simultanées dans le navigateur. |
| HTTP 404 annoncé absent sans vérification dans `catalogue.ts` | medium | patch | La branche retourne missing avant la lecture du corps, même HTML/vide ; le test existant confirme ce comportement. Passer les 404 produit par la lecture bornée et la validation de l’enveloppe OFF/code avant absence, avec tests négatifs. |

## Verification

Depuis `app/` : `bun run test`, `bun run typecheck`, `bun run check` (0 erreur et 0 avertissement), `bun run build`. Tests UI ciblés pertinents, replays audit recherche/produit identiques. Revue quick indépendante du diff complet, corrections et vérifications finales. La recette de déploiement/authentification réelle globale reste en 3.10, aucune preuve simulée présentée comme accès réel.

### Preuves d’implémentation — 10 octobre 2026

Depuis `app/` :

| Vérification | Résultat |
| --- | --- |
| `bun install --frozen-lockfile` | Installation reproductible, lockfile inchangé. |
| `bun run test` | 554 tests / 29 fichiers passent ; recherche existante et replays audit recherche/produit identiques inclus. |
| `bun run typecheck` | Code 0. |
| `bun run check` | Code 0, aucun diagnostic, `--error-on-warnings` conservé. |
| `bun run build` | Code 0, bundle client et SSR construit ; avertissements de directives `use client` issus de dépendances lors du bundling. |
| `bun run test:e2e -- tests/e2e/catalogue.spec.ts --project chromium` | 8 tests ciblés : soumission/reprise explicites, focus/retour à 320 px, instantanés successifs préservés, panne, absence/obsolescence, changement de hit et hors ligne. |
| `git diff --check` | Code 0. |

Captures réelles immuables : tofu `0745760279005` prêt (P 13.8/G 1.78/L 5.32/99.8 kcal), amandes `3350033027046` bloquées pour lexème glucides `9.3999996185303` conservé sans arrondi, yaourt `3270190024309` bloqué pour obsolescence. Hashes des captures vérifiés dans les tests domaine. Négatifs synthétiques séparés pour valeurs null/zéro/incompatibles, unités, préparation, base, état et réponses malformées.

Tests Convex hors réseau : deux comptes partageant un fetch produit en vol ; treize codes concurrents limités à douze fetch ; 12 produits et 8 recherches dans une même fenêtre, refus à la frontière glissante ; suspension 429/503 dans les deux directions ; droits/session/fermeture avant réseau et remise ; erreurs backend originales ; tailles/timeout/absence/configuration ; travaux historiques sans type dédupliqués et comptés.

Ces preuves ne sont ni une recette d’authentification réelle ni un déploiement. Revue indépendante quick du diff complet à consigner par l’orchestrateur ; recette globale toujours réservée à 3.10.

### Corrections de revue et audit final de la matrice

Les deux constats ont été corrigés : messages ciblés avec noms français des nutriments et validation des enveloppes OFF 404 via lecture bornée. Les nouveaux négatifs vérifient corps vide/HTML/JSON invalide, codes incohérents et corps trop volumineux ; cinq cas UI vérifient deux erreurs simultanées sans fusion. Aucun constat différé.

Chaque ligne de la matrice est couverte par des tests exécutés : captures et nutrition/base/état/préparation dans `src/domain/catalogue-product.test.ts`, réseau/accès/budgets/concurrence dans `convex/catalogue.test.ts`, interface/immutabilité dans `tests/e2e/catalogue.spec.ts`. Les replays audités sont également exécutés par `scripts/audit-off.test.ts`. Vérification finale de l’orchestrateur : 561 tests / 29 fichiers réussis, typecheck code 0, check code 0 sans erreur ni avertissement (181 fichiers), build code 0. Les avertissements de bundling de dépendances restent ceux documentés précédemment.

Tests navigateur relancés par l’orchestrateur après corrections : 13/13 réussis (36,9 secondes), aucun skip. Revue et vérifications achevées ; statut built selon le workflow BMAD.
