# Walkthrough du commit 06beb7d

Cible : `06beb7dd42b8dfecb7e8b3b952d7128e93479c4f`. Initiative active non définie (résolution : `{}`). Examen du commit, sans modification du code. Les six blocs définis à l’orientation sont restés inchangés pendant la revue. Les décisions et acceptations sont déléguées par l’utilisateur ; elles ne constituent pas une validation humaine directe.

## 1 — Intention

- [x] Accepté sous mandat délégué.

Intention reproduite intégralement depuis le [plan de la story 2.7](../initiative-macrova/epic-calculateur/story-nettoyage-de-cloture-du-calculateur-plan.md), avec transformation des chemins en liens.

**Problem:** Les builds 2.2 à 2.6 ont construit un parcours vérifié, sans dette de revue encore ouverte. La reconnaissance de clôture constate toutefois deux duplications : les métadonnées E/P/G/L (ordre, libellés, unités) entre résultat et éditeur, et la synchronisation mémoire identique dans les fonctions update et change de la route. Les plans 2.4 et 2.6 identifient ces rendus et le plan 2.5 distingue les transitions locales de l'émission explicite des mesures.

**Approach:** Centraliser les métadonnées de présentation dans [app/src/lib/calculator-presentation.ts](../../app/src/lib/calculator-presentation.ts), consommées par [app/src/routes/calculateur.tsx](../../app/src/routes/calculateur.tsx) et [app/src/components/calculator-target-editor.tsx](../../app/src/components/calculator-target-editor.tsx). Réutiliser update(changeCalculatorProfile(...)) dans change au lieu de recopier Object.assign/setSession. Conserver l'ordre E/P/G/L, les textes français, kcal/jour et g/jour, les descriptions de conséquences, les valeurs rationnelles exactes et tous les états du parcours. Le module de présentation importe seulement le type CalculatorTargetField du domaine ; il n'introduit aucune formule ni primitive UI.

Préserver la méthode v1, le contrat AD-12, l'arrondi au centième uniquement à l'affichage, la session par router et l'invalidation immédiate après modification du profil. Conserver les protections POST/avant hydratation, les composants shadcn existants, les annonces et le focus. L'événement reste exclusivement dans les gestionnaires de calcul/confirmation réussis, jamais dans update. Aucun changement du domaine, du collecteur, de l'authentification, des stockages ou des sources de référence ; aucune fonctionnalité supplémentaire ni livraison distante.

Critères : Given le profil de référence, when calcul puis prévisualisation/confirmation/réinitialisation, then les quatre libellés, unités et valeurs restent identiques et dans le même ordre. Given un résultat ou brouillon actif, when une entrée change puis navigation aller/retour, then l'ancien résultat est invalidé et les saisies restent en mémoire sans mesure implicite. Given les suites de non-régression existantes, when elles sont exécutées, then les références, refus, comportements clavier/mobile et garanties de confidentialité restent vérifiés.


## 2 — Vue d’ensemble

- [x] Accepté sous mandat délégué.

- [Module de présentation partagé](../../app/src/lib/calculator-presentation.ts#L1) : ordre et métadonnées des cibles.
- [Route du calculateur](../../app/src/routes/calculateur.tsx#L104) : synchronisation de la session et opérations explicites.
- [Éditeur de cibles](../../app/src/components/calculator-target-editor.tsx#L108) : consommation des mêmes métadonnées.

## 3 — Métadonnées partagées et tous les rendus

- [x] Accepté sous mandat délégué.

Le [module partagé](../../app/src/lib/calculator-presentation.ts) fixe l’ordre E/P/G/L dans un tuple et fournit une table typée complète de libellés et unités : kcal/jour pour E, g/jour pour P/G/L. Il n’importe que le type du domaine et ne contient aucune formule. Les rendus utilisent ces mêmes métadonnées pour le résultat et ses valeurs exactes dans la [route](../../app/src/routes/calculateur.tsx), puis pour les choix, libellés, prévisualisations et valeurs exactes de l’[éditeur](../../app/src/components/calculator-target-editor.tsx).

## 4 — Synchronisation mémoire et émission explicite

- [x] Accepté sous mandat délégué.

Dans la [route](../../app/src/routes/calculateur.tsx#L104), change transmet la transition de profil au même update que les autres opérations ; update conserve la mutation de l’objet de contexte et la mise à jour React nécessaires à la mémoire lors des navigations. La transition copie le profil et invalide les résultats et brouillons actifs. Les mesures restent exclusivement dans le [submit réussi](../../app/src/routes/calculateur.tsx#L115) et la [confirmation réussie](../../app/src/routes/calculateur.tsx#L384), jamais dans update.

## 5 — Non-régression et accessibilité

- [x] Accepté sous mandat délégué.

La [route](../../app/src/routes/calculateur.tsx) et l’[éditeur](../../app/src/components/calculator-target-editor.tsx) conservent les valeurs rationnelles exactes ; seul l’affichage arrondit au centième. Les protections POST et avant hydratation via ready, les composants shadcn, les annonces live et le focus sont conservés. Les [scénarios du calculateur](../../app/tests/e2e/calculator.spec.ts) vérifient notamment l’édition, la reprise mémoire, le clavier et le mobile ; les [scénarios de panne](../../app/tests/e2e/calculator-failure.spec.ts) complètent les garanties de comportement.

Les activités de vérification et leur périmètre sont consignés dans le [journal](walkthrough-06beb7d-log.md).

## 6 — Périphérie : plan et dépendances inchangées

- [x] Accepté sous mandat délégué.

- [Plan de clôture](../initiative-macrova/epic-calculateur/story-nettoyage-de-cloture-du-calculateur-plan.md) : intention, décisions et preuves de vérification.
- [Manifeste applicatif](../../app/package.json) : dépendances et commandes inchangées dans ce commit.
- [Verrou Bun](../../app/bun.lock) : verrou inchangé dans ce commit.

## Clôture

Les six blocs ont été parcourus et acceptés sous mandat délégué. Aucun défaut identifié et aucun changement applicatif. Le [récit](walkthrough-06beb7d.md) et le [journal append-only](walkthrough-06beb7d-log.md) sont remis non committés ; aucun push ni déploiement n’a été effectué.
