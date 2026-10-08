# Walkthrough du commit 02f0db5

Cible : `02f0db586ecd4350fc02d8be3c2c14d0b2e94a46`.

L’utilisateur délègue les réponses, les arbitrages et les acceptations des blocs. Les statuts consignent les décisions prises en son nom après examen des preuves.

## Bloc 1 — Intention

- [x] Bloc 1 accepté sous délégation explicite.

**Problem:** L'accueil starter ne permet aucun calcul public ; sa lecture auth globale rend le SSR dépendant de Convex. La méthode v1 a été adoptée le 8 octobre 2026 et doit maintenant fournir son premier parcours réel.

**Approach:** Relier l'accueil à `/calculateur`, composer un formulaire shadcn et un domaine TypeScript pur exact, restituer les quatre résultats et leurs hypothèses. Isoler les routes publiques de l'auth distante sans absorber les erreurs privées.


Source : section Intent du [plan de la story 2.2](../initiative-macrova/epic-calculateur/story-relier-le-premier-calcul-public-a-la-methode-validee-plan.md), reproduite verbatim.

## Bloc 2 — Vue d’ensemble

- [x] Bloc 2 accepté sous délégation explicite.

Le commit relie le parcours public à une méthode locale exacte. Ces quatre points d’entrée permettent de suivre le formulaire jusqu’aux preuves de fonctionnement.

- [Orchestration : saisie, calcul explicite et restitution](../../app/src/routes/calculateur.tsx#L64).
- [Domaine : disponibilité, gardes et calcul des quatre valeurs](../../app/src/domain/calculator.ts#L113).
- [Frontière : lecture distante réservée aux routes authentifiées](../../app/src/lib/public-auth-boundary.ts#L3).
- [Preuve : résultat, reprises et confidentialité du parcours](../../app/tests/e2e/calculator.spec.ts#L19).

## Bloc 3 — Méthode exacte, gardes et arrondis

- [x] Bloc 3 accepté sous délégation explicite.

La disponibilité de la version adoptée précède toutes les gardes. Les entrées normalisées et les exclusions contrôlent l’accès au calcul ; les rationnels BigInt gardent les résultats exacts, puis l’affichage arrondit au centième.

- [Disponibilité et gardes ordonnées](../../app/src/domain/calculator.ts#L102).
- [Intermédiaires signés +5 et −161](../../app/src/domain/calculator.ts#L73).
- [Répartition des résultats](../../app/src/domain/calculator.ts#L179).
- [Affichage français au centième](../../app/src/domain/calculator.ts#L99).
- [Tests du domaine](../../app/src/domain/calculator.test.ts).

## Bloc 4 — Interface, mémoire et confidentialité

- [x] Bloc 4 accepté sous délégation explicite.

Le formulaire compose les composants shadcn et expose hypothèses, exclusions et unités. La session est créée par le router, sans mémoire globale SSR ; chacune des six entrées invalide le résultat actuel. Le fieldset désactivé avant hydratation, la soumission POST sans champs nommés et les annonces accessibles accompagnent la conservation locale du profil.

- [Formulaire et protections avant hydratation](../../app/src/routes/calculateur.tsx#L149).
- [Brouillon et calcul explicite](../../app/src/routes/calculateur.tsx#L67).
- [Résumé lié aux champs et annonce des résultats](../../app/src/routes/calculateur.tsx#L215).
- [Création de session par router](../../app/src/router.tsx#L13).
- [Invalidation au changement](../../app/src/domain/calculator.ts#L209).
- [Preuves navigateur de navigation et confidentialité](../../app/tests/e2e/calculator.spec.ts).

## Bloc 5 — Frontière entre parcours publics et privés

- [x] Bloc 5 accepté sous délégation explicite.

La racine réserve la lecture d’authentification aux routes qui en dépendent, après normalisation du slash final. Le provider suit les routes effectivement rendues, préservant la transition depuis un écran privé. Les liens privés désactivent le préchargement et les erreurs privées ne sont pas absorbées.

- [Sélection des lectures et du provider](../../app/src/lib/public-auth-boundary.ts#L3).
- [Branchement de la racine](../../app/src/routes/__root.tsx#L26).
- [Sélection des routes rendues](../../app/src/routes/__root.tsx#L59).
- [Tests de frontière avec router](../../app/tests/config/public-auth-boundary.test.ts).
- [Preuve SSR avec backend configuré en panne](../../app/tests/e2e/calculator-failure.spec.ts#L2).

## Bloc 6 — Périphérie

- [x] Bloc 6 accepté sous délégation explicite.



- [README : parcours local et portée des validations](../../app/README.md#L442).
- [Styles : présentation du parcours public](../../app/src/styles.css).
- [Playwright : enregistrement des suites du calculateur](../../app/playwright.config.ts#L68).
- [Sonde : reconnaissance du nouvel accueil](../../app/scripts/monitor-socle.ts#L109).
- [Arbre généré : enregistrement de la route](../../app/src/routeTree.gen.ts).

