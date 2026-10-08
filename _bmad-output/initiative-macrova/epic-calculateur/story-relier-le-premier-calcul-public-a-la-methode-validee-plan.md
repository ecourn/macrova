---
title: '2.2 — Relier le premier calcul public à la méthode validée'
type: feature
ticket: 2
created: '2026-10-08'
status: done
baseline_revision: '20eacb2b858a48eb4ac424663bf0d167df21f65a'
route: full
route_source: auto
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-fdba5761/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-fdba5761/app/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-fdba5761/_bmad-output/initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-fdba5761/_bmad-output/ux-macrova/DESIGN.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-fdba5761/_bmad-output/ux-macrova/EXPERIENCE.md
---

<frozen-after-approval reason="intent approuvé sous délégation explicite de l'utilisateur">

## Intent

**Problem:** L'accueil starter ne permet aucun calcul public ; sa lecture auth globale rend le SSR dépendant de Convex. La méthode v1 a été adoptée le 8 octobre 2026 et doit maintenant fournir son premier parcours réel.

**Approach:** Relier l'accueil à `/calculateur`, composer un formulaire shadcn et un domaine TypeScript pur exact, restituer les quatre résultats et leurs hypothèses. Isoler les routes publiques de l'auth distante sans absorber les erreurs privées.

## Boundaries & Constraints

**Always:** Méthode `methode-estimative-v1` adoptée dans validation.md/decision-responsable.md ; maintenir ses gardes, messages et ordre. Réutiliser normalizeFrenchDecimal et les limites AD-12 sans les modifier. Rationnels BigInt exacts avec intermédiaires signés explicites ; arrondi au centième demi supérieur seulement à l'affichage. Français, composants locaux shadcn, tokens DESIGN, unités, résumé d'erreurs lié aux champs, résultat annoncé, clavier/mobile. Brouillon en mémoire client de la session du parcours (retour de navigation conservé), jamais global partagé SSR ; changement de toute entrée invalide immédiatement l'estimation, nouveau calcul explicite requis. Disponibilité versionnée explicite testable (absente/non adoptée/retirée/version différente = aucun résultat).

