# Audit contradictoire — Macrova, 10 octobre 2026

Base vérifiée : `afa792bc8b9852dbbb85535aef9348b1d8616129`. Mission : fiabiliser les usages présents et les consignes, sans migration imposée ni fonctionnalité nouvelle. Le rapport antérieur AUDIT-BIBLIOTHEQUES n’était pas disponible ; inventaire reconstruit depuis le dépôt et le fichier de mission joint. Les travaux déjà présents du même plan ont été repris et revérifiés. Aucun secret, manifeste, verrou, backend externe ni `app/AGENTS.md` modifié.

## Constats établis et changements

| Constat initial → preuve | Gravité / impact | Décision et fichier modifié | Risque et validation |
|---|---|---|---|
| Message 404 anglais dans `app/src/routes/__root.tsx:50`, contrairement à la contrainte française | Faible ; texte public incohérent | « La page demandée est introuvable. » ; un seul littéral changé | Très faible ; `curl` sur URL inexistante : HTTP 404 et message français SSR, check/typecheck/build et parcours publics |
| Absence de déclencheur pour choisir les bibliothèques dans le contexte racine ; les instructions ne distinguaient pas les décisions Form/Zod/Table/nuqs | Lacune de maintenance demandée par la mission, pas bug runtime | Ajouter `architecture-app/conventions-bibliotheques.md` et deux points d’entrée dans `AGENTS.md` | Pas de refactor produit ; revue de cohérence avec architecture et règles existantes |
| Le bloc AGENTS est une synthèse remplacée par bmad-project-context ; changer uniquement sa sortie n’en garantit pas la conservation | Risque moyen de perte de conventions lors d’une actualisation ; aucune perte automatique démontrée | `_bmad/custom/bmad-project-context.toml` charge conventions et règles enfant via persistent_facts, documents UX via external_sources ; mettre à jour provenance du bloc | Résolution effective vérifiée ; sept tests du résolveur. La fidélité d’une future synthèse doit être vérifiée à chaque actualisation |

Les instructions existantes sont toutes conservées, aucune règle déplacée ou retirée. `app/AGENTS.md` reste identique, notamment check sans avertissement et guidelines Convex. Le skill installé et ses defaults ne sont pas modifiés. Le résolveur `_bmad/scripts/config_utils.py` fusionne defaults → override équipe → override personnel et ajoute les tableaux ; `bmad-project-context/SKILL.md` charge les faits puis requiert un registre de conservation avant remplacement. Ce mécanisme est conversationnel : aucune génération déterministe du bloc n’est prétendue. La personnalisation versionnée constitue la source pérenne complémentaire aux documents et instructions existants.

## Décisions de non-modification

| Constat initial → preuve | Décision | Fichier modifié | Validation / limite |
|---|---|---|---|
| Aucun import métier de Form/Form Start/Table/nuqs ; interactions simples déjà protégées | Conservation sans migration ; bénéfice de refactor non établi. Aucun usage futur affirmé sans source | Aucun | Inventaire ci-dessous, tests unitaires/E2E |
| Zod sans import métier, mais consommé par Better Auth et adaptateur Convex | Conservation ; ne pas doubler validateurs Convex et invariants du domaine | Aucun | Lock, imports backend, tests sessions/contrats |
| CSS, CLI et primitives non montées expliquent de nombreux usages absents des routes | Aucun retrait sur seule absence d’import | Aucun | 49 entrées ci-dessous ; installation frozen et typecheck |
| `latest` dans cinq sélecteurs TanStack, versions résolues dans le lock | Reproductible avec frozen ; pinning facultatif à discuter lors d’une mise à jour, pas correction actuelle | Aucun | `bun install --frozen-lockfile`, verrou inchangé |
| Nom `start-app` dans le workspace lock, `app` dans le manifeste | Incohérence nominale sans effet démontré ; aucun churn | Aucun | Installation frozen réussie sans changement |
| Profil et cible en mémoire, pas de paramètres URL métier appartenant aux routes | Router reste propriétaire des routes ; pas de seconde source nuqs à introduire | Aucun | Confidentialité/historique E2E ; URLs OFF encodées dans l’adaptateur |
| Auth : protections de session et droits déjà présents, pannes distinctes des absences | Préserver Better Auth/Convex, POST et hydratation | Aucun | Audit auth ci-dessous et 112 tests ciblés |
| Police Geist chargée mais design utilisant system-ui ; lectures JWT SSR répétées | Optimisations facultatives sans mesure d’impact ; différées | Aucun | Build émet bien les polices ; lecture chaîne root/getCurrentUser/fetchAuthQuery |

## Inventaire et preuve des parcours

