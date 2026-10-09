---
title: 'Clore R1 et R5 de la rétrospective calculateur'
type: 'chore'
ticket: ''
created: '2026-10-09'
status: 'built'
baseline_revision: 'a50d16f4be90ab22ebd702ccc5f06ab9fad0caa4'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-b25cb075/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-b25cb075/app/AGENTS.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** R1 manque de preuve au consommateur React lorsque la méthode devient indisponible alors que la session porte encore une estimation. R5 manque d'une procédure reproductible qui empêche les interférences entre serveurs, caches E2E et build.

**Approche :** Tester le rendu réel de la route avec une session calculée et les méthodes indisponibles ; démontrer par mutation que le test détecte la suppression de sa garde. Ajouter une commande locale isolant les artefacts, exécutant E2E puis build dans cet ordre et conservant les journaux en cas d'échec. Actualiser le suivi documentaire avec preuves effectives.

## Boundaries & Constraints

**Always :** Répondre et documenter en français. Conserver composants shadcn, assertions et protections existantes. Utiliser profils synthétiques sans réseau Convex réel. Garder les identifiants et contrats métier inchangés. Exécuter les commandes depuis app/. Le mandat utilisateur répond aux checkpoints : conserver les deux actions, approuver ce plan et continuer jusqu'à achèvement.

**Never :** Réaliser R2, R3 ou R4 ; les garder explicitement ouverts avec conditions de reprise. Ne pas inventer de preuve audio/mobile réel, auth ou cloud. Aucun déploiement, push, contact externe ou suppression de processus étrangers. Aucun secret copié ou enregistré dans Git. Ne pas tuer les processus par nom globalement ni supprimer les caches partagés. Ne pas exposer de fixture méthode en production.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Gestion d'erreur |
| --- | --- | --- | --- |
| Contrôle positif | Session calculée, méthode adoptée v1 | Résultat et éditeur rendus, six saisies conservées | Aucune |
| Méthode absente | Même session, null et undefined | Refus méthode visible, résultat et éditeur absents, six saisies conservées | Rendu de refus réel |
| Méthode non adoptée ou retirée | Même session, chacun des deux statuts | Même refus, sans mutation de la session | Rendu de refus réel |
| Autre version | Même session, v2 adoptée | Même refus et conservation | Rendu de refus réel |

</frozen-after-approval>

## Code Map

- `app/src/routes/calculateur.tsx` : `Route.options.component` contient Calculator ; garde outcome sélectionne calculateProfile lorsque méthode indisponible. Ne pas modifier le rendu produit.
- `app/src/domain/calculator.ts` : createCalculatorSession/calculateCalculatorSession/adoptedMethod fournissent une vraie session réussie (30/175/70/5/1.6/oui).
- `app/src/components/calculator-target-editor.tsx` : vrai consommateur à garder dans le rendu ; contrôles visibles de modification identifient son absence.
- `app/vitest.config.ts`, `app/tests/config/public-auth-boundary.test.ts` : tests Node possibles, mocks ciblés existants. Ajouter alias @ si nécessaire, sans dépendance DOM supplémentaire.
- `app/playwright.config.ts` : serveurs propres reuseExistingServer=false ; ports locaux 3001/3002/3999 ; deux Vite utilisent déjà des caches distincts via E2E_VITE_CACHE_DIR, mais chemin failure actuellement partagé.
- `app/vite.config.ts` : cacheDir paramétrable ; Vite/TanStack/Nitro génèrent aussi des artefacts dans l'app, donc un cache seul n'isole pas le build.
- `app/package.json`, `app/scripts/`, `app/docs/recette-calculateur-livraison.md`, `app/README.md` : points d'entrée de recette et documentation.
- `_bmad-output/initiative-macrova/epic-calculateur/epic-calculateur-retrospective.md` : source canonique R1–R5 ; `_bmad-output/initiative-macrova/deferred-work.md` contient les reports transversaux à conserver.

## Tasks & Acceptance

**Execution :**
- [x] `app/tests/config/calculator-render.test.ts`, `app/vitest.config.ts` : rendre le véritable composant via renderToStaticMarkup et contexte injectable ; garder domaine, éditeur et composants réels. Mock limité de route/Link/hydratation. Vérifier chaque ligne de matrice, notamment six valeurs sélectionnées et session intacte.
- [x] `app/scripts/verify-calculator.sh`, `app/package.json`, `app/playwright.config.ts` : commande de recette isolée. Privilégier copie temporaire privée de l'app sans .env, dépendances existantes réutilisées et caches temporaires distincts ; E2E puis build séquentiels. Précontrôle ports, verrou de recette, journaux par phase et arrêt ciblé des seuls enfants démarrés. Ne pas réutiliser serveur existant ; préserver échec et journaux plutôt que retry silencieux. Adapter seulement les points nécessaires à cette isolation.
- [x] `app/README.md`, `app/docs/recette-calculateur-livraison.md` : expliquer isolation, ports, caches, gestion d'arrêt, ordre et localisation des logs ; commande utilisable depuis app/.
- [x] `_bmad-output/initiative-macrova/epic-calculateur/epic-calculateur-retrospective.md`, `_bmad-output/initiative-macrova/deferred-work.md` : clore R1/R5 seulement après preuves ; conserver les passages historiques en les datant et les reports R2/R3/R4 avec leurs conditions.

