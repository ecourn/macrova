# Parcours de revue — contrat nutritionnel versionné

Cible : commit `07d8307194c7de6857d51ccf94ac487a9b2ce573` (`HEAD`), 12 fichiers, 804 ajouts et une suppression.

Revue terminée. L’utilisateur a délégué les réponses et les choix de parcours ; les sept blocs ont été acceptés selon ce mandat, sans modification du code. Aucun bloc courant. Le journal conserve les décisions et les résultats.

## Bloc 1 — Intention

- [x] Accepté par délégation explicite, sans modification.

**Problem:** Les fonctionnalités nutritionnelles futures ne disposent d'aucun contrat partagé. Des validations locales divergentes risqueraient de transformer une absence en zéro ou d'arrondir une source silencieusement.

**Approach:** Créer le domaine pur versionné FoodSnapshot et le contrat numérique AD-12, réutilisés par des validateurs Convex et un consommateur public minimal sans persistance. La délégation explicite autorise les choix et l'approbation du plan sans interruption. Le consommateur est une query publique validant un instantané fourni et sa capacité à calculer, sans exposer de données privées ni prétendre livrer la démonstration CAP-2.

Source : section Intent du [plan de réalisation](../epic-socle/story-contrat-nutritionnel-et-numerique-versionne-plan.md), reproduite sans modification.

## Bloc 2 — Grandes lignes

- [x] Accepté par délégation explicite, sans modification.

Le domaine fixe une représentation transportable, valide ses valeurs et calcule des portions sans dépendre du backend. Convex fournit un point d’entrée public qui applique les mêmes règles.

- [Contrats partagés](../../../app/src/domain/contracts.ts) : instantané, résultats et codes d’erreur.
- [Décimales](../../../app/src/domain/decimal.ts) : précision canonique et arithmétique exacte.
- [Aliment et portion](../../../app/src/domain/food.ts) : validation, calculabilité et totaux.
- [API nutrition](../../../app/convex/nutrition.ts) : inspection et normalisation explicite des saisies.

## Bloc 3 — Instantané et validation

- [x] Accepté par délégation explicite, sans modification.

Un instantané conserve version, révision, provenance, date et valeurs sources. Une valeur absente ou une base ambiguë reste représentable, puis bloque le calcul avec un code et des champs précis ; le zéro reste une valeur valide.

Le [contrat d’instantané](../../../app/src/domain/contracts.ts) définit cette représentation. La [validation sémantique et la calculabilité](../../../app/src/domain/food.ts) contrôlent métadonnées, décimales, densité et valeurs manquantes. Les [validateurs Convex](../../../app/convex/contracts/food.ts) contrôlent la structure du transport.

## Bloc 4 — Décimales, rationnels et conversion

- [x] Accepté par délégation explicite, sans modification.

Les décimales transportées sont des chaînes canoniques de zéro à un million, avec six décimales au plus. Une normalisation française séparée transforme la saisie explicitement ; les calculs utilisent des rationnels BigInt internes, dont seul l’affichage est arrondi au centième.

Les [opérations numériques](../../../app/src/domain/decimal.ts) préservent cette exactitude. Le [calcul des portions](../../../app/src/domain/food.ts) rapporte les nutriments à une base de 100 et exige une densité sourcée pour convertir grammes et millilitres ; numérateur et dénominateur sortent sous forme de chaînes.

## Bloc 5 — API Convex pure

- [x] Accepté par délégation explicite, sans modification.

La query publique inspecte uniquement l’instantané fourni par l’appelant. Elle renvoie la validation, la calculabilité et les totaux éventuels, sans consulter de données privées ni persister de données métier.

Les [deux queries nutritionnelles](../../../app/convex/nutrition.ts) délèguent leurs décisions au domaine ; leurs [validateurs d’arguments et de retours](../../../app/convex/contracts/food.ts) encadrent le transport. Une réponse d’inspection valide peut contenir une erreur de calculabilité ou de total : ces niveaux doivent être distingués par les consommateurs.

## Bloc 6 — Tests du domaine et de Convex

- [x] Accepté par délégation explicite, sans modification.

Les scénarios du plan vérifient les valeurs absentes, zéros explicites, ambiguïtés, limites numériques et conversions sourcées. Les tests Convex passent par les queries anonymes pour contrôler l’intégration des règles partagées.

Les [tests du domaine](../../../app/src/domain/food.test.ts) utilisent des [fixtures synthétiques](../../../app/src/domain/food.fixtures.ts). Les [tests Convex](../../../app/convex/nutrition.test.ts) vérifient l’inspection et la normalisation à travers les bindings publics. Les résultats exécutés et les limites de vérification sont consignés dans le [journal](walkthrough-contrat-nutritionnel-log.md).

## Bloc 7 — Périphérie

- [x] Accepté par délégation explicite, sans modification.

- [README de l’application](../../../app/README.md) : contrat v1, usage et limites encore hypothétiques.
- [Configuration Vitest](../../../app/vitest.config.ts) : enregistrement des tests du domaine.
- [Bindings Convex](../../../app/convex/_generated/api.d.ts) : exposition de la nouvelle API.
- [Plan de réalisation](../epic-socle/story-contrat-nutritionnel-et-numerique-versionne-plan.md) : intention, contraintes, matrice et vérifications historiques, dont l’écart de génération ayant téléversé les fonctions.

## Conclusions et suivi

Les constats, limites de vérification et décisions de clôture sont consignés dans le [journal](walkthrough-contrat-nutritionnel-log.md).

Clôture avec documents locaux, sans commit ni push et sans changement de statut de ticket. Le rendu BMAD et la modification bmad préexistante sont conservés.
