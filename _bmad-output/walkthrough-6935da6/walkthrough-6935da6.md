# Walkthrough du commit 6935da6

Cible : `6935da6283199e469b5eb7e5017ba7affc47e0c8`.

L’utilisateur délègue les réponses, les décisions et les acceptations des blocs. Les statuts consignent les décisions prises en son nom après examen des preuves.

Bloc courant : aucun — parcours terminé. Contenu des blocs inchangé pendant la revue ; seuls leurs statuts ont été actualisés.

## Bloc 1 — Intention

- [x] Bloc 1 accepté sous délégation explicite.

**Problem:** La story 2.2 fournit les gardes et un premier refus, mais la correction accessible et la couverture transversale des entrées/refus restent partielles. Le résumé ne guide pas explicitement la reprise et ses liens ajoutent un fragment à l'URL.

**Approach:** Compléter le parcours de refus/correction et sa couverture, à méthode inchangée. Rendre les erreurs françaises utilisables au clavier, conserver toutes les saisies et exiger un nouveau calcul après chaque changement.


Source : section Intent du [plan de la story 2.3](../initiative-macrova/epic-calculateur/story-verifier-exclusions-limites-et-reprise-apres-erreur-plan.md#L30), reproduite verbatim.

## Bloc 2 — Grandes lignes

- [x] Bloc 2 accepté sous délégation explicite.

Le changement complète la reprise après un refus du calculateur public. Le formulaire associe les erreurs aux champs, propose une correction au clavier et conserve le calcul explicite ; les tests étendent les preuves de ce parcours et des règles existantes.

- [Route du calculateur](../../app/src/routes/calculateur.tsx#L79) : soumission explicite et [résumé de refus](../../app/src/routes/calculateur.tsx#L215).
- [Tests du domaine](../../app/src/domain/calculator.test.ts#L178) : couverture transversale de la syntaxe, des domaines, des exclusions et des priorités.
- [Scénarios navigateur](../../app/tests/e2e/calculator.spec.ts#L166) : correction, conservation des saisies et reprise du parcours.
- [Plan de la story 2.3](../initiative-macrova/epic-calculateur/story-verifier-exclusions-limites-et-reprise-apres-erreur-plan.md) : intention, contraintes et critères d’acceptation.

## Bloc 3 — Annonce des erreurs et correction au clavier

- [x] Bloc 3 accepté sous délégation explicite.

Le résumé utilise le canal d’annonce poli et atomique de la restitution. Les erreurs locales restent reliées aux champs, sans canal d’alerte supplémentaire ; chaque action de correction place le focus sur son champ à l’activation et empêche l’ajout d’un fragment à l’URL.

- [Erreurs numériques](../../app/src/routes/calculateur.tsx#L171) et [erreurs des choix](../../app/src/routes/calculateur.tsx#L198) : composition de FieldError avec rôle presentation.
- [Résumé nommé](../../app/src/routes/calculateur.tsx#L215) : Alert composé comme groupe dans le canal aria-live.
- [Action de correction](../../app/src/routes/calculateur.tsx#L240) : Button composé avec une ancre et déplacement explicite du focus.
- [Scénario clavier](../../app/tests/e2e/calculator.spec.ts#L166) : associations aux champs et correction sans fragment.

## Bloc 4 — Domaine et couverture des règles

- [x] Bloc 4 accepté sous délégation explicite.

La méthode de calcul reste inchangée. La couverture applique les vecteurs de syntaxe aux trois champs numériques, distingue une syntaxe admise d’un profil accepté et vérifie les domaines, choix, exclusions et priorités ; le gel des entrées aide à détecter une mutation du brouillon.

- [Couverture AD-12 transversale](../../app/src/domain/calculator.test.ts#L178).
- [Tests du domaine et oracles](../../app/src/domain/calculator.test.ts).
- [Méthode de calcul conservée](../../app/src/domain/calculator.ts).
- [Références canoniques](../initiative-macrova/epic-calculateur/methode-estimative-v1/exemples-reference.json).

## Bloc 5 — Invalidation, conservation et confidentialité

- [x] Bloc 5 accepté sous délégation explicite.

Les scénarios couvrent les six entrées après un calcul valide : modification, disparition du résultat courant, retour dans le parcours, refus puis correction et nouveau calcul explicite. Ils s’appuient sur les mécanismes de changement et de soumission préexistants ; les contrôles de confidentialité portent sur l’URL, les requêtes et les stockages du navigateur.

- [Changement et soumission préexistants](../../app/src/routes/calculateur.tsx#L72) : invalidation du résultat et conservation de la session du parcours.
- [Scénarios de reprise pour les six champs](../../app/tests/e2e/calculator.spec.ts#L280).
- [Contrôles de confidentialité](../../app/tests/e2e/calculator.spec.ts#L172).
- [Erreurs simultanées et saisies conservées](../../app/tests/e2e/calculator.spec.ts#L352).

## Bloc 6 — Périphérie

- [x] Bloc 6 accepté sous délégation explicite.

- [Plan : contraintes et critères d’acceptation](../initiative-macrova/epic-calculateur/story-verifier-exclusions-limites-et-reprise-apres-erreur-plan.md#L36).
- [Plan : preuves d’implémentation et matrice de couverture](../initiative-macrova/epic-calculateur/story-verifier-exclusions-limites-et-reprise-apres-erreur-plan.md#L88).
