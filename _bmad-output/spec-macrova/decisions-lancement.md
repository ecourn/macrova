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

L’agent instruit et consigne les décisions dans la gouvernance à deux définie par spec-macrova.md. Les décisions de test déjà prouvées ne sont pas rouvertes. La décision produit de 2.1 autorise CAP-1 en environnement isolé ; les validations de données, licences, conditions commerciales et exploitation restent à vérifier avant leur activation réelle.

10.1 clôt la préparation du kit et le gel du protocole. La configuration effective du support, les essais autorisé/refusé/révocation/suppression, l’information finale et les autorisations des canaux appartiennent au début de 10.2, avant toute collecte réelle. Leur absence n’est pas un blocage de développement. 10.5 et 10.7 vérifient la remise privée des livrables au binôme ; les preuves de terrain ne sont jamais remplacées par une décision de l’agent.
