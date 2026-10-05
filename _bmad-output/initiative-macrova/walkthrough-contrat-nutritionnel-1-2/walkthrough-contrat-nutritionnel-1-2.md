# Walkthrough — Ticket 1.2 : contrat nutritionnel et numérique versionné

Cible : commit `07d8307`, lu dans l’état courant `bd056b1` qui intègre les corrections de revue. Le [plan du ticket](../epic-socle/story-contrat-nutritionnel-et-numerique-versionne-plan.md) décrit le périmètre.

Revue **terminée**. Les sept blocs sont acceptés par délégation explicite de l’utilisateur. Leur prose est inchangée depuis la création du récit.

## [x] Bloc 1 — Intention — accepté par délégation

**Problem:** Les fonctionnalités nutritionnelles futures ne disposent d'aucun contrat partagé. Des validations locales divergentes risqueraient de transformer une absence en zéro ou d'arrondir une source silencieusement.

**Approach:** Créer le domaine pur versionné FoodSnapshot et le contrat numérique AD-12, réutilisés par des validateurs Convex et un consommateur public minimal sans persistance. La délégation explicite autorise les choix et l'approbation du plan sans interruption. Le consommateur est une query publique validant un instantané fourni et sa capacité à calculer, sans exposer de données privées ni prétendre livrer la démonstration CAP-2.


Source : section « Intent » du [plan approuvé](../epic-socle/story-contrat-nutritionnel-et-numerique-versionne-plan.md), reproduite verbatim.

## [x] Bloc 2 — Grandes lignes — accepté par délégation

Le contrat définit un instantané nutritionnel sourcé, puis sépare sa validité de sa capacité à calculer. Le domaine effectue les opérations exactes ; deux queries publiques exposent ces règles sans persistance.

- [Contrat partagé](../../../app/src/domain/contracts.ts) : forme de l’instantané et des erreurs.
- [Validation et calcul](../../../app/src/domain/food.ts) : métadonnées, blocages et calcul d’une portion.
- [Décimales exactes](../../../app/src/domain/decimal.ts) : entrées canoniques et fractions internes.
- [Queries nutritionnelles](../../../app/convex/nutrition.ts) : adaptation publique du domaine.
- [Tests d’intégration](../../../app/convex/nutrition.test.ts) : lecture du comportement observable dans Convex.

## [x] Bloc 3 — Instantané sourcé et calculabilité — accepté par délégation

Un instantané conserve la version, la révision, l’identité et la provenance de sa source, ainsi que ses valeurs exactes. Une absence reste `null` et une base ambiguë conserve le champ d’origine : ces données restent représentables, mais interdisent le calcul.

La [forme FoodSnapshot](../../../app/src/domain/contracts.ts#L36) distingue base connue et ambiguë. La [validation sémantique](../../../app/src/domain/food.ts#L20) contrôle métadonnées, état, dates et densité sourcée ; le [contrôle de calculabilité](../../../app/src/domain/food.ts#L63) nomme les champs absents et refuse la base ambiguë.

## [x] Bloc 4 — Numérique exact et conversion — accepté par délégation

Les valeurs sources sont des chaînes canoniques bornées à un million et six décimales. Le calcul utilise une échelle entière puis des fractions BigInt réduites ; seul l’affichage au centième applique l’arrondi demi supérieur.

Le [parseur canonique](../../../app/src/domain/decimal.ts#L6) refuse plutôt que corriger une source. La [normalisation française explicite](../../../app/src/domain/decimal.ts#L21) traite séparément la saisie utilisateur. Les [opérations rationnelles et l’affichage](../../../app/src/domain/decimal.ts#L38) préservent l’exactitude ; le [calcul de portion](../../../app/src/domain/food.ts#L80) exige une densité sourcée pour convertir g/ml et transporte les fractions par chaînes. Le pas fourni doit être positif ; l’admissibilité sur une grille appartient au futur moteur.

## [x] Bloc 5 — Frontière publique et erreurs — accepté par délégation

Convex contrôle la structure des arguments avant le handler ; le domaine applique ensuite les règles sémantiques communes. La query d’inspection renvoie l’instantané, sa calculabilité et éventuellement les totaux ; la query de normalisation traite uniquement une saisie explicite.

Les [validateurs structurels](../../../app/convex/contracts/food.ts) décrivent arguments, erreurs et résultats. La [query inspect](../../../app/convex/nutrition.ts#L17) et la [query normalizeInput](../../../app/convex/nutrition.ts#L50) ne consultent aucune base. Les [codes et messages séparés](../../../app/src/domain/contracts.ts#L2) rendent les refus sémantiques identifiables sans confondre ceux-ci avec les erreurs structurelles de Convex.

## [x] Bloc 6 — Vérifications du contrat — accepté par délégation

Les scénarios du contrat sont décrits à deux niveaux : règles du domaine et comportement des queries anonymes. Les cas couvrent notamment zéro et absence, base ambiguë, précision, saisie française, métadonnées et densités non sourcées, ainsi que des totaux dépassant les entiers sûrs JavaScript.

Les [tests du domaine](../../../app/src/domain/food.test.ts) exercent nombres et instantanés avec les [fixtures synthétiques](../../../app/src/domain/food.fixtures.ts). Les [tests Convex](../../../app/convex/nutrition.test.ts) suivent les mêmes règles via l’API, dont le [rejet structurel](../../../app/convex/nutrition.test.ts#L105) et le [grand total exact](../../../app/convex/nutrition.test.ts#L112). La [matrice du plan](../epic-socle/story-contrat-nutritionnel-et-numerique-versionne-plan.md) fournit les attentes de référence.

## [x] Bloc 7 — Périphérie — accepté par délégation

- [Documentation v1](../../../app/README.md#L262) : usage, préconditions et limites AD-12 encore à éprouver sur le catalogue.
- [Configuration Vitest](../../../app/vitest.config.ts) : enregistrement des tests du domaine et de Convex.
- [Bindings API générés](../../../app/convex/_generated/api.d.ts) : exposition du module nutritionnel.
- [Schéma Convex](../../../app/convex/schema.ts) : socle sans table métier ajoutée par ce ticket.