# Inventaire vérifié des dépendances
49 dépendances déclarées (33 production, 16 développement). Imports exacts des fichiers suivis, CSS, configuration, scripts, CLI, types et graphe du lockfile. Les références d’une primitive non montée restent des usages réels à conserver.
| Paquet | Version verrouillée | Statut | Usage et preuves | Décision |
|---|---|---|---|---|
| @base-ui/react (`^1.8.0`) | @base-ui/react@1.8.0 | Fonctionnalité active (directe ou indirecte) | app/src/components/ui/accordion.tsx:1, app/src/components/ui/alert-dialog.tsx:2, app/src/components/ui/attachment.tsx:2, app/src/components/ui/attachment.tsx:3, app/src/components/ui/avatar.tsx:2, app/src/components/ui/badge.tsx:1, app/src/components/ui/badge.tsx:2, app/src/components/ui/breadcrumb.tsx:2 ; atteignable depuis les routes : app/src/components/ui/button.tsx:1, app/src/components/ui/input.tsx:2, app/src/components/ui/separator.tsx:1 | Conserver ; aucune migration ou suppression justifiée |
| @convex-dev/better-auth (`^0.12.5`) | @convex-dev/better-auth@0.12.5 | Fonctionnalité active (directe ou indirecte) | app/convex/_generated/api.d.ts:76, app/convex/access.test.ts:3, app/convex/auth.config.ts:1, app/convex/auth.test.ts:3, app/convex/auth.ts:2, app/convex/auth.ts:3, app/convex/auth.ts:4, app/convex/catalogue.test.ts:3 ; atteignable depuis les routes : app/src/lib/auth-client.ts:2, app/src/lib/auth-server.ts:1, app/src/routes/__root.tsx:11 | Conserver ; aucune migration ou suppression justifiée |
| @convex-dev/rate-limiter (`^0.4.1`) | @convex-dev/rate-limiter@0.4.1 | Fonctionnalité active (directe ou indirecte) | app/convex/_generated/api.d.ts:77, app/convex/calculatorMeasurements.test.ts:2, app/convex/calculatorMeasurements.ts:1, app/convex/catalogue.test.ts:4, app/convex/catalogueState.ts:1, app/convex/convex.config.ts:5 | Conserver ; aucune migration ou suppression justifiée |
| @fontsource-variable/geist (`^5.3.0`) | @fontsource-variable/geist@5.3.0 | Fonctionnalité active (directe ou indirecte) | app/src/styles.css:4 ; atteignable depuis les routes : app/src/styles.css:4 | Conserver ; aucune migration ou suppression justifiée |
| @shadcn/react (`^0.3.1`) | @shadcn/react@0.3.1 | Primitives disponibles non montées | app/src/components/ui/message-scroller.tsx:7, app/src/components/ui/questionnaire.tsx:4 | Conserver ; aucune migration ou suppression justifiée |
| @tailwindcss/vite (`^4`) | @tailwindcss/vite@4.3.3 | Configuration / CLI / test / outils | app/vite.config.ts:5 | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-devtools (`latest`) | @tanstack/react-devtools@0.10.13 | Configuration / CLI / test / outils | app/src/routes/__root.tsx:8 ; atteignable depuis les routes : app/src/routes/__root.tsx:8 | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-form (`^1.33.5`) | @tanstack/react-form@1.33.5 | Sans intégration constatée | requis indirectement par @tanstack/react-form-start | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-form-start (`^1.33.5`) | @tanstack/react-form-start@1.33.5 | Sans intégration constatée | Aucun usage direct/CSS/config/script/CLI identifié ; bibliothèque installée sans défaut fonctionnel prouvé | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-router (`latest`) | @tanstack/react-router@1.170.41 | Fonctionnalité active (directe ou indirecte) | app/src/components/catalogue-search.tsx:3, app/src/components/public-navigation.tsx:1, app/src/router.tsx:1, app/src/routes/__root.tsx:6, app/src/routes/aliments.tsx:7, app/src/routes/api/auth/$.ts:1, app/src/routes/calculateur.tsx:2, app/src/routes/dashboard.tsx:9 ; atteignable depuis les routes : app/src/components/catalogue-search.tsx:3, app/src/components/public-navigation.tsx:1, app/src/router.tsx:1 ; requis indirectement par @tanstack/react-start, @tanstack/react-start-client, @tanstack/react-start-rsc, @tanstack/react-start-server | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-router-devtools (`latest`) | @tanstack/react-router-devtools@1.167.2 | Configuration / CLI / test / outils | app/src/routes/__root.tsx:7 ; atteignable depuis les routes : app/src/routes/__root.tsx:7 | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-start (`latest`) | @tanstack/react-start@1.168.60 | Fonctionnalité active (directe ou indirecte) | app/server/rpc-transport.ts:1, app/src/lib/auth-server.ts:2, app/src/lib/auth.functions.ts:1, app/src/start.ts:5, app/tests/config/rpc-transport.test.ts:2, app/vite.config.ts:3 ; atteignable depuis les routes : app/server/rpc-transport.ts:1, app/src/lib/auth-server.ts:2, app/src/lib/auth.functions.ts:1 | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-table (`^9.2.6`) | @tanstack/react-table@9.2.6 | Sans intégration constatée | Aucun usage direct/CSS/config/script/CLI identifié ; bibliothèque installée sans défaut fonctionnel prouvé | Conserver ; aucune migration ou suppression justifiée |
| better-auth (`1.6.15`) | better-auth@1.6.15 | Fonctionnalité active (directe ou indirecte) | app/convex/auth.ts:1, app/src/lib/auth-client.ts:1 ; atteignable depuis les routes : app/src/lib/auth-client.ts:1 | Conserver ; aucune migration ou suppression justifiée |
| class-variance-authority (`^0.7.1`) | class-variance-authority@0.7.1 | Fonctionnalité active (directe ou indirecte) | app/src/components/ui/alert.tsx:2, app/src/components/ui/attachment.tsx:4, app/src/components/ui/badge.tsx:3, app/src/components/ui/bubble.tsx:4, app/src/components/ui/button-group.tsx:3, app/src/components/ui/button.tsx:2, app/src/components/ui/empty.tsx:1, app/src/components/ui/field.tsx:2 ; atteignable depuis les routes : app/src/components/ui/alert.tsx:2, app/src/components/ui/button.tsx:2, app/src/components/ui/field.tsx:2 | Conserver ; aucune migration ou suppression justifiée |
| cmdk (`^1.1.1`) | cmdk@1.1.1 | Primitives disponibles non montées | app/src/components/ui/command.tsx:4 | Conserver ; aucune migration ou suppression justifiée |
| cn (`^0.4.0`) | cn@0.4.0 | Fonctionnalité active (directe ou indirecte) | app/src/components/ui/accordion.tsx:2, app/src/components/ui/alert-dialog.tsx:3, app/src/components/ui/alert.tsx:3, app/src/components/ui/aspect-ratio.tsx:1, app/src/components/ui/attachment.tsx:5, app/src/components/ui/avatar.tsx:3, app/src/components/ui/badge.tsx:4, app/src/components/ui/breadcrumb.tsx:4 ; atteignable depuis les routes : app/src/components/ui/alert.tsx:3, app/src/components/ui/button.tsx:3, app/src/components/ui/card.tsx:2 ; requis indirectement par @shadcn/registry, shadcn | Conserver ; aucune migration ou suppression justifiée |
| convex (`^1.46.0`) | convex@1.46.0 | Fonctionnalité active (directe ou indirecte) | app/convex/_generated/api.d.ts:30, app/convex/_generated/dataModel.d.ts:16, app/convex/_generated/dataModel.d.ts:17, app/convex/_generated/server.d.ts:21, app/convex/access.test.ts:4, app/convex/access.test.ts:5, app/convex/account.ts:1, app/convex/auth.config.ts:2 ; atteignable depuis les routes : app/src/components/catalogue-search.tsx:2, app/src/lib/auth-server.ts:3, app/src/router.tsx:2 ; convex:deploy/codegen → convex | Conserver ; aucune migration ou suppression justifiée |
| date-fns (`^4.4.0`) | date-fns@4.4.0 | Primitives disponibles non montées | requis indirectement par react-day-picker | Conserver ; aucune migration ou suppression justifiée |
| embla-carousel-react (`^8.6.0`) | embla-carousel-react@8.6.0 | Primitives disponibles non montées | app/src/components/ui/carousel.tsx:5 | Conserver ; aucune migration ou suppression justifiée |
| input-otp (`^1.5.0`) | input-otp@1.5.0 | Primitives disponibles non montées | app/src/components/ui/input-otp.tsx:3 | Conserver ; aucune migration ou suppression justifiée |
| lucide-react (`^1.52.0`) | lucide-react@1.52.0 | Fonctionnalité active (directe ou indirecte) | app/src/components/ui/accordion.tsx:3, app/src/components/ui/breadcrumb.tsx:5, app/src/components/ui/calendar.tsx:17, app/src/components/ui/carousel.tsx:8, app/src/components/ui/checkbox.tsx:5, app/src/components/ui/combobox.tsx:12, app/src/components/ui/command.tsx:15, app/src/components/ui/context-menu.tsx:6 ; atteignable depuis les routes : app/src/components/ui/native-select.tsx:3 | Conserver ; aucune migration ou suppression justifiée |
| nuqs (`^2.10.1`) | nuqs@2.10.1 | Sans intégration constatée | Aucun usage direct/CSS/config/script/CLI identifié ; bibliothèque installée sans défaut fonctionnel prouvé | Conserver ; aucune migration ou suppression justifiée |
| react (`^19.2.8`) | react@19.3.0 | Fonctionnalité active (directe ou indirecte) | app/src/components/calculator-target-editor.tsx:1, app/src/components/catalogue-search.tsx:1, app/src/components/ui/alert-dialog.tsx:1, app/src/components/ui/alert.tsx:1, app/src/components/ui/attachment.tsx:1, app/src/components/ui/avatar.tsx:1, app/src/components/ui/breadcrumb.tsx:1, app/src/components/ui/bubble.tsx:1 ; atteignable depuis les routes : app/src/components/calculator-target-editor.tsx:1, app/src/components/catalogue-search.tsx:1, app/src/components/ui/alert.tsx:1 | Conserver ; aucune migration ou suppression justifiée |
| react-day-picker (`^10.0.2`) | react-day-picker@10.0.2 | Primitives disponibles non montées | app/src/components/ui/calendar.tsx:10 | Conserver ; aucune migration ou suppression justifiée |
| react-dom (`^19.2.8`) | react-dom@19.3.0 | Fonctionnalité active (directe ou indirecte) | app/tests/config/calculator-render.test.ts:3, app/tests/config/catalogue-render.test.ts:3 | Conserver ; aucune migration ou suppression justifiée |
| react-resizable-panels (`^4.14.2`) | react-resizable-panels@4.14.2 | Primitives disponibles non montées | app/src/components/ui/resizable.tsx:4 | Conserver ; aucune migration ou suppression justifiée |
| recharts (`3.8.0`) | recharts@3.8.0 | Primitives disponibles non montées | app/src/components/ui/chart.tsx:3, app/src/components/ui/chart.tsx:4 | Conserver ; aucune migration ou suppression justifiée |
| seroval (`1.6.8`) | seroval@1.6.8 | Fonctionnalité active (directe ou indirecte) | app/server/rpc-transport.ts:2, app/tests/config/rpc-transport.test.ts:3, app/tests/integration/start-abort.mjs:9 ; atteignable depuis les routes : app/server/rpc-transport.ts:2 ; requis indirectement par @tanstack/router-core, @tanstack/start-client-core, @tanstack/start-plugin-core, @tanstack/start-server-core, solid-js | Conserver ; aucune migration ou suppression justifiée |
| shadcn (`^4.21.1`) | shadcn@4.21.1 | Fonctionnalité active (directe ou indirecte) | app/src/styles.css:3 ; atteignable depuis les routes : app/src/styles.css:3 | Conserver ; aucune migration ou suppression justifiée |
| tailwindcss (`^4`) | tailwindcss@4.3.3 | Fonctionnalité active (directe ou indirecte) | app/src/styles.css:1 ; atteignable depuis les routes : app/src/styles.css:1 ; requis indirectement par @tailwindcss/node, @tailwindcss/vite | Conserver ; aucune migration ou suppression justifiée |
| tw-animate-css (`^1.4.0`) | tw-animate-css@1.4.0 | Fonctionnalité active (directe ou indirecte) | app/src/styles.css:2 ; atteignable depuis les routes : app/src/styles.css:2 | Conserver ; aucune migration ou suppression justifiée |
| zod (`4.6.5`) | zod@4.6.5 | Fonctionnalité active (directe ou indirecte) | requis indirectement par @better-auth/core, @convex-dev/better-auth, @modelcontextprotocol/sdk, @shadcn/registry, @tanstack/router-generator, @tanstack/router-plugin, @tanstack/start-plugin-core, better-auth, shadcn | Conserver ; aucune migration ou suppression justifiée |
| @biomejs/biome (`2.5.15`) | @biomejs/biome@2.5.15 | Configuration / CLI / test / outils | lint, format, check → biome | Conserver ; aucune migration ou suppression justifiée |
| @edge-runtime/vm (`^5.0.0`) | @edge-runtime/vm@5.0.0 | Configuration / CLI / test / outils | vitest.config.ts:8 environment edge-runtime → VM chargée par Vitest | Conserver ; aucune migration ou suppression justifiée |
| @playwright/test (`1.63.0`) | @playwright/test@1.63.0 | Configuration / CLI / test / outils | app/playwright.config.ts:1, app/scripts/prepare-calculator-e2e.ts:1, app/tests/e2e/auth.spec.ts:1, app/tests/e2e/auth.spec.ts:2, app/tests/e2e/calculator-failure.spec.ts:1, app/tests/e2e/calculator-failure.spec.ts:58, app/tests/e2e/calculator-remote.spec.ts:1, app/tests/e2e/calculator.spec.ts:1 ; test:e2e et variantes → playwright | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/devtools-vite (`latest`) | @tanstack/devtools-vite@0.8.5 | Configuration / CLI / test / outils | app/vite.config.ts:2 | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/react-form-devtools (`^0.2.34`) | @tanstack/react-form-devtools@0.2.34 | Sans intégration constatée | Aucun usage direct/CSS/config/script/CLI identifié ; bibliothèque installée sans défaut fonctionnel prouvé | Conserver ; aucune migration ou suppression justifiée |
| @tanstack/router-cli (`^1.167.39`) | @tanstack/router-cli@1.167.40 | Configuration / CLI / test / outils | generate-routes → tsr | Conserver ; aucune migration ou suppression justifiée |
| @types/node (`^22`) | @types/node@22.20.5 | Configuration / CLI / test / outils | types Node implicites dans tsconfig et APIs Node utilisées | Conserver ; aucune migration ou suppression justifiée |
| @types/react (`^19`) | @types/react@19.3.0 | Configuration / CLI / test / outils | types JSX/React implicites dans tsconfig | Conserver ; aucune migration ou suppression justifiée |
| @types/react-dom (`^19`) | @types/react-dom@19.3.0 | Configuration / CLI / test / outils | types ReactDOM de tests SSR | Conserver ; aucune migration ou suppression justifiée |
| @vitejs/plugin-react (`^6`) | @vitejs/plugin-react@6.1.2 | Configuration / CLI / test / outils | app/vite.config.ts:4 | Conserver ; aucune migration ou suppression justifiée |
| convex-test (`^0.0.60`) | convex-test@0.0.60 | Configuration / CLI / test / outils | app/convex/access.test.ts:2, app/convex/auth.test.ts:2, app/convex/calculatorMeasurements.test.ts:3, app/convex/catalogue.test.ts:2, app/convex/contracts.test.ts:2, app/convex/nutrition.test.ts:2, app/convex/recovery.test.ts:2 | Conserver ; aucune migration ou suppression justifiée |
| dotenv (`17.4.2`) | dotenv@17.4.2 | Configuration / CLI / test / outils | app/scripts/recovery-socle.ts:14, app/tests/config/recovery-socle.test.ts:5 ; requis indirectement par @dotenvx/dotenvx | Conserver ; aucune migration ou suppression justifiée |
| nitro (`3.0.260903-beta`) | nitro@3.0.260903-beta | Fonctionnalité active (directe ou indirecte) | app/server/abort-response.ts:1, app/server/error-handler.ts:1, app/server/h3-errors.ts:1, app/tests/config/h3-errors.test.ts:4, app/tests/config/nitro-error-handler.test.ts:2, app/vite.config.ts:6 ; atteignable depuis les routes : app/server/error-handler.ts:1 | Conserver ; aucune migration ou suppression justifiée |
| typescript (`^6.0.2`) | typescript@6.0.3 | Configuration / CLI / test / outils | typecheck → tsc | Conserver ; aucune migration ou suppression justifiée |
| vite (`^8`) | vite@8.3.2 | Configuration / CLI / test / outils | app/playwright.config.ts:2, app/tests/e2e/calculator-remote.spec.ts:2, app/tests/e2e/contracts.spec.ts:3, app/vite.config.ts:1 ; dev/build/preview → vite | Conserver ; aucune migration ou suppression justifiée |
| vitest (`5.0.3`) | vitest@5.0.3 | Configuration / CLI / test / outils | app/convex/access.test.ts:6, app/convex/auth.test.ts:4, app/convex/calculatorMeasurements.test.ts:4, app/convex/catalogue.test.ts:5, app/convex/contracts.test.ts:4, app/convex/nutrition.test.ts:3, app/convex/recovery.test.ts:5, app/scripts/audit-off.test.ts:4 ; test → vitest | Conserver ; aucune migration ou suppression justifiée |

