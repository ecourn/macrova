---
title: '2.4 — Modifier la cible avec recalcul cohérent'
type: feature
ticket: 4
created: '2026-10-08'
status: built
baseline_revision: 'f521489e378e7cd021715e0a41c257af5eaa70a2'
route: full
route_source: auto
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-b0a3f719/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-b0a3f719/app/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-b0a3f719/_bmad-output/initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-b0a3f719/_bmad-output/ux-macrova/DESIGN.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-b0a3f719/_bmad-output/ux-macrova/EXPERIENCE.md
---

<frozen-after-approval reason="intent approuvé sous délégation explicite de l'utilisateur">

## Intent

**Problem:** Le résultat public fournit une estimation mais ne permet pas encore de modifier sa cible selon la méthode v1 adoptée.

**Approach:** Étendre le domaine pur et son brouillon de session pour éditer un champ, prévisualiser les conséquences, confirmer ou annuler puis réinitialiser. Composer le parcours avec les primitives shadcn existantes, préserver les gardes et les résultats exacts de 2.3.

## Boundaries & Constraints

**Always:** Appliquer exclusivement la méthode v1 et ses messages/ordre des gardes. Édition d'un seul champ E/P/G/L : E conserve les fractions courantes ; P conserve E/L et recalcule G ; G conserve E/P et recalcule L ; L conserve E/P et recalcule G. Plage d'énergie 90–110 % de l'estimation originale E0, même après plusieurs éditions. Calcul rationnel exact avec soustractions signées ; six décimales AD-12 à la saisie et centième uniquement à l'affichage. Gardes énergie, cohérence, répartition, minimum protéique dans cet ordre. Disponibilité de méthode et profil encore valide requis pour toute transition qui fournit une cible. La prévisualisation affiche ancienne/nouvelle cible avec unités, valeurs exactes consultables, champs conservés et recalculés ; seule une confirmation explicite change la cible courante, même si les valeurs sont identiques. Annuler ou refuser conserve la cible antérieure identifiée. Édition de profil invalide E0, cible et prévisualisation immédiatement ; nouveau calcul explicite revient au défaut 15/45/40. Réinitialisation explicite revient à l'original exact. Brouillon et état conservés au retour par navigation, effacés au rechargement. Français, mobile 320 px, actions clavier, erreurs liées aux champs et résumé annoncé sans focus forcé, contrôles 44 px, protections POST/avant hydratation. Une sortie conservant le brouillon ne l'abandonne pas ; aucune confirmation de sortie supplémentaire nécessaire.

**Never:** Arrondis réinjectés dans le calcul, formulaire prérempli avec un arrondi à confirmer implicitement, correction silencieuse, nouvelle règle nutritionnelle, profil transmis/persisté/loggé, transfert personnel, modification auth/Convex, collecte 2.5, déploiement ou publication distante.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Comportement attendu | Refus |
|---|---|---|---|
| Références | Sept modifications documentaires dont chaîne E-haut puis bas et minimum B | Candidat exact et affichages conformes, original et courant inchangés avant confirmation | Aucun |
| Cardinalité et syntaxe | Zéro/plusieurs/inconnu ; vide, signes, exposant, sept décimales, plafond ; décimales FR | Un seul champ explicite normalisé sans perte du brouillon | MODIFICATION_NON_UNIQUE ou ENTREE_INVALIDE |
| Gardes édition | Toute matrice edition/reset, énergie à ses bornes ± millionième, macros dérivées négatives, minimum B | Ordre/codes/messages canoniques, aucun candidat valide en refus, courant inchangé | Codes v1 |
| Transitions | Confirmer, annuler, identité de valeurs, reset, méthode indisponible, absence de cible | État estimé/modifié distinct, original exact conservé ; refus sans cible disponible | CIBLE_ABSENTE / METHODE_INDISPONIBLE |
| Profil et retour | Six changements de profil depuis cible modifiée ou prévisualisation ; accueil/retour avec édition en cours | Invalidation complète ; brouillon/état exacts retrouvés ; nouveau calcul explicite au défaut | Aucun résultat obsolète |
| Parcours public | Éditer/recalculer/refuser/confirmer/annuler/reset hors ligne et au clavier/mobile | Hypothèses à jour, résumé et liens accessibles, aucune fuite réseau/URL/cookies/stockage | Erreurs françaises corrigeables |

</frozen-after-approval>

## Code Map

