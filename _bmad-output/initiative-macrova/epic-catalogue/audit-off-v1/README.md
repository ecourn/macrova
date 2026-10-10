# Audit OFF v1

Corpus technique de 50 recherches distinctes, choisi par l’agent à partir du protocole. Aucun échantillon de personnes, aucune filiation terrain, aucune représentativité ni garantie nutritionnelle. Les états/bases du manifeste sont recherchés, jamais attribués aux produits par la seule requête. Les marques sont des candidats identifiés par leurs pages OFF, sans présumer leurs résultats. Les catégories « incomplet-recherche » et « sans-resultat-recherche » désignent une intention d’audit ; seul le replay établit ce qui est observé.

Depuis `app/` :

```sh
bun scripts/audit-off.ts validate
bun scripts/audit-off.ts capture
# Variante officielle choisie après les indisponibilités legacy :
bun scripts/audit-off.ts capture-sal
bun scripts/audit-off.ts replay > ../_bmad-output/initiative-macrova/epic-catalogue/audit-off-v1/classification.json
bun scripts/audit-off-report.ts
bun run test -- scripts/audit-off.test.ts
bun run check
bun run typecheck
bun run test
```

La capture utilise le réseau et n’est jamais lancée par les tests. Le replay ne dépend que des fichiers locaux ; il vérifie SHA-256 avant parsing, préserve les lexèmes numériques et utilise le contrat commun v1. Aucun arrondi nutritionnel n’est appliqué : plus de six décimales, exposants, négatifs et dépassements sont rejetés par le domaine. La suppression exacte des zéros finaux n’arrondit aucune valeur. Null reste une absence ; zéro explicite reste zéro. Seul `energy-kcal_100g` est lu, sans calcul kcal depuis les macros/kJ. La base est connue uniquement avec `nutrition_data_per` explicite ; un emballage ml avec champ 100g rend la base ambiguë. Aucune densité n’est fabriquée.

Le statut par recherche retient l’existence d’au moins un produit pertinent et utilisable, puis d’une possibilité de complétion privée sourcée ; les raisons par produit restent consultables. La pertinence est une heuristique conservatrice : tous les tokens de plus de deux lettres doivent apparaître dans nom/marque/catégories, sans synonymes ni jugement alimentaire. L’état repose uniquement sur mots explicites du nom/catégories ; preuve conflictuelle ou absente = inconnu. Un état demandé non prouvé bloque l’usage de ce résultat pour le cas. Ne pas confondre un résultat de recherche avec l’aliment brut non transformé.

Captures : corps exact UTF-8 et métadonnées date UTC, révision Git de départ, version normaliseur, URL et paramètres, User-Agent, statut, erreur éventuelle, Retry-After, SHA-256. Révision de départ : `a7356935f43691944990d2af45bc20c11ed5bf4d` ; le diff et ces fichiers versionnent le code nouveau. Champs et taille de page peuvent différer pendant les reprises documentées ; l’URL conservée prévaut. Les premiers essais utilisent dix produits ; les suivants réduisent la demande à trois. Aucune pagination additionnelle. Les lexèmes de champs source utiles figurent dans classification, sans arrondir leurs valeurs.

Budget : au moins huit secondes après chaque réponse, plus le temps réseau (≤8 recherches/minute). Sur 429/503, la CLI persiste `suspension.json`, conserve le corps, puis s’arrête. La CLI refuse de reprendre avec ce verrou. Une reprise exige lecture du statut et de Retry-After, délai respecté et décision manuelle datée dans `attempts/resume.md`, puis archivage du verrou dans `attempts/`. Sans Retry-After, les reprises de cet audit attendent au moins 60 secondes. Aucun retry automatique. Un cas déjà capturé ne sera jamais remplacé. Les premiers échecs de méthode restent dans `attempts/` avec leur corps. Un résultat non observé reste `NOT_OBSERVED` et n’a aucune trace de requête inventée.

Une capture ancienne reste une observation datée. `freshness(date, maintenant, âgeMax)` sépare âge et disponibilité ; le replay n’utilise jamais l’horloge courante et ne prétend pas confirmer la disponibilité actuelle. Le futur adaptateur doit configurer cette durée explicitement et utiliser staging pour ses tests selon [sources.md](sources.md). Cet audit ponctuel en lecture seule observe la base réelle.

Voir [decision.md](decision.md) pour chiffres, matrice, actions et limites ; [repas-reference.json](repas-reference.json) pour contraintes techniques et totaux exacts vérifiés par le domaine. Aucun solver, parcours catalogue, correcteur privé ou backend n’est livré ici. Les obligations d’ouverture publique et CAP-3 restent ouvertes. Attribution/licences : [sources.md](sources.md).

La commande `bun scripts/audit-off-report.ts` régénère classification, décision et références techniques exclusivement depuis les captures ; ne la lancer qu’une fois la collecte arrêtée pour comparer les sorties. Search-a-licious (API0.1.0, `/search`, GET q/langs/fr, page_size3, projection de champs) renvoie `hits` et des marques en tableau. Les dates `lastIndexed` et `obsolete` sont conservées ; `obsolete=true` bloque le produit. Le changement de méthode après les 503 est une lecture de la même source OFF via endpoint officiel. La date de consultation ne rajeunit pas l’index. Aucun enrichissement inventé du champ nutrition_data_per absent.

Enrichissements de démonstration (trois lectures produit distinctes, après la fin des recherches, aucune inflation du compte50) : `bun scripts/audit-off-products.ts capture`, puis `bun scripts/audit-off-products.ts replay`. Les ids sont exclusivement des produits retournés ; leur métadonnée relie le SHA de la recherche à la nouvelle lecture v3.6. Budget produit8s après chaque réponse (<12/min), mêmes protections/suspensions. Le normaliseur relit `nutrition.aggregated_set` avec base `per` explicite, et `nutrients.*.value`, unité et source `packaging` dans une même `source_per`. Aucune `value_computed` ni estimation n’est consommée. Le tofu est calculable ; les amandes dépassent six décimales ; `obsolete=on` bloque le yaourt. Les références finales utilisent tofu et captures legacy complètes, avec états source conservés. Un vecteur hétérogène de six aliments n’est pas une proposition de repas ni une preuve du solver.
