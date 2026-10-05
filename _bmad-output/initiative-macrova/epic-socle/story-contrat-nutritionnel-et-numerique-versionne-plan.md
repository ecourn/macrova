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

## Code Review

### 2026-10-05T16:43:58.786489+00:00

Revue approfondie : 0 décision, 3 corrections, 0 report, 4 constats rejetés. Examens blind-hunter, verification-gap et intent-alignment terminés ; edge-case-hunter a renvoyé une liste vide, comptée comme couche sans résultat selon le workflow.

- [x] [Review][Patch] Préciser les erreurs structurelles et les préconditions du domaine [app/README.md:156] — low ; blind-hunter + intent-alignment. Convex rejette les structures malformées avant le handler ; les erreurs communes concernent la sémantique. Documenter cette frontière et vérifier un rejet structurel.
- [x] [Review][Patch] Vérifier les métadonnées obligatoires et les densités non sourcées [app/src/domain/food.test.ts:112] — medium ; blind-hunter + verification-gap. La suppression des contrôles density.reference/capturedAt ne serait détectée par aucun test actuel et autoriserait une conversion non sourcée. Ajouter des attentes explicites dans le domaine et Convex, ainsi que les champs textuels obligatoires manquants de la matrice.
- [x] [Review][Patch] Protéger les totaux exacts au-delà du plafond des sources [app/convex/nutrition.test.ts:59] — low ; blind-hunter. Garantie explicite du README sans oracle indépendant aux frontières ; vérifier une densité minimale et les entrées maximales, sans plafond ou arrondi de sortie.

### Rejected

- Liens walkthrough cassés — false : ../../../app résout /home/ubuntu/macrova/app depuis le dossier du walkthrough ; les fichiers existent.
- Types validés insuffisamment restreints — false comme défaut actuel : les types représentent les entrées à valider, et chaque consommateur existant passe par les contrôles sémantiques ; aucun appel divergent démontré.
- Validation du domaine sur JSON incomplet — false comme défaut atteignable : validateFoodSnapshot prend FoodSnapshot, non unknown ; l’entrée publique impose la structure via Convex avant son appel. La précondition sera précisée dans la documentation.
- Pas non respecté par le calcul de totaux — false dans le périmètre : calculatePortion calcule une portion et valide la positivité du pas ; le solveur et l’admissibilité AD-4 sont explicitement hors de ce ticket.

L’audit d’intention confirme le socle pur et le consommateur anonyme sans persistance. Deux queries exposent inspection et normalisation explicite ; aucune livraison CAP-2 ni compatibilité catalogue réel n’est annoncée. Le constat structurel est intégré à la première correction et les lacunes de métadonnées à la deuxième. Statut built conservé.

### Actions et vérification

Les trois corrections sont appliquées : documentation des préconditions structurelles et du périmètre du pas ; 17 cas de test supplémentaires pour métadonnées, densités non sourcées, rejet structurel Convex et résultat exact 10^16. Aucun changement de logique métier.

Vérification finale depuis app/ : bun run test — 57/57 ; bun run typecheck — sortie 0 ; bun run check — 108 fichiers, zéro erreur et zéro avertissement, sortie 0. Aucun déploiement, commit, push ou changement de statut de ticket.

Réparation préalable de BMad : installation core-tools/method 6.13.0-next à jour, scripts et configuration courants. Génération incohérente conservée dans _bmad/render/bmad-code-review/macrova-37d327ad9312/7c80709213f8581b4331.backup-20261005T164029077779, puis régénérée depuis les sources installées. Toutes les empreintes du manifeste régénéré vérifiées. Ne pas éditer les fichiers générés ; employer les personnalisations BMad pour modifier les instructions.

Workflow terminé selon la délégation utilisateur (corrections appliquées, choix final : terminer).
