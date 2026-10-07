---
type: epic
title: "Cible estimative publique"
parent: initiative-macrova
covers: ["CAP-1"]
risk: high
---

# Cible estimative publique

## Description

Livrer le parcours gratuit de cible estimative, de ses entrées nécessaires à la modification de calories, protéines, glucides et lipides, sans compte. La méthode, sa répartition de macros, ses limites et exclusions doivent être documentées et validées avant l'implémentation ; leur validation constitue le premier travail de cet epic, pas un résultat présumé de l'inception.

## Outcome

Une personne adulte dans le périmètre approuvé obtient et modifie une cible estimative compréhensible, avec recalcul cohérent et hypothèses visibles. Une entrée invalide, une situation exclue ou une méthode non validée ne produit aucune estimation automatique.

## Requirements

Chaque exigence locale ci-dessous dérive de **CAP-1** ; la spécification reste le contrat parent, complété par les contraintes, décisions de lancement et contrats UX référencés.

- **CAL-1 → CAP-1** : documenter et faire valider la méthode et la répartition calories/P/G/L, les sources primaires datées, les seules entrées nécessaires et leurs unités, les domaines de validité, les hypothèses, les limites et les exclusions ; consigner responsable, décision et version, exemples de référence et règles de modification/recalcul, sans sélectionner implicitement une formule.
- **CAL-2 → CAP-1** : depuis l'accueil, permettre l'accès direct au calculateur sans compte et la saisie des seules entrées de la méthode validée ; calculer et afficher calories en kcal et protéines/glucides/lipides en g avec la version, les hypothèses et limites consultables.
- **CAL-3 → CAP-1** : vérifier l'éligibilité avant calcul, refuser toute entrée incorrecte ou hors domaine et toute situation exclue ; distinguer méthode indisponible et refus d'estimation, conserver les saisies et ne jamais laisser un ancien résultat apparaître comme actuel après modification.
- **CAL-4 → CAP-1** : permettre la modification explicite de la cible et le recalcul prévu par la méthode approuvée, distinguer cible estimée et cible modifiée, afficher les hypothèses correspondantes et refuser les combinaisons non prises en charge sans correction silencieuse ni calories inférées par une règle non validée.
- **CAL-5 → CAP-1** : exécuter le domaine TypeScript pur dans le navigateur, sans dépendance réseau pour l'estimation, sans profil enregistré côté serveur, URL, cookie, stockage local persistant ou log ; conserver le brouillon seulement en mémoire pendant la session active du parcours et ne rien transférer implicitement vers les fonctions personnelles.
- **CAL-6 → CAP-1** : respecter DESIGN.md et EXPERIENCE.md, composer les primitives shadcn existantes, accepter les décimales françaises avec le contrat numérique commun, séparer calcul exact et arrondi d'affichage, fournir unités, erreurs par champ et résumé accessible, annonces de résultat, navigation clavier et expérience mobile vérifiées.
- **CAL-7 → CAP-1** : rendre observable un calcul terminé via le contrat public calculator_completed sans ownerId, profil ni contenu nutritionnel, séparément des mesures personnelles et de démonstration ; dédupliquer un envoi réessayé, n'émettre aucun succès en cas d'échec et ne jamais bloquer le calcul gratuit sur la collecte.
- **CAL-8 → CAP-1** : livrer et vérifier le parcours intégré sur l'environnement cible isolé avec entrées invalides, exclusions, modification, retour de navigation, indisponibilité réseau et refus d'accès personnel ; préparer la livraison de production sans activer l'ouverture publique avant les décisions de lancement possédées par epic-validation-lancement.

## Done when

1. Le dossier de méthode CAL-1 est sourcé, versionné et validé avec une preuve datée avant toute implémentation d'estimation automatique.
2. Sans compte, une personne éligible obtient les quatre valeurs, consulte les hypothèses puis modifie la cible avec un recalcul conforme au dossier approuvé.
3. Méthode indisponible, entrées invalides et cas exclus ne produisent aucune estimation automatique ; aucune valeur obsolète n'est présentée comme actuelle.
4. Le parcours mobile et clavier conserve les saisies de la session active, utilise les contrats numériques et composants partagés et ne transmet ni ne persiste le profil.
5. calculator_completed est vérifiable sans données de profil, sans confusion avec activation personnelle, avec déduplication des retries et calcul toujours disponible si la collecte échoue.
6. La recette intégrée et la livraison sur la cible isolée ont des preuves datées ; la procédure de livraison de production est prête, son activation publique restant conditionnée aux validations de lancement.

## Boundaries

Le calculateur possède la méthode estimative, son domaine pur, son parcours public et sa mesure publique. Il réutilise les contrats et la livraison du socle terminé, sans nouvelle API de calcul serveur. La cible reste journalière et estimative : aucune cible de repas, confirmation personnelle, sauvegarde de compte ou compensation automatique n'est introduite ici.

Démonstration et offre appartiennent à leurs epics ; ne pas créer de parcours fictif ni de paywall dans le résultat gratuit. Leur navigation sera raccordée quand ces destinations seront livrées. Les entretiens, observations de terrain, politiques de lancement et ouverture publique appartiennent à epic-validation-lancement. Appliquer tous les Non-goals de la spécification, notamment aucune prescription ni garantie de santé.

## References

