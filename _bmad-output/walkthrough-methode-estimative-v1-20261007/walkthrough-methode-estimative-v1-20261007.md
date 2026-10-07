# Revue guidée — Méthode estimative v1

Cible : [dossier méthode estimative v1](../initiative-macrova/epic-calculateur/methode-estimative-v1/).

Revue terminée : les sept blocs sont acceptés par délégation explicite de l’utilisateur. Aucun bloc courant. L’acceptation porte uniquement sur la revue documentaire ; elle ne constitue pas une validation nutritionnelle.

## 1. Intention

- [x] Accepté par délégation explicite utilisateur.

Texte repris verbatim de la section Intent du [plan de la story](../initiative-macrova/epic-calculateur/story-documenter-et-valider-la-methode-estimative-plan.md#intent).

**Problem:** La story 2.1 exige un dossier sourcé avant l'implémentation du calculateur. Aucune méthode et aucun responsable de validation ne sont actuellement approuvés.

**Approach:** Livrer une proposition v1 entièrement définie, des exemples exacts reproductibles et un registre de validation prêt à signer. L'utilisateur délègue les arbitrages et l'approbation du plan ; cette délégation ne fournit pas un accord nutritionnel réel sur une méthode encore inconnue.

## 2. Grandes lignes

- [x] Accepté par délégation explicite utilisateur.

Le dossier présente une proposition de méthode avant l’implémentation du calculateur.

- [Méthode](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md) : équations, périmètre, gardes, modifications et états.
- [Sources](../initiative-macrova/epic-calculateur/methode-estimative-v1/sources-verifiees.md) : références primaires et limites des conclusions.
- [Vecteurs JSON](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json) : exemples et cas de référence reproductibles.
- [Validation](../initiative-macrova/epic-calculateur/methode-estimative-v1/validation.md) : registre documentaire et décision externe à recueillir.
- [Vérification](../initiative-macrova/epic-calculateur/methode-estimative-v1/verification.md) : reproduction arithmétique et intégrité des pièces.

## 3. Sources et choix produit

- [x] Accepté par délégation explicite utilisateur.

L’équation de Mifflin estime la dépense au repos ; le PAL multiplie cette estimation pour proposer une dépense quotidienne. L’assemblage Mifflin × PAL, le défaut 15/45/40 et les bornes de couverture relèvent des choix produit proposés ; les sources ne les approuvent pas ensemble.

- [Sources primaires](../initiative-macrova/epic-calculateur/methode-estimative-v1/sources-verifiees.md).
- [Portée et justification](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md#portée-et-justification).

## 4. Contrat numérique, domaine et refus

- [x] Accepté par délégation explicite utilisateur.

Les saisies suivent AD-12 et les calculs conservent des rationnels exacts jusqu’à l’arrondi d’affichage au centième, sans réinjection des valeurs affichées. Les intermédiaires signés permettent d’évaluer les candidats avant leur admissibilité. L’indisponibilité de la méthode prime sur les exclusions, puis l’ordre des gardes détermine le motif de refus.

- [Entrées et exclusions](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md#entrées-et-exclusions).
- [Contrat numérique et ordre des gardes](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md#contrat-numérique-et-ordre-des-gardes).
- [Matrice des bornes et refus](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.md#matrice-complète-des-bornes-et-refus).

## 5. Modification et états

- [x] Accepté par délégation explicite utilisateur.

La référence E0 reste immuable ; la modification d’énergie demeure dans ±10 % d’E0 sans cumul. Chaque modification d’un seul champ produit un candidat prévisualisé avant confirmation explicite ; annulation et réinitialisation ont des effets distincts. Tout changement de profil invalide les cibles et exige un nouveau calcul explicite.

- [Modification explicite et états](../initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md#modification-explicite-et-états).
- [Modification, validation et réinitialisation](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.md#modification-validation-et-réinitialisation).
- [Transitions et priorité](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.md#compléments-de-transition-et-priorité).

## 6. Exemples et preuves

- [x] Accepté par délégation explicite utilisateur.

Trois profils synthétiques fournissent les valeurs exactes et leurs affichages, complétés par les modifications des quatre champs énergie, protéines, glucides et lipides. La matrice couvre les frontières et les refus ; les transitions décrivent confirmation, annulation, réinitialisation et changement de profil. Les vecteurs et la commande de reproduction constituent les pièces de référence pour l’implémentation future.

- [Exemples de référence](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.md).
- [Vecteurs structurés](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json).
- [Reproduction minimale indépendante](../initiative-macrova/epic-calculateur/methode-estimative-v1/verification.md#reproduction-minimale-indépendante).

## 7. Périphérie et validation externe

- [x] Accepté par délégation explicite utilisateur.

- [Plan de la story](../initiative-macrova/epic-calculateur/story-documenter-et-valider-la-methode-estimative-plan.md) : périmètre et critères d’acceptation.
- [Registre de validation](../initiative-macrova/epic-calculateur/methode-estimative-v1/validation.md) : conditions de décision du responsable réel.
- [Journal de la revue](walkthrough-methode-estimative-v1-20261007-log.md) : décisions, preuves et points ouverts.