**Acceptance Criteria :**
- Étant donné la garde actuelle, quand tous les tests de rendu tournent, alors chaque ligne de matrice réussit ; quand la garde outcome est supprimée temporairement, alors les cas indisponibles échouent, puis le fichier est restauré exactement.
- Étant donné une recette locale sans serveur préexistant sur les ports réservés, quand la commande isolée tourne, alors tous les E2E réussissent avant le début du build, le build réussit et aucun serveur de recette ne reste à la fin.
- Étant donné une collision de port ou un échec de commande, quand la recette démarre ou échoue, alors elle refuse ou s'arrête avec code non nul, garde une trace exploitable et ne modifie aucun serveur étranger.
- Étant donné la livraison, quand le suivi est lu, alors R1/R5 ont des preuves datées et R2/R3/R4 restent reportés sans réalisation annoncée.

## Implementation Notes

- 9 octobre 2026 : contexte frontmatter intégralement lu avant modification.
  Rendu réel via `Route.options.component` et `renderToStaticMarkup`, avec
  domaine/éditeur/shadcn réels ; mocks limités route/Link/hydratation. Aucune
  modification du rendu produit, de contrat métier ou de fixture production.
- La recette utilise deux copies privées de l'app et des dépendances déjà
  installées, avec cwd/cache distincts : un lien de dépendances hors du root
  Vite ne fonctionne pas ici ; cacheDir seul n'isole pas TanStack/Nitro.
  Seules les copies de dépendances sont retirées après arrêt, logs/rapports/
  sources/caches privés/build restent. Les caches partagés sont conservés.
- Préparation Playwright explicite limitée au mode recette : chargement des
  routes, attente hydratation/réseau au repos, navigateur fermé avant les
  contextes de tests ; les erreurs JavaScript restent bloquantes. Vite
  préoptimise les dépendances publiques avec `noDiscovery` dans ce seul mode,
  après observation d'import client échoué et de HTTP 504 sur des dépendances
  découvertes tardivement. Aucun retry ni assouplissement d'assertion.
  Le tout premier clic sur Vite froid n'est pas validé ; cause initiale du
  clic perdu non établie. Cette limite est explicitement documentée.
- HEAD observé pendant le travail : `76feef129de89d5c5dec97129a537c54a67a1595` ; baseline ci-dessus conservée.
  L'agent d'implémentation n'a exécuté aucune commande de commit ou de push.

## Plan Change Log

## Review Triage Log

- 9 octobre 2026 — **medium / patch**, `app/scripts/verify-calculator.sh` : serveur détaché orphelin après échec brutal de la commande E2E. Reproduction indépendante avec listener `setsid`, sortie 1 et listener encore joignable (`/tmp/macrova-review-orphan-pv82twef`). La lecture confirme que `ps --ppid` après `wait` perd la filiation. Correction ciblée : marqueur UUID privé `MACROVA_CALCULATOR_RUN` hérité par les processus de phase, recherche exacte dans `/proc` et arrêt des processus marqués même réattribués ; conserver le code d’échec et les journaux. Aucun processus étranger visé. Reproduction après correction : sortie 1 conservée, build absent, listener détaché arrêté et listener étranger toujours joignable (`/tmp/macrova-review-orphan-fix-sjn0aoo8`). Relecture indépendante : constat résolu, aucun nouveau constat sur la correction.

### Revue quick — 9 octobre 2026

Comptes : high 0, medium 1, low 0, false 0, maybe-false 0.

| Constat | Verdict | Route | Preuve et action |
| --- | --- | --- | --- |
| Enfant setsid orphelin après sortie anormale de la phase | medium | patch résolu | La recherche PPID après wait perd les enfants réattribués. Reproduction initiale indépendante sortie 1, seconde reproduction sortie 7. Après correction : codes 1/7 conservés, enfant arrêté, build absent, listener étranger conservé ; TERM 143 vérifié. Relecture indépendante sans nouveau constat. Journaux référencés ci-dessus et dans la recette. |

## Verification

Depuis app/ : `bun run check` (zéro diagnostic), `bun run typecheck`, `bun run test`, nouvelle recette isolée E2E puis build. Mutation ciblée temporaire avec restauration garantie ; vérifier ports avant/après et journaux de phases. `git diff --check` à la racine. Les traces complètes sont temporaires ; les faits reproductibles restent documentés. L'agent d'implémentation peut choisir une technique équivalente si elle satisfait les frontières et l'isolation effective.

### Résultats d'exécution — 9 octobre 2026

- Installation nécessaire : premier appel Vitest échoue « command not found »
  car `node_modules` absent ; `bun install --frozen-lockfile` réussit sans
  modification du lockfile.
