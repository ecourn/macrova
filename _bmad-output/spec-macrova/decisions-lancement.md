# Décisions avant lancement

| Sujet | Choix retenu ou limite | Condition à satisfaire |
|---|---|---|
| Méthode nutritionnelle | Méthode estimative v1 retenue par décision produit déléguée du 8 octobre 2026 ; pas de promesse de santé | Dossier sourcé et exemples reproductibles livrés en 2.1 ; tests du domaine et des exclusions à l’implémentation de CAP-1, sans signature externe requise |
| Hors périmètre | Usage adulte général uniquement ; situations particulières non cadrées | Définir les situations exclues et le parcours sans estimation automatique ; ne pas improviser de réponse médicale |
| Données personnelles | Calcul sans compte ; ne pas conserver son profil serveur par défaut ; compte pour fonctions personnelles | Définir champs nécessaires, accès, durées et suppression/export ; vérifier les obligations applicables avant ouverture |
| Nutrition personnelle | Recueillir seulement les données nécessaires au repas et à la cible ; mesures d’usage privées | Définir ce qui est enregistré, l’information de la personne et les exceptions légales de conservation |
| Sources alimentaires | Open Food Facts obligatoire ; aucune garantie de complétude ; référence et date visibles | Vérifier documentation API, quotas, attribution et conditions de réutilisation des données et images au moment de l’architecture |
| Recherche | Cache/index comme piste technique héritée, pas de dépendance au réseau à chaque frappe imposée ici | Choisir l’intégration à partir de la documentation actuelle et de l’audit de couverture |
| Offre | Une offre mensuelle à 5,99 € comme test ; annuel différé ; démonstration avant proposition | Définir présentation du prix final, consentement, paiement, remboursement, résiliation et devenir des données après arrêt |
| Infrastructure | Socle de test livré (architecture, photographie du 7 octobre) ; production et fournisseur de paiement à arrêter | Mesurer coûts et choisir les fournisseurs lors de l’architecture |

Ces vérifications restent ouvertes : cette spécification ne certifie aucune conformité médicale, juridique ou commerciale. Les choix de produit autonomes sont révisables après observation ; une modification doit passer par le journal canonique et une nouvelle dérivation de la spécification.

## Calendrier des validations

Les contrôles de méthode, catalogue, licences, données, paiement et exploitation restent exigés avant l’activation correspondante. Epic 3 produit et audite son corpus technique ; epic 9 vérifie la recette intégrée et les conditions d’ouverture. Aucun résultat d’entretien, quota bêta ou paiement utilisateur préalable n’est requis pour livrer le MVP.

La [décision du 10 octobre 2026](../initiative-macrova/change-mvp-sans-enquete/change-mvp-sans-enquete.md) abandonne 10.2–10.7 comme obligations MVP ; 10.1 reste une préparation historique. Support privé, information/contact, consentement, accès/révocation/suppression et autorisations de canaux ne sont requis que si une collecte de retours est effectivement décidée après livraison. Leur absence ne bloque aucun développement sans collecte.