## Usages à ne pas confondre avec une absence d’usage
- `shadcn` fournit `shadcn/tailwind.css` dans `src/styles.css:3` ; CSS chargé par `__root.tsx`.
- `date-fns` est chargé indirectement par `react-day-picker`, lui-même importé par la primitive `calendar.tsx`.
- Zod est requis par Better Auth, son cœur, son adaptateur Convex et les outils shadcn/TanStack, même sans schéma métier local.
- `@tanstack/react-form` est une dépendance de `react-form-start`; Form, Form Start, Form Devtools, Table et nuqs ne sont pas intégrés aux routes actuelles. Cela ne constitue pas un défaut.
- Carrousel, OTP, graphe, calendrier, redimensionnement, command palette et composants @shadcn/react sont présents dans les primitives locales ; ne pas casser leurs imports par suppression.
- Geist est réellement importé en CSS, même si les tokens publics remplacent la police par system-ui. Optimisation facultative, aucun correctif nécessaire.
- React/ReactDOM sont verrouillés à 19.3.0 malgré `^19.2.8`, TypeScript à 6.0.3 malgré `^6.0.2` ; citer les versions effectives.
- Les marqueurs `latest` TanStack sont résolus dans le lockfile : ce n’est pas une exécution non verrouillée. Pinning éventuel = maintenance facultative.
- Paramètres d’URL : aucune donnée profil/cible/recherche applicative sérialisée dans les routes ; URLSearchParams concerne les requêtes OFF et RPC/tests, sans besoin de nuqs.
- Le nom du workspace lockfile (`start-app`) diffère du manifeste (`app`) ; vérifier bun install frozen avant de considérer cela comme un défaut.