- `app/src/domain/calculator.ts` : gardes complètes calculateProfile/validateCalculatorTarget ; session actuelle profile/outcome/changed. Étendre les transitions sans React/IO. Réutiliser signedRational/addSigned pour soustractions : multiply/divide de decimal refusent le négatif.
- `app/src/domain/decimal.ts` : normalizeFrenchDecimal, parseDecimal, rationnels et displayHundredth ; contrat partagé inchangé.
- `app/src/routes/calculateur.tsx` : état en contexte router copié via Object.assign ; résumé poli, liens Button avec rôle link et focus sans fragment ; protections POST/disabled avant hydratation à conserver.
- `app/src/components/ui` : Field/Input/NativeSelect/Button/Alert/Table disponibles ; composer un composant métier si utile sans nouvelle primitive.
- `app/src/domain/calculator.test.ts` et `app/tests/e2e/calculator.spec.ts` : oracles JSON, helper profil, confidentialité/reprise et clavier/mobile existants. testMatch de playwright.config.ts inclut calculator.spec.ts ; enregistrer explicitement tout nouveau fichier E2E.
- `methode-estimative-v1/exemples-reference.json` : oracle indépendant, modifications, matrice édition/reset et transitions ; ne pas modifier.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/calculator.ts` — transitions pures pour calcul, brouillon d'édition, prévisualisation, confirmation, annulation et reset ; conserver original/courant exacts, vérifier profil et méthode.
- [x] `app/src/routes/calculateur.tsx`, éventuel `app/src/components/calculator-target-editor.tsx` — édition explicite, bilan ancien/nouveau, conséquences et actions, hypothèses reflétant les fractions actuelles.
- [x] `app/src/domain/calculator.test.ts` — couvrir chaque scénario et oracle, invariance et identités exactes, absence de cumul de plage, obsolescence et priorité.
- [x] `app/tests/e2e/calculator.spec.ts` — parcours intégré incluant retour avec candidat/édition refusée, confirmation/annulation/reset, profil changé, mobile/clavier, hors ligne et confidentialité.
- [x] `app/README.md` — documenter ce parcours et ses limites prouvées.

**Acceptance Criteria:**
- Given une estimation actuelle, when une modification admise est prévisualisée, then l'ancienne cible reste courante et les conséquences exactes sont consultables avant confirmation.
- Given une prévisualisation, when elle est confirmée ou annulée, then la cible devient modifiée ou conserve son état antérieur sans perte numérique.
- Given un refus ou une navigation de retour, when l'édition est reprise, then le texte et l'état sont conservés avec la cible antérieure identifiée.
- Given une cible modifiée, when le profil change ou la cible est réinitialisée, then l'invalidation ou le retour exact à E0 suit la méthode sans recalcul implicite.

## Implementation Notes

- 2026-10-08 — Utilisateur délègue toutes questions et décisions : plan approuvé et poursuite retenue. Initiative résolue par dossier explicite ; premier appel find corrigé en passant dossier et ref séparément. Arbre propre et branche générique cohérente. Route full, changement supérieur à 100 lignes. Aucun arbitrage nutritionnel ouvert.

- 2026-10-08 — Plan initial d'environ 2 050 tokens conservé intégralement sous délégation utilisateur : un seul objectif, règles de transitions et matrice nécessaires à la vérification. Pas de découpage secondaire.
- 2026-10-08 — Domaine pur étendu, éditeur composé des primitives shadcn, répartition courante et fractions consultables ; aucune modification Convex/auth ni persistance. Protection de confirmation contre divergence du candidat ou du profil.

## Plan Change Log

## Review Triage Log

- 2026-10-08 — Revue quick : high=0, medium=1, low=0, false=0, maybe-false=0. Constat confirmé : les boutons confirmer/annuler disparaissent avec la prévisualisation et le focus retombe sur BODY. Route patch : restaurer le focus au bouton de prévisualisation conservé après ces actions, avec preuve clavier des deux fermetures. Aucun élément différé. Correctif réalisé via une référence au déclencheur conservé ; les deux actions sont activées par Entrée et les assertions de restauration réussissent en E2E.

## Verification

### Audit de matrice — 8 octobre 2026

- Références : sept tests « modification exacte », fractions exactes et affichages ; identité 4P+4G+9L=E vérifiée.
- Cardinalité/syntaxe : quatre vecteurs cardinalité, six syntaxes invalides sur les quatre champs, saisie française brute conservée.
- Gardes : toutes les lignes edition/reset de l’oracle ; bornes ± millionième, cumul interdit, dérivées négatives, seuil protéique.
- Transitions : cinq transitions documentaires avec assertion explicite de succès, identité confirmée, annulation depuis cible modifiée, absence/méthode retirée/version inconnue, candidat obsolète.
- Profil/retour : six champs depuis prévisualisation et résultat modifié en unité ; retour navigateur avec candidat/refus et conservation des fractions exactes.
- Parcours public : deux nouveaux E2E complets, clavier/mobile 320 px et hors ligne ; confidentialité URL/réseau/cookies/stockages et rechargement.

Toutes ces preuves ont été exécutées et réussies. Passe finale : 402 tests unitaires sur 21 fichiers, 19 E2E ; correction d'assertion documentaire vérifiée ensuite par les 201 tests du calculateur et check.


Depuis `app/` : `bun run check` zéro erreur/avertissement ; `bun run typecheck`, `bun run test`, `bun run test:e2e`, `bun run build`. `git diff --check` propre. Chaque ligne de matrice reliée à un test exécuté et réussi. E2E standard ne valide pas l'authentification réelle. Revue indépendante avant clôture.

### Vérification finale après revue — 8 octobre 2026

- `bun run check` : exit 0, 155 fichiers, zéro erreur/avertissement. `bun run typecheck` : exit 0. `bun run test` : 402 tests réussis sur 21 fichiers. `bun run build` : exit 0 (avertissements de directives use client des dépendances). `bun run test:e2e` : 19 scénarios réussis en 56,6 s, dont les restaurations du focus après confirmation et annulation. `git diff --check` propre.
- Revue quick indépendante terminée : un constat clavier confirmé puis corrigé ; aucun constat restant ni élément différé. Statut built conforme au workflow ; aucun déploiement ou publication distante. E2E public standard, pas de validation auth réelle ni de lecteur d'écran/audit WCAG complet.