- R1 : 6/6 tests de rendu réussis. Mutation temporaire de la garde `outcome` :
  5 cas indisponibles échouent / témoin v1 réussi, code 1 ; restauration
  garantie octet pour octet, SHA256 du fichier restauré
  `a2558515356e488d329be8e03c71787596b7deff25a75d74b688141eb638ddce`.
  Journal privé : `/tmp/macrova-r1-mutation-wwfftefq/mutation.log`.
- `bun run check` : zéro diagnostic sur 164 fichiers ; typecheck code 0 ;
  `bun run test` : 418/418 dans 24 fichiers ; `git diff --check` code 0.
- Recette finale `/tmp/macrova-calculator.z4HdK2Wl` : préparation des deux
  serveurs réussie, 25/25 E2E (1,8 min), fin 16:13:32 UTC ; build commencé
  ensuite à 16:13:32 UTC, terminé code 0 à 16:13:36 UTC. Les avertissements
  bundler tiers `use client` sont conservés. Ports 3001/3002/3999 libres à
  la sortie ; copies sans `.env`, aucun `node_modules` temporaire final.
- Collision contrôlée sur chacun des ports : code 1, listener toujours
  joignable ; journaux privés `macrova-collision-ihq4yd8d`, `4v20pnnu`,
  `wwlnjmlu`. Verrou concurrent refusé code 1 (`macrova-calculator.oozIJGwo`),
  recette active intacte. TERM sur les trois serveurs actifs : code 143,
  ports tous libérés (`macrova-calculator.InmJzXKS` et `TyOC5Bsl`).
- Échecs conservés et justifications : liens hors root Vite → timeout
  (`79IvZMdr`) ; copie privée avec cwd commun puis deux cwd → 24/25, premier
  parcours reste sur accueil, chunks manquants observés (`gq1qqVBK`,
  `LsoQiNC5`) ; préparation bloque sur import client (`chG3GU1j`, `3TIPUlcl`)
  et HTTP 504 de dépendances (`7dZSlK9z`). Analyse de routes seule puis liste
  partielle ne suffisaient pas ; liste publique + `noDiscovery` stabilisent
  la recette finale. Un quota temporaire empêche une copie avant E2E
  (`71kDt4zw`) ; seules les dépendances des runs arrêtés sont retirées, logs
  gardés, puis nettoyage de ces copies ajouté à la sortie du wrapper.
- R1/R5 clos dans les documents avec ces preuves ; R2/R3/R4 restent ouverts
  avec conditions de reprise. Aucun nouveau fait auth/cloud/audio/mobile réel.

### Reprise de vérification et revue — 9 octobre 2026

- Recontrôle actuel : `check` zéro diagnostic sur 164 fichiers, typecheck code 0,
  418/418 tests dans 24 fichiers ; SHA256 de restauration R1 et journal de
  mutation recontrôlés, identiques aux preuves précédentes.
- Revue quick indépendante terminée : un constat medium/patch, corrigé et
  revérifié ; aucun constat restant ni nouveau report.
- Exécution `macrova-calculator.5Jza2MI8` : 25/25 E2E réussis, puis nettoyage
  interrompu par modification concurrente du script pendant son exécution
  (`$1: unbound variable`, code 1). Build non commencé. Journaux conservés ;
  relance complète sur la version stabilisée, sans retry de test.
- Recette finale après correction de revue : `/tmp/macrova-calculator.lknABqFI`,
  25/25 E2E (1,7 min), fin code 0 à 16:24:25 UTC ; build commencé à
  16:24:25 UTC, fin code 0 à 16:24:29 UTC. Les scripts/configurations de
  recette sont identiques octet pour octet à la version vérifiée par la revue.
  Ports 3001/3002/3999 libres, aucune copie `.env` ni dépendances temporaires
  restantes. Avertissements tiers `use client` conservés dans `build.log`.
- R1/R5 clos et revue résolue ; R2/R3/R4 et les reports antérieurs inchangés.
  Finalisation par commit local selon l'étape 5 du workflow ; aucun push.

### Vérification finale après correctif de revue — 9 octobre 2026

- Audit de matrice : les six tests consommateurs exécutés couvrent toutes les lignes (témoin v1, null, undefined, deux statuts indisponibles, autre version) ; 418/418 tests, 24 fichiers, après correctif. Typecheck code 0 ; check zéro diagnostic, 164 fichiers.
- Correctif d'arrêt : reproduction indépendante confirmée, puis harness `/tmp/macrova-orphan-verification-7rbsgci1` réussi avec enfant setsid réattribué à PID 1 ; sortie 7/TERM 143 conservés, listener étranger préservé, build absent.
- Recette finale lancée par l'orchestrateur : `/tmp/macrova-calculator.XutjZBes`, préparation des deux serveurs sans erreur, 25/25 E2E (1,7 min), fin E2E et début build à 16:26:49 UTC, fin build et recette code 0 à 16:26:53 UTC. Ports réservés libres après sortie ; script final identique à la copie vérifiée. Avertissements bundler tiers conservés.
- Revue quick : un constat medium corrigé, aucun constat restant. R2/R3/R4 restent reportés ; démarrage à froid, auth/cloud/audio/appareil réel hors preuve.