## Lecture sensible
- Calculateur : fieldset désactivé avant hydratation, POST explicite sans champs name, calcul rationnel local, estimation/adoption/version gardées, original et cible courante distincts, prévisualisation sans remplacement, confirmation explicite, absence de persistance/URL et invalidation des six entrées.
- Catalogue : hydratation, soumission explicite, génération de réponse et réponse tardive ignorée, coupure hors ligne sans reprise automatique, retour de focus au résultat, null distingué de zéro, source/base/état/dates visibles et erreurs applicatives explicites.
- Les tests E2E catalogue montent le composant avec adaptateurs simulés ; ils valident UI/concurrence mais pas connexion ou autorisations réelles.
- Aucun défaut prouvé calculateur/cible/URL/catalogue à corriger après lecture. Les protections existantes rendent une migration Form/Zod/nuqs facultative et hors scope.

## Interprétation des statuts
- « Fonctionnalité active » inclut le runtime backend Convex, le SSR et les imports CSS effectivement chargés ; les dépendances indirectes sont indiquées sans prétendre à un import métier direct.
- « Primitives disponibles non montées » signifie fichiers UI réutilisables présents mais non atteints par le graphe des routes actuelles. Cela prouve un besoin de résolution/typecheck de ces fichiers, sans prouver un usage client ou futur.
- « Configuration / CLI / test / outils » couvre les imports config, les binaires appelés par package.json, les types implicites et les panneaux Devtools réellement déclarés dans __root.tsx.
- « Sans intégration constatée » ne signifie pas inutilité démontrée ni plan futur. Aucun usage futur de Form/Table/nuqs n’est affirmé, faute de source explicite.
- Zod : runtime indirect confirmé par `bun.lock` entrées `better-auth`, `@better-auth/core`, `@convex-dev/better-auth` ; aucune migration des validations métier.
- ReactDOM : dépendance de rendu du framework et import SSR dans `tests/config/calculator-render.test.ts:3` et `catalogue-render.test.ts:3` ; pas uniquement un test.