**Never:** Profil dans réseau, URL, cookies, stockage persistant ou logs ; transfert vers compte ; estimation serveur, nouvelle API, modification des tables/auth backend ; correction silencieuse. Pas de modification de cible (2.4), mesure publique (2.5), démonstration/offre fictive ou déploiement. Ne pas masquer les pannes privées ni modifier les limites du contrat partagé.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Traitement |
|---|---|---|---|
| Référence | Profil approuvé des vecteurs JSON | E/P/G/L exacts et affichages identiques | Aucun refus |
| Syntaxe | Vide, signe, exposant, >6 décimales ou plafond | Aucune estimation | ENTREE_INVALIDE, champs et résumé |
| Domaine | Âge non entier/hors19–64, taille hors120–220, poids hors30–200 | Aucune estimation | Codes/messages de méthode, saisies conservées |
| Choix | Coefficient inconnu/incertain, PAL non proposé, déclaration absente | Aucune estimation | Gardes ordonnées sans choix automatique |
| Exclusion | Éligibilité non/incertain, IMC hors[18,5;30[, protéines<0,83W | Aucune estimation | Refus déterministe distinct d'indisponibilité |
| Méthode | Absente, non adoptée, retirée ou version incorrecte | Aucune estimation même si profil valide | METHODE_INDISPONIBLE prioritaire |
| Obsolescence | Entrée changée après succès | Résultat actuel supprimé immédiatement | Brouillon préservé, calcul explicite |
| Navigation | Retour accueil puis calculateur pendant session | Brouillon et état retrouvés | Mémoire client seulement |
| Panne distante | Auth/Convex indisponible dès SSR public | Accueil et calculateur lisibles, calcul navigateur fonctionne | Pannes privées toujours distinctes/remontées |

</frozen-after-approval>

## Code Map

- `app/src/domain/decimal.ts` — normalisation FR, parseDecimal, rational non négatif, displayHundredth : réutiliser, ne pas changer AD-12. Intermédiaires signés dans helper explicite du calculateur.
- `app/src/routes/__root.tsx` — beforeLoad getAuthToken et provider globaux à restreindre aux routes distantes ; préserver `/login` et `/dashboard`.
- `app/src/routes/index.tsx` — starter à remplacer ; conserver liens login/dashboard pour navigation et sondes existantes.
- `app/src/router.tsx` — router créé par requête, point possible pour session UI client ; éviter état module partagé serveur.
- `app/src/routes/login.tsx`, `dashboard.tsx`, `lib/auth.functions.ts`, `lib/auth-server.ts` — session nulle distincte de panne ; conserver protections POST/hydratation et backend.
- `app/src/components/ui/{button,input,field,native-select,alert,card}.tsx` — primitives disponibles ; variantes et composition, cibles44px.
- `methode-estimative-v1/exemples-reference.json` — oracles indépendants de 2.1 pour profils, gardes et arrondis ; modifications hors portée.
- `app/tests/config/auth-consumer.test.ts`, `auth-server.test.ts`, `monitor-socle.test.ts` — preuves privées existantes ; compléter isolation publique.
- `app/tests/e2e/public.spec.ts`, `offline.spec.ts`, `playwright.config.ts` — E2E sans backend ; enregistrer nouvelle suite calculateur explicitement, aucun succès auth réelle prétendu.
- `app/scripts/monitor-socle.ts` — garder sonde conforme au nouvel accueil.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/calculator.ts` et tests associés — contrats de profil/résultat/méthode, gardes déterministes, calcul exact Mifflin×PAL, ratios15/45/40 et contrôles ; tester vecteurs initiaux et matrice ci-dessus.
- [x] `app/src/routes/__root.tsx`, `app/src/router.tsx` et état UI approprié — isoler SSR/provider public, mémoire de parcours par session navigateur ; tester aucune lecture auth publique et erreurs privées inchangées.
- [x] `app/src/routes/index.tsx`, `app/src/routes/calculateur.tsx` et composants métier — accueil Macrova, formulaire des six entrées uniquement, hypothèses/exclusions/version/limites et résultats kcal/g journaliers ; invalider au changement, protections avant hydratation contre POST ou fuite GET.
- [x] `app/tests/e2e/calculator.spec.ts`, `app/playwright.config.ts`, sondes/tests touchés — accès accueil, résultat référence, décimales FR, refus, obsolescence/retour, réseau/URL/stockages, mobile/clavier et panne auth SSR simulée avec URL backend configurée ; aucun profil transmis.
- [x] `app/README.md` — expliquer parcours public local/méthode et portée réelle des tests.

**Acceptance Criteria:**
- Given aucun compte, when une personne ouvre l'accueil puis calcule un profil de référence, then elle retrouve les quatre valeurs, unités journalières, version, hypothèses et limites adoptées.
- Given une entrée refusée ou méthode indisponible, when elle calcule, then aucune estimation ne s'affiche, erreur accessible et saisies conservées.
- Given un résultat valide, when elle modifie une entrée ou revient par navigation, then l'ancien résultat ne devient jamais actuel et le brouillon de session reste cohérent.
- Given un backend auth indisponible dès le rendu SSR, when elle ouvre le parcours public, then aucun appel auth n'est nécessaire et les erreurs des opérations privées ne sont pas converties en absence de session.
- Given un calcul et ses reprises, when réseau, URL et stockages sont inspectés, then aucun profil ne quitte la mémoire du parcours.

## Implementation Notes

- 2026-10-08 — initiative résolue explicitement par dossier, sans changer la configuration locale. Branche cohérente et arbre initial propre. Utilisateur délègue questions, arbitrages et poursuite ; plan approuvé et route full (>100 lignes). Pas de publication demandée.

- 2026-10-08 — Domaine exact et gardes, UI shadcn, mémoire du router, disponibilité injectable et isolation SSR/provider réalisés. Liens privés sans préchargement ; sonde publique adaptée. Cache Vite distinct pour les deux serveurs E2E. Aucune opération distante.
- Audit de matrice : références/syntaxe/domaines/choix/exclusions/méthode couverts par calculator.test.ts ; obsolescence/navigation par tests unitaires et calculator.spec.ts ; panne SSR configurée par calculator-failure.spec.ts. Tous exécutés et passants (297 tests Vitest, 9 E2E). check zéro diagnostic, typecheck/build et diff --check réussis. Auth réelle non testée.

## Plan Change Log

## Review Triage Log

- Revue quick 2026-10-08 : high=2, medium=0, low=0, false=0, maybe-false=0. Deux corrections locales, aucun report.
- high / patch — `__root.tsx` : `/dashboard/` correspond à la route privée dans TanStack, mais égalité pathname exclut token/provider ; confirmé par matchRoutes et appels useConvexAuth. Normaliser la condition beforeLoad et sélectionner les matches rendus pour le provider.
- high / patch — `__root.tsx` : stores.location prend la destination avant publication des matches ; le dashboard encore rendu perd son provider lors du retour public. Condition du provider à baser sur les matches effectivement rendus et couvrir la transition.

- Correctifs appliqués : normalisation du slash final pour la lecture token, provider sélectionné par matches rendus ; 6 tests de plomberie avec vrai router et pont auth couvrent variantes URL, zéro appel public et transition suspendue. Aucun constat restant ni report.

## Verification

Depuis `app/` : `bun run check` (zéro erreur/avertissement), `bun run typecheck`, `bun run test`, `bun run build`, `bun run test:e2e`. Tous doivent réussir ; test SSR de panne configurée sans compte via backend simulé local, préserver tests de classification d'erreurs privées. Recette auth réelle hors portée en l'absence de compte ; ne pas présenter E2E standard comme preuve d'auth réelle. `git diff --check` propre.

Résultats finaux après corrections : `bun run check` 154 fichiers, zéro erreur/avertissement ; `bun run typecheck` sortie 0 ; `bun run test` 303/303 (21 fichiers) ; `bun run build` sortie 0 ; `bun run test:e2e` 9/9 ; `git diff --check` propre. Compilation : avertissements de dépendances sur directives use client, aucun diagnostic applicatif. Revue quick corrigée, aucune déférence. Aucun déploiement ni push ; authentification réelle non exercée.
