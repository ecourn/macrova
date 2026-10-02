# Macrova — éléments pour la spécification

## Sources et priorité des décisions

Le [brainstorming](../brainstorm-saas-macros/.memlog.md) décrit l’intention initiale : SaaS freemium francophone, calcul gratuit, suivi et repas payants, Open Food Facts obligatoire. Le [forge](../forge-macrova/forge-macrova.md) et son [journal](../forge-macrova/.memlog.md) précisent les décisions retenues. Les personnages et échanges du forge sont fictifs ; ils ne constituent aucun entretien utilisateur.

Les arbitrages les plus récents priment : cible déjà habituée au suivi plutôt que débutants ; cinq paiements réels plutôt que cinq déclarations d’intérêt ; offre annuelle différée plutôt que prix annuel envisagé au brainstorming. Le budget limité et l’interface web adaptée au mobile sont des hypothèses héritées, pas des contraintes confirmées.

## Décisions à instruire avant implémentation

- Définir la méthode de calcul des besoins, ses entrées, ses limites et le traitement des situations hors périmètre adulte général. Aucune formule nutritionnelle n’est sélectionnée dans ce brief.
- Définir les bornes et les pas de quantités par aliment, les écarts acceptables, le comportement sans solution et la priorité des portions verrouillées. La plausibilité d’un repas demande une observation humaine.
- Vérifier les recherches Open Food Facts sur 50 requêtes tirées des repas de la cible, incluant aliments bruts, produits français et états cru/cuit. Consigner disponibilité, complétude, unités et capacité à produire une proposition. Ne pas convertir automatiquement ml en g sans information adéquate.
- Cadrer la saisie privée sourcée et les corrections ; décider d’un complément de catalogue seulement si la couverture le justifie. Vérifier la documentation API et les conditions de réutilisation au moment de concevoir l’architecture.
- Définir les données personnelles réellement nécessaires, leur conservation, les moyens de suppression/export et les modalités de paiement et résiliation. Aucun hébergeur, fournisseur de paiement ou cadre juridique n’est arrêté ici.

## Protocole d’apprentissage

Recruter des adultes correspondant à la cible et documenter les canaux de recrutement. Observer un repas avec leur méthode habituelle puis une tâche comparable avec Macrova ; conserver durée, erreurs, corrections de portions et compréhension des écarts. Aucun gain minimal chiffré n’est affirmé avant cette observation.

Compter chaque personne invitée à la bêta une seule fois dans les taux, y compris si elle ne commence pas. Le premier repas personnel exclut la démonstration. La réutilisation correspond à la reprise ou copie d’un repas enregistré ; une simple connexion ne compte pas. La fenêtre J7 proposée va du jour 6 au jour 8 après invitation. Compter les paiements réellement encaissés et préciser le traitement des remboursements avant le test. Observer le renouvellement un mois après chaque premier paiement.

Les seuils du brief autorisent une décision interne de poursuite ; ils ne remplacent ni une étude représentative ni la mesure des coûts. Fixer les critères avant la bêta et consigner toute modification ultérieure.

## Repères concurrentiels vérifiés le 2 octobre 2026

| Source officielle | Capacité annoncée | Conséquence pour Macrova |
|---|---|---|
| [MyFitnessPal](https://support.myfitnesspal.com/hc/en-us/articles/34603055097869-How-to-use-the-Meal-Planner) | Plans de repas, objectifs calories/macros, journal et liste de courses ; le Meal Planner décrit est limité à certains pays anglophones. | Le lien entre planification et suivi existe déjà. L’intérêt d’un parcours français reste à tester. |
| [Cronometer](https://cronometer.com/features/) | Suivi des calories et nutriments, scan, repas et recettes personnalisés. | Les fonctions de suivi et réutilisation ne suffisent pas à prouver une différence. |
| [Eat This Much](https://www.eatthismuch.com/how-to/) | Plans adaptés aux objectifs et préférences ; génération hebdomadaire et liste de courses dans l’offre payante. | La génération selon des objectifs nutritionnels existe déjà. Tester l’ajustement des aliments habituels comme valeur principale. |
| [Open Food Facts](https://openfoodfacts.github.io/openfoodfacts-server/api/) | API nutritionnelle ouverte alimentée par contributions ; exactitude et exhaustivité non garanties. | Traiter la provenance et les données manquantes comme conditions du service. |

Ces pages décrivent les offres ; aucun essai comparatif ni témoignage indépendant n’a été réalisé. Elles ne démontrent ni la préférence pour Macrova ni une exclusivité fonctionnelle.

## Pistes conservées pour plus tard

Variantes, recettes à plusieurs portions, liste de courses, usages en couple et repas modulaires proviennent du brainstorming. Aucune n’appartient au premier périmètre. Leur ajout dépendra des usages et de l’effort nécessaire ; elles ne constituent pas une feuille de route engagée.