## Preuves précises des décisions sensibles
| Sujet | Preuve dépôt | Défaut établi / décision | Validation existante attendue |
|---|---|---|---|
| Calculateur SSR / hydratation / POST | `app/src/routes/calculateur.tsx:184` méthode POST ; `:189` fieldset désactivé avant hydration ; inputs sans attribut name `:195` | Aucun défaut établi ; préserver ces protections | `app/tests/e2e/calculator.spec.ts:141` formulaire inerte avant hydratation |
| Cible estimée locale | `app/src/domain/calculator.ts:109` méthode adoptée/version ; `:120` validation ordonnée ; `:175` Mifflin exact ; `:243` gardes ratios/protéines | Aucun défaut établi ; garder calcul rationnel et refus documentés | `app/src/domain/calculator.test.ts:81` vecteurs documentaires ; `:283` huit couples coefficient/PAL |
| Original et changements | `app/src/domain/calculator.ts:230` six entrées invalident toute session cible ; `:270` calcul repart du défaut ; `:317` prévisualisation ; `:383` confirmation revalide la proposition | Aucun défaut établi ; confirmation explicite et conservation original | `app/src/domain/calculator.test.ts:468` six changements ; `:506` disponibilité/profil ; `:573` candidat obsolète |
| Éditeur clavier / confirmation | `app/src/components/calculator-target-editor.tsx:54` retour focus ; `:68` Échap ; `:86` POST ; `:94` fieldset inertie ; `:311` confirmation ; `:211` liens erreurs focalisant champs | Aucun défaut établi ; prévisualisation inline, pas une modale : pas de focus trap à ajouter artificiellement | `app/tests/e2e/calculator.spec.ts:405`, `:513`, `:576` |
| URL / confidentialité | `app/src/router.tsx:13` session en contexte mémoire ; `app/src/routes/calculateur.tsx:200` changements purement locaux ; `app/src/lib/calculator-measurement.ts:14` événement sans profil/cible, `:27` credentials omit et no-referrer | Aucun état métier sérialisé en URL ; pas de migration nuqs ni suppression fondée sur imports | `app/tests/e2e/calculator.spec.ts:19` confidentialité ; `:752` historique |
| Recherche catalogue et concurrence | `app/src/components/catalogue-search.tsx:180` hydratation ; `:286` dédoublement requête active ; `:298` réponse tardive ignorée ; `:256` coupure offline invalide générations | Aucun défaut établi ; POST et soumission explicite conservés | `app/tests/e2e/catalogue.spec.ts:131`, `:180` |
| Détail produit / clavier | `app/src/components/catalogue-search.tsx:207` génération produit ; `:244` focus titre ; `:246` retour bouton résultat ; `:116` null affiché Manquant ; `:127` provenance | Aucun défaut établi ; zéro et absence distincts, provenance conservée | `app/tests/e2e/catalogue.spec.ts:154`, `:213`, `:286`, `:371` |
| URL vers OFF | `app/src/domain/catalogue.ts:38` endpoint fermé ; `:42` paramètres encodés ; `:170` code produit fermé ; `:176` endpoint autorisé | Pas de validation URL applicative manquante ; URLSearchParams serveur adapté | `app/src/domain/catalogue.test.ts:130`, `app/src/domain/catalogue-product.test.ts:253` |
| Accès catalogue | `app/src/routes/aliments.tsx:18` user beforeLoad ; `:28` actions Convex ; état Authentication/Unauthenticated `:55` | Garde UI identifiée mais ne prouve pas les droits backend ; revue Convex séparée nécessaire | Les E2E catalogue sont un montage simulé, aucune prétention de recette auth réelle |

