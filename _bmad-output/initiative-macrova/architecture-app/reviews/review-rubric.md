# Revue de cohérence — architecture app

Verdict final après relecture : R1, R2 et R3 sont corrigés ; architecture cohérente et exploitable, sous réserve d'aligner le type nutritionnel AD-3 avec les chaînes décimales du nouveau contrat AD-12. Aucun blocage majeur de paradigme ni contradiction avec le socle existant.

Relecture finale : AD-5 attribue et historise la cible journalière ; AD-4 distingue les arbitrages nouveaux par [ASSUMPTION] ; les conventions fixent le brouillon unique et l'autorité DESIGN/EXPERIENCE. AD-11 conserve désormais favori ou journal dans les mesures d'activation, avec déduplication des deux destinations et événements publics séparés. AD-12 fixe la précision commune auparavant différée. Résidu mécanique signalé à l'auteur : AD-3 emploie encore « numérique non négative ou null » alors qu'AD-12 exige une chaîne décimale canonique ou null ; aligner la formulation avant clôture. Les constats ci-dessous documentent la première passe et ne sont plus ouverts.

## Constats prioritaires

### R1 — Moyen : autorité de la cible journalière absente

AD-5 fixe les totaux et le reste journalier, mais ne fixe pas la propriété ni l'instantané de la cible utilisée pour calculer ce reste. CAP-1 permet de modifier une cible sans compte ; CAP-6 et EXPERIENCE.md affichent un reste de journée. Le calculateur et le journal pourraient choisir respectivement une cible courante mutable et une cible historique figée, produisant des restes différents pour une même journée.

Correction proposée : fixer que le module repas/journal possède la cible explicitement confirmée pour un jour personnel, distincte de la cible d'un repas et du résultat public ; aucune importation implicite du calculateur. Préciser si une modification touche uniquement la journée choisie et si elle invalide sa complétude. Si l'arbitrage produit n'est pas suffisamment établi, le différer explicitement avant de distribuer CAP-1/CAP-6, plutôt que laisser cette frontière silencieuse.

### R2 — Moyen : arbitrages nouveaux marqués adoptés

AD-4 précise une grille ancrée à zéro et un départage par variations divisées par les pas. regles-repas.md impose seulement une compatibilité avec le pas et la plus faible modification des portions initiales, sans définir ces conventions. La réalité brownfield ne les établit pas non plus. Ces précisions sont utiles mais leur marque [ADOPTED] confond héritage et proposition autonome.

Correction proposée : conserver le contrat déterministe et marquer les précisions nouvelles comme hypothèses autonomes révisables, ou consigner explicitement leur adoption autonome dans le memlog. Examiner leur effet avec des pas différents : une variation de 100 g sur un pas de 100 g devient moins coûteuse qu'une variation de 20 g sur un pas de 10 g. Ce choix n'est pas équivalent à la variation absolue des quantités.

### R3 — Moyen : héritage des contrats UX trop implicite

La colonne Erreurs fixe des textes français mais aucun invariant transversal ne renvoie au contrat EXPERIENCE.md pour états, focus, décimales françaises, conservation du brouillon dans la session et confirmation des abandons. Deux fonctionnalités construites séparément pourraient adopter des mécanismes différents pour brouillons et opérations. L'absence de répétition des détails visuels est appropriée ; l'autorité des contrats UX devrait être explicite.

Correction proposée : une convention renvoyant à EXPERIENCE.md et DESIGN.md comme autorités des comportements et tokens, avec propriétaire commun du brouillon de composition en mémoire pour les étapes Aliments/Données privées/Confirmation, retour sans perte dans la session et normalisation des décimales françaises avant le domaine. Mentionner le socle d'accessibilité commun sans recopier ses critères.

## Checklist et réconciliation

| Dimension | Évaluation |
| --- | --- |
| Paradigme et dépendances | Clairs : domaine pur, autorité Convex, adaptateurs externes, SSR sans seconde base. |
| Règles contrôlables | Autorisations, révisions, commandes idempotentes, snapshots, moteur et droits vérifiables. Les règles de suppression attendent légitimement une politique explicite. |
| CAP-1 à CAP-8 | Toutes attribuées et couvertes ; R1 précise une frontière CAP-1/CAP-6. |
| Réalité brownfield | Conforme aux fichiers inspectés : schema métier vide, composant auth séparé, relais SSR et configuration différée présents. Modules métier correctement indiqués à créer. |
| Données nutritionnelles | Source, base, cru/cuit, absence distincte de zéro et snapshots historiques conservés. |
| Paiement et mesures | Droits distincts des encaissements ; remboursements et population invitée pris en compte. |
| Exploitation | Environnements, secrets, versions, migration, restauration, régions, budget et alertes explicitement décidés ou différés. |
| Décisions différées | Conditions de reprise généralement précises ; échelles numériques bloquent explicitement la construction distribuée des contrats. |
| UX | Isolation de démo, journal incomplet, confirmation explicite et panne sans sauvegarde présumée correctement repris ; R3 porte les conventions transversales. |
| Versions techniques | Versions exactes déclarées avec lockfile et liens officiels ; cette revue n'a pas refait la vérification web de l'auteur. |

Sources lues : spec-macrova.md, regles-repas.md, protocole-validation.md, decisions-lancement.md et EXPERIENCE.md. Socle inspecté : convex/schema.ts, convex/auth.ts et src/lib/auth-server.ts. Aucune architecture parent contraignante n'est citée par le document.

Les détails de mise en page, l'observation des entretiens et le déroulement des audits restent dans leurs contrats sources ; leur absence du spine n'est pas une perte d'invariant. Les hypothèses commerciales et nutritionnelles restent correctement ouvertes.

## Clôture de la correction finale

AD-3 utilise désormais une chaîne décimale canonique selon AD-12 ou null. Alignement appliqué après le dernier retour du reviewer ; contrôle mécanique sans constat.
