---
title: 'Contrat nutritionnel et numérique versionné'
type: 'feature'
ticket: 2
created: '2026-10-05'
status: 'built'
baseline_revision: 'aa522a3550f18230b6be4a68655deb458cbf02bc'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['app/AGENTS.md', 'app/convex/_generated/ai/guidelines.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les fonctionnalités nutritionnelles futures ne disposent d'aucun contrat partagé. Des validations locales divergentes risqueraient de transformer une absence en zéro ou d'arrondir une source silencieusement.

**Approach:** Créer le domaine pur versionné FoodSnapshot et le contrat numérique AD-12, réutilisés par des validateurs Convex et un consommateur public minimal sans persistance. La délégation explicite autorise les choix et l'approbation du plan sans interruption. Le consommateur est une query publique validant un instantané fourni et sa capacité à calculer, sans exposer de données privées ni prétendre livrer la démonstration CAP-2.

## Boundaries & Constraints

**Always:** Respecter AD-1, AD-3 et AD-12. Domaine sans React, Convex, réseau. Transport sans BigInt : chaînes décimales canoniques non exponentielles, au plus six décimales, de 0 à 1 000 000. Pas et densité strictement positifs. Conserver exactement les valeurs et les références de source ; rejeter toute version inconnue. Erreurs communes avec code stable, champs et retryable ; messages français séparés des codes. Les limites v1 restent l'hypothèse technique AD-12 à éprouver dans l'audit catalogue.

FoodSnapshot v1 conserve identifiant source, nom, marque éventuelle, provenance identifiable et référence, horodatage UTC en ms sûr et non négatif, état raw/cooked/unknown, base 100 g/100 ml ou ambiguïté explicite avec champ source, quatre valeurs protéines/glucides/lipides en g et énergie en kcal, chacune décimale canonique ou null. Une densité optionnelle conserve valeur strictement positive, référence et date. La révision de l'instantané est explicite pour les futurs historiques. Une base ambiguë doit pouvoir être représentée pour bloquer le calcul sans inventer une unité.

**Never:** Nutrition inventée, énergie inférée, null assimilé à zéro, conversion g/ml sans densité sourcée, correction du catalogue, persistance métier, solveur, estimation automatique, nouvelle interface ou appels externes. Ne pas modifier auth, secrets, schéma vide ni note locale préexistante dans bmad.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Complet | Snapshot v1 sourcé, zéro explicite, base connue | Valeurs conservées, calcul autorisé | Aucune |
| Absence | Une macro ou kcal null | Snapshot représentable, calcul bloqué, champs manquants nommés | Code données manquantes |
| Base ambiguë | Champ source sans unité certaine | Ambiguïté conservée, calcul bloqué | Code base ambiguë |
| Numérique invalide | Plus de six décimales, plafond dépassé, négatif, exposant, non canonique | Refus sans arrondi ni correction source | Code stable et champ |
| Saisie française | « 12,50 » avec espaces périphériques | Normalisation explicite vers « 12.5 », exactitude conservée | Séparateurs mixtes refusés |
| Métadonnées invalides | Version inconnue, provenance vide, date invalide, unité inconnue | Refus ciblé commun | Code stable et champ |
| Positivité | Pas ou densité zéro | Refus malgré validité du zéro pour macro | Code valeur strictement positive |
| Exactitude | Produit/division nécessitant plus de six décimales | Rationnel BigInt exact interne, affichage centième demi supérieur | Aucun BigInt transporté |
| Conversion | Unité quantité différente de base sans densité | Calcul bloqué ; avec densité sourcée, conversion exacte | Code densité manquante |

</frozen-after-approval>

## Code Map

- `app/src/domain/` absent : créer contrats, décimales et nutrition partagés.
- `app/convex/schema.ts` vide : conserver ; aucune table nécessaire.
- `app/convex/_generated/server` : query publique et validations args/returns.
- `app/convex/auth.test.ts` : modèle convex-test avec module map ; réutiliser la méthode sans modifier auth.
- `app/vitest.config.ts` : ajouter les tests domaine actuellement absents de include.
- `app/convex/_generated/api.d.ts` : intégrer la nouvelle fonction via codegen local si possible.
- Architecture : AD-3 contrat canonique, AD-12 limites numériques et arrondi ; règles repas : toute absence ou ambiguïté bloque calcul.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/contracts.ts` — définir version, erreurs, unités et contrat nutritionnel partagé.
- [x] `app/src/domain/decimal.ts` — validation canonique, normalisation française explicite, entiers échelle 10^6 et opérations rationnelles exactes, affichage au centième.
- [x] `app/src/domain/food.ts` — validation sémantique et contrôle de calculabilité, totaux d'une portion et conversion avec densité sourcée.
- [x] `app/convex/contracts/food.ts` — validateurs structurels typés cohérents avec domaine, sémantique déléguée au domaine ; aucune limite concurrente.
- [x] `app/convex/nutrition.ts` — consommateur public sans DB ; résultats validés et sérialisables.
- [x] `app/src/domain/*.test.ts`, `app/convex/nutrition.test.ts`, `app/vitest.config.ts` — couvrir chaque scénario et vérifier par query anonyme l'intégration et la parité des validations.
- [x] `app/README.md` — documenter v1, query et limites hypothétiques pour les futurs modules.

**Acceptance Criteria:**
- Étant donné un instantané valide, lorsque domaine et query publique le valident, alors ils utilisent les mêmes règles et conservent les valeurs exactes, source et version.
- Étant donné les fixtures de la matrice, lorsqu'on exécute la suite enregistrée, alors chaque comportement attendu est vérifié au niveau approprié et les scénarios zéro/absence/base/précision/saisie française passent aussi par Convex.
- Étant donné une portion, lorsque ses valeurs sont calculées, alors aucune absence ni conversion non sourcée ne produit de total et seules les valeurs affichées sont arrondies.

## Implementation Notes

Estimation supérieure à 100 lignes : route full. Plan approuvé selon délégation utilisateur ; modification locale bmad conservée. Choix d'un consommateur API évite une fausse démonstration chiffrée sans exemples audités. Si les chemins proposés doivent être regroupés pour garder un code simple, consigner ce choix sans changer le contrat.

## Plan Change Log

## Review Triage Log

Revue quick indépendante terminée : aucun constat (high=0, medium=0, low=0, false=0, maybe-false=0). Aucun travail différé. Diff complet examiné, y compris fichiers non suivis et modification bmad préexistante, conservée hors commit de ce ticket.

## Verification

Depuis app : `bun run test`, `bun run typecheck`, `bun run check` (zéro erreur/avertissement), `bun run build`. Tester les frontières dans le domaine et avec convex-test, pas de backend distant nécessaire pour cette fonction pure. Revue indépendante avant clôture.

### Résultats obtenus

- Domaine partagé dans contracts.ts, decimal.ts et food.ts ; fixtures synthétiques réservées aux tests dans food.fixtures.ts. Les instantanés ne sont jamais normalisés ; la normalisation est une opération explicite séparée.
- API publique nutrition.inspect et nutrition.normalizeInput : aucun accès DB, authentification ou effet externe dans les handlers ; transport des rationnels par numérateur/dénominateur entiers en chaînes.
- Audit de matrice : chaque ligne est couverte par food.test.ts et/ou nutrition.test.ts ; zéro, absence, ambiguïté, précision et saisie française passent aussi par convex-test. Les 27 nouveaux tests et les 13 préexistants ont tous été exécutés, aucun ignoré.
- Vérification principale : bun run test (40/40), bun run typecheck (sortie 0), bun run check (108 fichiers, zéro diagnostic, sortie 0), bun run build (client et SSR, sortie 0).
- Écart opérationnel : bun run convex:codegen a contacté le backend de test configuré et annoncé le téléversement des fonctions malgré l'intention de génération locale. Aucun changement de données métier ; plus aucune opération distante exécutée ensuite. Les bindings générés sont inclus. Les limites AD-12 restent une hypothèse à éprouver lors de l'audit catalogue.
- Aucun changement des tickets : le plan porte built conformément au workflow ; aucune opération de publication ou push effectuée.