## Audit authentification et autorisations

# Audit lecture seule : auth, SSR et autorisations

Date : 2026-10-10. Aucun fichier applicatif modifié, aucun appel au backend distant, aucune lecture des fichiers de secrets.

Consignes lues : AGENTS.md, app/AGENTS.md, app/README.md, app/convex/_generated/ai/guidelines.md, _bmad-output/plan-corriger-session-inscription.md. Investigation des routes login/dashboard/aliments, frontière publique/provider, pont auth SSR, handlers HTTP, auth Convex, account, catalogue et gardes.

| Constat | Preuve | Gravité/impact | Décision | Validation |
|---|---|---|---|---|
| Formulaire auth protégé avant hydratation et POST natif conservé | login.tsx : useHydrated, method="post", disabled sur soumission/bascule ; dashboard : bouton désactivé avant hydratation | Ancienne régression sensible déjà corrigée : clics perdus et identifiants dans URL | Ne pas migrer vers TanStack Form ; préserver comportement | auth.spec.ts contient test JavaScript désactivé ; non exécuté ici car suite nécessite auth distante |
| Session absente, expirée, révoquée et utilisateur supprimé donnent null | convex/auth.ts safeGetAuthUser ; convex/auth.test.ts six scénarios dont vraie erreur synthétique | Aucun défaut présent démontré | Ne pas remplacer getter nullable par strict | 6 tests backend réussis |
| Backend défaillant reste une panne explicite et sans secrets | auth-server.ts : seule réponse 401 donne null ; autres codes, JSON/token invalides rejettent ; server-errors.ts enlève message/cause/données ; handler conserve réponses <500 et neutralise 5xx | Pas de redirection anonyme masquant panne ; logs techniques uniquement | Conserver | Tests auth-server et auth-consumer réussis, HTTP 403/429/500/503/transport/JSON/headers couverts |
| Autorisation privée backend indépendante des pages | lib/access.ts requireOwner dérive _id Better Auth et ne traduit que Unauthenticated ; account exige requireOwner ; catalogueState reserve/receive appelle requirePersonalWrite et vérifie propriétaire participant | L'ID fourni navigateur n'accorde pas de droit ; session/droit/ouverture relus avant réseau et remise | Conserver | access.test.ts et catalogue.test.ts réussis, droits/intercomptes/session/concurrence/pannes couverts |
| SSR public et calculateur indépendants de l'auth distante | public-auth-boundary.ts seules routes auth connues chargent jeton ; __root.tsx provider conditionné aux matches rendus | Public reste utilisable en panne auth ; ancienne route reste correctement enveloppée pendant navigation | Conserver | public-auth-boundary.test.ts : 7 tests réussis, slash final et transition privée/publique |
| UI auth déjà shadcn | Login : Button, Alert, Field, Input ; dashboard : Button, Alert ; alert primitive role="alert" ; labels htmlFor associés et autocomplétion explicite | Pas de primitive parallèle ni défaut établi | Ne pas ajouter migration/fonctionnalité | Inspection statique ; aucune revendication WCAG complète |
| Lectures JWT répétées durant SSR | root charge getAuthToken ; getCurrentUser charge getAuthToken ; fetchAuthQuery recharge getToken ; auth-consumer valide 3 fetchs pour consommateur | Recommandation performance facultative, aucun résultat erroné prouvé | Aucune modification : cache par requête demanderait démonstration isolation/expiration et dépasse correction nécessaire | Rechercher un problème mesuré avant optimisation |