- spec — _bmad-output/spec-macrova/spec-macrova.md, CAP-1, Constraints et Non-goals
- architecture — _bmad-output/initiative-macrova/architecture-app/architecture-app.md, AD-1, AD-2, AD-10, AD-11, AD-12 et Conventions de cohérence
- ux — _bmad-output/ux-macrova/DESIGN.md, tokens, Components et Do's and Don'ts
- ux — _bmad-output/ux-macrova/EXPERIENCE.md, Calculateur, CAP-1, State Patterns et Accessibility Floor
- règles — _bmad-output/spec-macrova/regles-repas.md, Données et états et Confirmation et réutilisation ; frontière avec les repas personnels
- lancement — _bmad-output/spec-macrova/decisions-lancement.md, Méthode nutritionnelle, Hors périmètre et Données personnelles
- validation — _bmad-output/spec-macrova/protocole-validation.md, Ordre et mesures
- compagnon — _bmad-output/brief-macrova/addendum.md, Décisions à instruire avant implémentation
- socle — _bmad-output/initiative-macrova/epic-socle/tickets.toml, stories 1.1, 1.2, 1.4 et 1.5 terminées
- application — app/README.md, Contrat nutritionnel v1, Intentions reçus et mesures communes v1 et Hébergement de test
- application — app/AGENTS.md, Vérification obligatoire
- code — app/src/routes/__root.tsx et app/src/routes/index.tsx, entrée publique et initialisation auth partagée
- code — app/src/domain/decimal.ts, normalisation française et rationnels non négatifs
- exploitation — app/scripts/monitor-socle.ts, sondes SSR et Convex

## Notes

- Decision: 2026-10-07 — l'utilisateur délègue les réponses et arbitrages d'inception ; conserver une section Requirements locale plutôt que créer une spécification redondante pour CAP-1.
- Decision: 2026-10-07 — huit stories couvrent tout l'epic ; la validation sourcée de méthode (2.1) précède exceptionnellement le premier parcours traversant les couches (2.2), car la spécification interdit l'implémentation avant validation.
- Decision: 2026-10-07 — 2.1 est hitl et possède un done_checkpoint : une validation nutritionnelle réelle ne peut être remplacée par une hypothèse de l'agent ; les autres stories n'imposent pas de checkpoint humain supplémentaire.
- Decision: 2026-10-07 — après le premier parcours valide, traiter les exclusions et les limites (2.3), puis la modification de cible (2.4), la mesure publique (2.5), la vérification d'accessibilité et de navigation (2.6), le nettoyage de clôture (2.7) et la recette livrée (2.8).
- Decision: 2026-10-07 — séquencer les modifications du domaine et de la route calculateur ; aucune exécution parallèle n'est proposée pour ces stories qui partagent ces fichiers ; chaque story porte ses propres tests, la dernière couvre le parcours complet.
- Decision: 2026-10-07 — le premier parcours numérique possède déjà les gardes empêchant les cas invalides ou exclus ; 2.3 complète leur couverture et leurs états de reprise, sans reporter une protection nécessaire.
- Decision: 2026-10-07 — la navigation vers démonstration/offre attend leurs epics ; ne pas différer un élément requis par CAP-1 et ne pas transférer la cible vers un compte dans cet epic.
- Decision: 2026-10-07 — l'inception écrit le découpage local sans démarrer les builds ni publier par commit ; aucune publication n'est demandée.
- Assumption: un propriétaire de développement conduit cet epic dans le monolithe modulaire ; les accès de livraison isolée du socle sont réutilisables, à vérifier lors de 2.8.
- Assumption: pour la mesure publique, un événement représente un premier résultat valide d'une intention explicite de calcul/recalcul, jamais une personne distincte ; son identifiant aléatoire n'est lié ni aux entrées ni à un compte, et un simple rendu ou retour de navigation n'émet rien.
- Assumption: le collecteur conservera seulement l'enveloppe publique fermée v1 durant 30 jours, avec purge et lecture de bilan réservée à l'exploitation ; cette durée technique est révisable et doit rejoindre la vérification de politique avant ouverture, sans prétention de conformité.
- Open question: formule, répartition, champs, exclusions et relation entre modifications calories/macros restent à instruire en 2.1 ; les stories suivantes consomment uniquement sa décision approuvée et ses exemples de référence.
- Open question: le responsable et la preuve de validation de méthode restent à obtenir pendant 2.1 ; le découpage est achevé mais cette validation scientifique n'est pas déclarée acquise.

- Decision: 2026-10-07 — la reconnaissance du code confirme une lecture auth dans le root de toutes les routes et un accueil starter ; 2.2 doit rendre l’entrée publique indépendante d’une panne auth/Convex en préservant les erreurs réelles des parcours privés, et adapter les sondes/tests concernés au nouvel accueil.
- Decision: 2026-10-07 — les helpers rationnels actuels sont non négatifs ; si la méthode validée requiert des intermédiaires signés, 2.2 les prend en charge explicitement dans le domaine pur, sans calcul flottant concurrent ni modification silencieuse du transport AD-12.

- Decision: 2026-10-07 — validation indépendante ticket/set/dependencies sans constat bloquant ; intégrer ses précisions de vérification sur panne auth à l’entrée SSR, erreurs privées, purge et protection de collecte.
