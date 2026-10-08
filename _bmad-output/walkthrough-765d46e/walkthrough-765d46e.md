# Walkthrough du commit 765d46e

Cible : `765d46e2214d0f067ebf9c25eb2122018f518a80`.

L’utilisateur délègue les réponses, les décisions et les acceptations des blocs. Les statuts consignent les décisions prises en son nom après examen des preuves.

Bloc courant : aucun — revue terminée. Les mécanismes décrits restent inchangés ; seuls les statuts ont été actualisés pendant la revue.

Décision de clôture : archiver ce récit et le [journal](walkthrough-765d46e-log.md) par un commit documentaire local, sous délégation explicite.

## Bloc 1 — Intention

- [x] Bloc 1 accepté sous délégation explicite.

Changement pendant la revue : aucun.

**Problem:** Le résultat public fournit une estimation mais ne permet pas encore de modifier sa cible selon la méthode v1 adoptée.

**Approach:** Étendre le domaine pur et son brouillon de session pour éditer un champ, prévisualiser les conséquences, confirmer ou annuler puis réinitialiser. Composer le parcours avec les primitives shadcn existantes, préserver les gardes et les résultats exacts de 2.3.

Source : section Intent du [plan de la story 2.4](../initiative-macrova/epic-calculateur/story-modifier-la-cible-avec-recalcul-coherent-plan.md), reproduite verbatim.

## Bloc 2 — Vue d’ensemble

- [x] Bloc 2 accepté sous délégation explicite.

Changement pendant la revue : aucun.

Le domaine conserve une estimation originale et une cible courante, puis prépare une proposition distincte. L’interface rend les conséquences consultables avant une confirmation explicite et garde le parcours en mémoire pendant la navigation.

- [Transitions du domaine](../../app/src/domain/calculator.ts#L197) : état et opérations pures de l’édition.
- [Éditeur de cible](../../app/src/components/calculator-target-editor.tsx#L38) : sélection, saisie, comparaison et confirmation.
- [Route du calculateur](../../app/src/routes/calculateur.tsx#L68) : session partagée et restitution de la cible courante.
- [Tests du domaine](../../app/src/domain/calculator.test.ts#L339) et [scénarios navigateur](../../app/tests/e2e/calculator.spec.ts#L405) : références exactes et parcours intégré.

## Bloc 3 — Calcul exact et gardes

- [x] Bloc 3 accepté sous délégation explicite.

Changement pendant la revue : aucun.

Une édition porte sur un seul champ E/P/G/L. Modifier E conserve les fractions courantes ; modifier une macro conserve les champs prescrits et calcule la macro restante avec des rationnels signés. La plage d’énergie reste attachée à l’original, puis les gardes de cohérence, de répartition et de minimum protéique s’appliquent dans cet ordre.

- [Calcul du candidat et plage originale](../../app/src/domain/calculator.ts#L317) : saisie française normalisée, six décimales et recalcul exact.
- [Gardes de cible](../../app/src/domain/calculator.ts#L243) : négatifs, proportions et protéines.
- [Oracles et invariants](../../app/src/domain/calculator.test.ts#L339) : sept modifications, matrice des refus, bornes et absence de cumul.
- [Références canoniques](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json) : oracle indépendant conservé.

## Bloc 4 — Transitions et session

- [x] Bloc 4 accepté sous délégation explicite.

Changement pendant la revue : aucun.

Prévisualiser conserve la cible courante ; confirmer revalide le profil, la méthode et le candidat avant remplacement. Annuler conserve la cible antérieure, réinitialiser restaure l’original exact, et toute modification du profil invalide le résultat et l’édition. La route partage cette session en mémoire pour retrouver le brouillon au retour.

- [Contrôle de transition](../../app/src/domain/calculator.ts#L295) et [confirmation](../../app/src/domain/calculator.ts#L383) : méthode disponible, profil inchangé et proposition encore cohérente.
- [Annulation et réinitialisation](../../app/src/domain/calculator.ts#L414) : conservation ou retour à l’original.
- [Invalidation du profil](../../app/src/domain/calculator.ts#L230) et [session de route](../../app/src/routes/calculateur.tsx#L89) : remise à zéro explicite et mémoire de navigation.
- [Tests des transitions](../../app/src/domain/calculator.test.ts#L453) : identité, six changements, obsolescence et profils invalides.

## Bloc 5 — Parcours accessible et confidentialité

- [x] Bloc 5 accepté sous délégation explicite.

Changement pendant la revue : aucun.

L’éditeur compose les primitives shadcn existantes et présente les anciennes et nouvelles valeurs avec leurs unités et fractions exactes. Les refus relient les erreurs aux champs dans un résumé poli ; les actions de fermeture ramènent le focus au bouton de prévisualisation. Le formulaire POST reste inerte avant hydratation et le parcours ne transmet pas les entrées personnelles.

- [Formulaire protégé et erreurs liées](../../app/src/components/calculator-target-editor.tsx#L65) : choix explicite, saisie vide et actions de correction.
- [Comparaison et valeurs exactes](../../app/src/components/calculator-target-editor.tsx#L185) : proposition consultable avant confirmation.
- [Restauration du focus](../../app/src/components/calculator-target-editor.tsx#L48) : retour au déclencheur conservé.
- [Parcours privé avec navigation](../../app/tests/e2e/calculator.spec.ts#L405) et [clavier, hors ligne et mobile 320 px](../../app/tests/e2e/calculator.spec.ts#L513) : confirmation, annulation, reset, confidentialité et invalidation.

## Bloc 6 — Périphérie

- [x] Bloc 6 accepté sous délégation explicite.

Changement pendant la revue : aucun.

- [README : modification de la cible](../../app/README.md#L465) : comportement public, mémoire locale et limites des preuves.
- [Plan de la story 2.4](../initiative-macrova/epic-calculateur/story-modifier-la-cible-avec-recalcul-coherent-plan.md) : intention, contraintes, matrice et vérifications consignées.