Commande exacte exécutée depuis app/ :

```sh
bun run test -- tests/config/auth-consumer.test.ts tests/config/auth-server.test.ts tests/config/public-auth-boundary.test.ts convex/auth.test.ts convex/access.test.ts convex/catalogue.test.ts
```

Résultat : sortie 0, 6 fichiers et 112 tests réussis, durée 3,18 s. Fixtures exclusivement locales : aucune preuve d'identité réelle sur backend externe. Les E2E auth réels, cookies externes et expiration sur déploiement vivant demeurent une limite explicitement assumée du mandat interdisant changements/appels externes.

## Commandes de validation et résultats

Toutes les commandes applicatives sont exécutées depuis `app/`. Les lectures `rg --files`, `rg -n`, `cat` et inspections du lock/types installés ont servi à l’inventaire ; aucune conclusion d’inutilité ne repose sur un grep d’imports seul.

| Commande exacte | Résultat |
|---|---|
| `bun install --frozen-lockfile` | 0 ; 626 installations / 705 paquets vérifiés, aucun changement |
| `bun run check` | 0 ; 181 fichiers, zéro diagnostic, option `--error-on-warnings` conservée |
| `bun run typecheck` | 0 ; aucun diagnostic |
| `bun run test` | 0 ; 29 fichiers, 561 tests réussis |
| `bun run test -- tests/config/auth-consumer.test.ts tests/config/auth-server.test.ts tests/config/public-auth-boundary.test.ts convex/auth.test.ts convex/access.test.ts convex/catalogue.test.ts` | 0 ; 6 fichiers, 112 tests ciblés réussis (revue auth) |
| `bun run test:e2e -- tests/e2e/catalogue.spec.ts --project chromium > /tmp/macrova-e2e-catalogue.log 2>&1` | 0 ; 13/13 réussis en 39,6 s sur Vite standard, adaptateurs simulés |
| `E2E_COMPILED=1 bun run test:e2e > /tmp/macrova-e2e-compiled.log 2>&1` | 0 ; 25/25 réussis en 48,9 s. Client principal compilé ; serveur de panne reste Vite standard. Catalogue exclu par configuration, testé séparément |
| `bun run build` | 0 ; client, SSR et Nitro générés. Avertissements de bundling `MODULE_LEVEL_DIRECTIVE` sur `use client` Base UI/lucide ; aucune règle désactivée |
| `bun run verify:calculator` — première exécution | 1 ; 37/38 E2E passent. Le test catalogue détail expire avant montage : trace Chromium `net::ERR_INSUFFICIENT_RESOURCES`, module client non chargé. Build de la recette non exécuté après échec. Preuves : `/tmp/macrova-calculator.p84u78by/recipe.log`, `e2e.log`, trace conservée |
| `bun run verify:calculator` — seconde exécution inchangée | 1 ; 34/38 passent, quatre échecs avant hydratation ou montage ; traces montrent encore ERR_INSUFFICIENT_RESOURCES. Journaux conservés dans `/tmp/macrova-calculator.J0c63Y12/`. Build de cette recette non exécuté ; build applicatif séparé réussi |
| `curl --silent --output /tmp/macrova-404.html --write-out '%{http_code}\n' http://localhost:3001/page-inconnue-audit` | 0 ; HTTP 404 sur serveur isolé |
| `rg -a -o 'La page demandée est introuvable\.' /tmp/macrova-404.html` | 0 ; message français présent dans le SSR (première recherche sans `-a` avait signalé un contenu binaire) |

Depuis la racine, activation et résolution :

```bash
uv run --no-cache "/home/ubuntu/.t3/worktrees/macrova/t3-12e28a8b/_bmad/scripts/render_skill.py" --project-root "/home/ubuntu/.t3/worktrees/macrova/t3-12e28a8b" --skill "/home/ubuntu/.agents/skills/bmad-build"
uv run _bmad/scripts/resolve_config.py --project-root /home/ubuntu/.t3/worktrees/macrova/t3-12e28a8b --key core.active_initiative
uv run _bmad/scripts/resolve_customization.py --skill /home/ubuntu/.agents/skills/bmad-project-context --project-root /home/ubuntu/.t3/worktrees/macrova/t3-12e28a8b --key workflow
python -m unittest discover -s _bmad/scripts/tests -p test_resolve_customization.py
python3 -m unittest discover -s _bmad/scripts/tests -p test_resolve_customization.py
git diff --check
```

Activation 0, initiative `initiative-macrova`, résolution 0 avant/après : conventions, règles enfant et UX effectivement présentes. `python` échoue 127 (binaire absent), alternative `python3` réussit : sept tests, sortie 0. Diff check sans erreur.

