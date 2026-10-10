# Décision d’audit OFF v1

Observation du 2026-10-10T08:43:25.743Z au 2026-10-10T09:00:34.021Z, normaliseur macrova-off-audit/1, révision initiale a7356935f43691944990d2af45bc20c11ed5bf4d. Corpus technique uniquement.

50/50 interrogations réelles conservées ; la collecte des cinquante requêtes est terminée. Statuts par cas : utilisable : 2 ; indisponible : 3 ; non pris en charge : 6 ; complétion privée sourcée nécessaire : 39. 147 occurrences de produits retournées (146 identifiants distincts), 5 occurrences utilisables et 5 produits utilisables distincts. Un cas est utilisable s’il possède au moins un résultat pertinent calculable ; les autres produits et leurs blocages restent visibles. Aucun seuil arbitraire de couverture ne vaut validation.

## Décision et limites

Conserver OFF comme source obligatoire, sans catalogue complémentaire. Ne pas geler le catalogue applicatif sur ces seules observations. Legacy cgi/search.pl a reçu des 503 réels et est resté intermittent ; Search-a-licious est une méthode officielle alternative de lecture OFF, pas une rotation d’identité/IP. Ses hits conservent souvent un index ancien (date lastIndexed), des produits obsolete et une base nutritionnelle absente : le suffixe _100g ne distingue pas g/ml à lui seul. Aucune disponibilité actuelle, base, état, densité ni nutrition n’est inventée. Voir les captures, leurs API/version/URL exactes et les premières erreurs dans attempts/. Le constat préparatoire v2/search ignorant search_terms est confirmé par documentation : v2 ne fournit pas texte libre ; aucune adoption implicite.

Les cas incomplets et sans résultat sont des recherches intentionnelles : l’observé prévaut. Un résultat au nom contenant les mots recherchés peut rester un aliment composé ; l’heuristique conservatrice de pertinence et d’état ne démontre pas l’équivalence à un brut. Les mots « grand cru » et plats mixtes ne prouvent pas l’état du riz. Les unités/modificateurs non pris en charge et précision excessive bloquent sans arrondir. La projection de champs limitée et une seule page peuvent manquer d’autres produits disponibles ; aucun taux ne se généralise aux besoins humains. Source exacte et valeurs restent contrôlables par produit dans classification.json.

Enrichissements distincts : 3 lectures produit v3.6 réellement capturées dans products/, 1 utilisables. Schéma nutrition.aggregated_set.per explicite et nutrients.value/unit/source ; seules valeurs packaging explicites dans leur source_per correspondant sont retenues, sans value_computed, estimation, conversion ni arrondi. Les amandes sont rejetées pour précision excessive et le yaourt pour obsolete=on si observé ; le tofu complet enrichit les références. Leur filiation renvoie au code et SHA de la recherche source, sans gonfler les cinquante requêtes. Voir enrichment-classification.json.

Actions MVP : vérifier l’endpoint texte retenu, résoudre base/état par lecture produit ou source d’étiquette identifiable, garder toute correction privée séparée ; gérer disponibilité, âge, suspension et attribution dans l’adaptateur futur. Les produits obsolètes doivent être écartés et recontrôlés explicitement. Recherche intégrée, corrections privées, identité et isolation Convex, recette cible restent à construire. CAP-3 reste ouvert, tout comme les conditions d’ouverture publique de sources.md.

## Portions techniques

2 références sourcées de 3 et/ou 6 aliments dans repas-reference.json ; elles sont calculables exactement par calculatePortion v1. Quantité initiale/confirmée 50 g, minimum 0 g, maximum 100 g, pas 10 g, première ligne verrouillée : décisions techniques de l’agent pour exercer le contrat, aucune recommandation alimentaire. Chaque aliment reste dans sa base g et son état source, dont le riz cru : aucune assimilation au riz cuit ni conversion. La sélection privilégie tofu/amandes/yaourt relus en v3.6 lorsqu’ils sont complets ; sinon riz et variantes d’avoine/crackers exercent les nombres ; elle ne prétend pas fournir une démonstration de repas habituels. Une démo produit plausible reste à designer avec ses contraintes confirmées et sources complètes. Totaux rationnels exacts enregistrés, affichage au centième uniquement ; tests revalident sources, bornes, grille, verrous et résultats. Aucun solver livré/validé, ni preuve de cible atteinte/optimalité/impossibilité. Epic démonstration/composition conserve ces vérifications.

## Matrice exhaustive

| Cas | Statut | Raisons | Produits | HTTP | Action |
| --- | --- | --- | ---: | --- | --- |
| OFF-01 | utilisable | INVALID_DECIMAL, IRRELEVANT_RESULT | 10 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-02 | utilisable | IRRELEVANT_RESULT, STATE_UNPROVEN, AMBIGUOUS_BASIS, MISSING_NUTRITION | 8 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-03 | indisponible | HTTP_503 | 0 | 503 | Contrôle explicite ultérieur ; aucun retry automatique. |
| OFF-04 | indisponible | HTTP_503 | 0 | 503 | Contrôle explicite ultérieur ; aucun retry automatique. |
| OFF-05 | non pris en charge | IRRELEVANT_RESULT, STATE_UNPROVEN, MISSING_NUTRITION, INVALID_DECIMAL | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-06 | non pris en charge | NO_RESULTS | 0 | 200 | Liste vide, distincte d’une panne. |
| OFF-07 | indisponible | HTTP_503 | 0 | 503 | Contrôle explicite ultérieur ; aucun retry automatique. |
| OFF-08 | complétion privée sourcée nécessaire | SOURCE_OBSOLETE, AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-09 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-10 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, INVALID_DECIMAL | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-11 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-12 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-13 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-14 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-15 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-16 | complétion privée sourcée nécessaire | SOURCE_OBSOLETE, AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-17 | complétion privée sourcée nécessaire | SOURCE_OBSOLETE, AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-18 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-19 | complétion privée sourcée nécessaire | IRRELEVANT_RESULT, STATE_UNPROVEN, AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-20 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, SOURCE_OBSOLETE | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-21 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-22 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-23 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-24 | complétion privée sourcée nécessaire | INVALID_DECIMAL, AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-25 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-26 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-27 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION, SOURCE_OBSOLETE | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-28 | complétion privée sourcée nécessaire | IRRELEVANT_RESULT, AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-29 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, SOURCE_OBSOLETE | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-30 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-31 | non pris en charge | SOURCE_OBSOLETE, AMBIGUOUS_BASIS, INVALID_DECIMAL | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-32 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-33 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-34 | non pris en charge | IRRELEVANT_RESULT, AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-35 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-36 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-37 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-38 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-39 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-40 | complétion privée sourcée nécessaire | INVALID_DECIMAL, AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-41 | complétion privée sourcée nécessaire | SOURCE_OBSOLETE, AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-42 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-43 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-44 | complétion privée sourcée nécessaire | INVALID_DECIMAL, AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-45 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-46 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-47 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-48 | non pris en charge | IRRELEVANT_RESULT, INVALID_DECIMAL, SOURCE_OBSOLETE, AMBIGUOUS_BASIS, MISSING_NUTRITION | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-49 | complétion privée sourcée nécessaire | AMBIGUOUS_BASIS | 3 | 200 | Voir les actions par produit ; une seule page observée, taille demandée dans l’URL et effectif réel conservé. |
| OFF-50 | non pris en charge | NO_RESULTS | 0 | 200 | Liste vide, distincte d’une panne. |