Prérequis auth réelle vérifiés sans afficher les valeurs, depuis `app/` :

```bash
bun -e 'import { loadEnv } from "vite"; const e=loadEnv("development",process.cwd(),""); console.log(JSON.stringify({devDeployment:!!e.CONVEX_DEPLOYMENT?.startsWith("dev:"),cloudUrl:!!e.VITE_CONVEX_URL,siteUrl:!!e.VITE_CONVEX_SITE_URL,testEmail:!!process.env.E2E_AUTH_EMAIL,testPassword:!!process.env.E2E_AUTH_PASSWORD}));'
```

Sortie 0 ; les cinq indicateurs sont faux. `bun run test:e2e:auth` et `bun run test:e2e:remote` **non exécutés** : URLs/déploiement dev et compte de test absents. Aucune configuration ni compte externe créé. Login avec JS désactivé, révocation distante et session réelle après rechargement sont donc examinés dans le code/tests existants mais non revérifiés contre le service réel. La recette isolée neutralise Convex ; le montage catalogue simule les adaptateurs et ne valide ni OFF ni l’identité réelle.

## Résumé du diff et risques résiduels

- Code : un littéral 404 traduit ; aucun changement de logique, API, dépendance, validation, persistance ou autorisation.
- Instructions : provenance et deux déclencheurs ajoutés au bloc racine ; règles enfant intactes.
- Personnalisation durable : faits persistants app/AGENTS et conventions, sources UX ; defaults installés intactes.
- Documents : conventions décisionnelles, rapport de preuves et plan d’exécution. Aucun commit/push distant ni déploiement requis.

Points résiduels priorisés :

1. **Avant validation de l’identité réelle** : fournir un backend `dev:` dédié déjà configuré et un compte de test puis exécuter `bun run test:e2e:auth` selon README. Ne pas extrapoler les tests simulés.
2. **Fiabilité de la recette locale** : deux exécutions isolées échouent (37/38 puis 34/38), avec refus de ressources Chromium avant hydratation ou montage. Les cas échoués varient ; aucune régression métier démontrée. Les 25 tests du mode compilé et les 13 tests catalogue sur Vite standard passent. Ne pas déclarer la recette isolée verte ; mesurer le chargement des modules Vite et reproduire en CI avant correction du harness. Le plugin Start installé exclut Router de l’optimisation (src/plugin/vite.ts:91), donc ne pas imposer un prébundle qui contredit sa configuration. Les timeouts et assertions sont inchangés.
3. **Avant une actualisation BMAD** : relire le registre de conservation et contrôler le bloc généré ; les sources sont pérennes mais une synthèse LLM reste à revoir.
4. **Facultatif** : profiler chargement des polices et appels JWT, puis décider d’optimisations ; pinning des `latest` lors d’une mise à jour volontaire. Aucun impact mesuré justifiant ces changements ici.
5. **Limites de couverture** : Chromium uniquement, tests de reflow/clavier sur cas retenus, pas de certification WCAG ni de validation lecteur d’écran/appareil réel. Avertissements du bundler à suivre avec une mise à jour testée ; pas de suppression de diagnostic.

Les conditions d’ouverture produit déjà documentées (catalogue complet, paiement, données, exploitation) restent propres aux epics correspondants. Cet audit ne déclare pas CAP-1 à CAP-8 toutes livrées et ne constitue aucune certification juridique ou clinique.

Contrôle supplémentaire : tous les chemins `file:` de la personnalisation existent, `app/AGENTS.md` est identique à HEAD (comparaison octet à octet), `git diff --check` réussit. Lectures des traces ZIP par Python : erreurs réseau Chromium explicitement présentes ; aucune assertion métier modifiée.

## Revue indépendante

Revue quick context-free achevée : comparaison indépendante des 49 versions avec le verrou, contrôle des critères, des règles et de la résolution BMAD. Un cache Python produit par unittest était inclus dans le premier snapshot ; constat confirmé et corrigé par retrait du cache. Aucun autre constat établi. Les modes thorough et autres lenses ne sont pas exécutés, conformément au mode quick du plan. Résultats finaux : 561 tests unitaires, 25 E2E compilés et 13 E2E catalogue standard réussis ; deux recettes isolées échouées et auth réelle non exécutée restent explicitement indiquées.

Bilan du périmètre : correctif 404 démontré, règles BMAD et source pérenne vérifiées, aucune migration ni suppression. Les limites E2E isolées et d’identité réelle demeurent ouvertes avec prochaine action ; aucune réussite globale de la recette isolée ni garantie d’absence universelle de défaut n’est revendiquée.

Contrôle indépendant final : journaux compilé/catalogue comparés au rapport ; résultats fidèles, limites transparentes, aucun placeholder en cours et aucun constat supplémentaire. Affichage HTML facultatif tenté via `html_preview` : indisponible, sandbox navigateur T3 bloquée par AppArmor sur cet hôte ; aucune configuration hôte modifiée. Le tableau complet est livré dans ce rapport Markdown.

Clôture VCS : ajout explicite des six fichiers de mission avec `git add`, contrôle `git diff --cached --check` réussi et résumé `git diff --cached --stat` examiné. Commit local effectué par `git commit -m "chore: auditer les dépendances et pérenniser les conventions BMAD"` ; aucun push. La révision du commit est fournie dans la réponse de livraison pour éviter une référence circulaire dans son propre contenu.
