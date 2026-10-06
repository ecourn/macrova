---
title: 'Livraison SSR isolée et parcours intégré'
type: 'feature'
ticket: 5
created: '2026-10-06'
status: done
baseline_revision: 'c25398b3a8c93ed81b8890217baf219d2fef572b'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['app/AGENTS.md', 'app/convex/_generated/ai/guidelines.md', 'app/docs/hebergement-test.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le socle et ses contrats sont vérifiés localement, mais aucun serveur SSR autonome ni parcours HTTPS intégré n'est livré sur l'environnement choisi par 1.7.

**Approach:** Ajouter Nitro au build verrouillé, fournir une recette explicitement distante et publier le backend dédié avant le frontend Render Free Frankfurt. La délégation du propriétaire autorise les décisions courantes, comptes exclusivement synthétiques, commit et push de la révision validée et opérations de livraison nécessaires, dans le budget nul déjà confirmé. Les checkpoints sont résolus par « approuver et continuer ». La publication relève de l'orchestrateur après vérification locale ; l'agent d'implémentation prépare les fichiers et contrôles locaux sans opération distante.

## Boundaries & Constraints

**Always:** Réutiliser Better Auth, POST et protections avant hydratation. Convex reste autorité d'identité et persistance. Backend unique `dev:dazzling-puffin-856`, secret déjà distinct conservé côté backend. Render `macrova-socle-test`, workspace `tea-db2fsavlot8c73f24nr0`, instance Free Frankfurt, auto-deploy et previews désactivés. Origine HTTPS exacte identique à SITE_URL backend et VITE_SITE_URL frontend. Aucun identifiant ni jeton dans les logs applicatifs : uniquement codes d'erreur et identifiants techniques ; préserver propagation des pannes backend. Tests auth sans trace/capture contenant des credentials. Frontière test/production explicite et documentation de retour localhost.

**Never:** Offre payante, carte, domaine acheté, backend production, module métier fictif, fixtures déployables, télémétrie personnelle, API générique ou logique de droits SSR. Ne pas certifier une ouverture publique ni la conformité. Ne pas changer les contrats nutrition/commandes/mesures/accès. Aucun secret versionné ou VITE_* sensible.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Serveur compilé | Installation frozen, build et PORT/HOST | Assets servis et SSR public/connexion/privé fonctionnels | Échec build/start explicite |
| Recette distante | Origine HTTPS et backend dev cohérents | Aucun webServer local, tests sur la cible explicite | Refuser origine ambiguë, mode offline distant ou URLs backend étrangères |
| Session | Anonyme puis connexion synthétique puis révocation | Privé refusé sans session, SSR après reload, retour login après révocation | UNAUTHENTICATED backend distinct d'une panne |
| Intercompte | Deux comptes synthétiques, fermeture de A seulement | B ne lit pas le marqueur A et ne peut fournir ownerId pour le viser | Validation serveur refusant l'argument usurpé ; guards par ID restent testées dans convex-test |
| Erreurs | Nutrition invalide et requête privée anonyme | Codes partagés transportés sans secret ni donnée de compte | Une vraie panne n'est pas transformée en session absente |

</frozen-after-approval>

## Code Map

- `app/vite.config.ts`, `package.json`, `bun.lock` : Start 1.168.60, Vite 8, ajout plugin `nitro/vite` et script start Node ; sortie actuelle dist non autonome.
- `app/playwright.config.ts`, `tests/config/playwright.test.ts` : validation dev/cloud/site existante, mode offline neutralisé ; étendre origine distante sans serveur local, couvrir refus et préserver suite locale.
- `app/tests/e2e/auth.spec.ts`, `public.spec.ts` : inscription UUID, connexion, reload, révocation et protections existantes ; réutiliser. Ajouter recette contrats avec sessions synthétiques et JWT obtenu via relais auth ; aucune commande fixture déployée.
- `app/convex/account.ts`, `lib/access.ts`, `nutrition.ts`, `src/domain/contracts.ts` : APIs getAccess/close et nutrition déjà disponibles ; aucune nouvelle API requise. Compte fermé de recette jetable seulement.
- `app/src/lib/auth-server.ts`, `auth.functions.ts`, routes auth/dashboard : ne pas absorber les pannes ; examiner logs framework et backend lors de recette, minimiser au point d'émission si nécessaire.
- Investigation logs : Start server-functions-handler journalise et sérialise les erreurs brutes ; préserver une panne explicite avec code stable et ID technique, sans message/cause sensible. Better Auth fournit logger.log(level,message,...args), ne transmettre aucun args. Couvrir sanitation sans traduire en null. Nitro registre actuel 3.0.260903-beta, Node >=22.12 compatible ; vérifier la version au moment d'installation.
- `app/README.md`, `docs/hebergement-test.md`, nouveau `docs/livraison-ssr-test.md` et `render.yaml` racine : commandes, configuration reproductible et preuve de remise.
- Continuité 1.4 : contrats purs commandes/événements v1 sans persistance ; 1.7 : accès et budgets levés, backend américain existant conservé. Déploiement manuel d'un commit validé obligatoire.

## Tasks & Acceptance

**Execution:**
- [x] `app/vite.config.ts`, `package.json`, `bun.lock`, `render.yaml` — Nitro exact compatible, serveur autonome et configuration Free explicite ; installation verrouillée.
- [x] `app/playwright.config.ts`, `tests/config/playwright.test.ts`, `tests/e2e/` — origine distante auth HTTPS contrôlée, sans serveur local, session et probes contrats/intercompte ; valider la matrice sans credential externe requis pour les nouveaux comptes.
- [x] Points d'émission serveur identifiés par investigation — logs réduits aux codes/IDs techniques, sans masquer une panne ; tests appropriés si code ajouté.
- [x] `app/README.md`, `docs/livraison-ssr-test.md`, `docs/hebergement-test.md` — procédure backend puis frontend, secrets, commandes locales et distantes ; fiche effective complétée par orchestrateur.
- [x] Orchestrateur — publier backend dev puis commit testé sur Render Free, exécuter recette HTTPS et relever service, région, révision et contrôles des assets/logs.

**Acceptance Criteria:**
- Étant donné une installation verrouillée, lorsque le serveur compilé puis la cible Render sont testés, alors le parcours public → connexion SSR → lecture privée réussit avec assets et POST fonctionnels.
- Étant donné deux comptes synthétiques sur cette cible, lorsque lecture privée, fermeture propre, usurpation et révocation sont exercées, alors aucune lecture intercompte n'est obtenue et les erreurs sont distinctes.
- Étant donné la livraison, lorsque la fiche est consultée, alors URL HTTPS, backend isolé, commit, région et preuves sont réels ; aucun secret ou module métier fictif n'est livré.

## Implementation Notes

Estimation supérieure à 100 lignes et plusieurs couches : route full. Le propriétaire demande explicitement de répondre aux questions à sa place et poursuivre jusqu'à achèvement ; approbation par délégation. Publication nécessaire à l'intention malgré la règle générique locale du workflow ; aucun coût nouveau autorisé.

Implémentation locale : Nitro exact 3.0.260903-beta, start Node, blueprint Free et versions Bun/Node exactes. Recette distante sans webServer, fermeture/isolation via APIs existantes et comptes synthétiques autonomes. Lecture JWT SSR explicite : seul HTTP 401 devient null ; les erreurs du SDK betterFetch pouvaient auparavant absorber les 5xx. Client Convex SSR sans logger et erreurs techniques UNAVAILABLE avec incidentId sans cause sensible, logger Better Auth minimisé. Aucun contrat ou schéma modifié.

Investigation de recette HTTPS : le fallback Nitro journalisait aussi les erreurs de transport `aborted` avec cause `ECONNRESET`. Un handler personnalisé via l’option officielle `errorHandler` renvoie une erreur JSON technique et conserve le status HTTP utile ; les logs sont limités aux codes transport connus ou `HTTP_ERROR` / `UNAVAILABLE`, plus un ID d’incident. Aucun changement de console globale ni absorption de panne. Cinq tests ciblés couvrent message/cause/payload/en-têtes sensibles, déconnexion réseau et codes inconnus ; typecheck, check et build `render-com` réussis. Le serveur compilé place ce handler avant le fallback Nitro.

Audit suivant : H3 journalise les erreurs `unhandled` dans `prepareResponse` avant son appel `onError`, donc avant le handler Nitro personnalisé. Un plugin Nitro configure l’option officielle `silent` de cette seule instance H3 pour retirer ce doublon brut ; le handler continue de journaliser code/ID et renvoyer la panne. Le test d’intégration ouvre un vrai socket HTTP puis interrompt la lecture JSON : un seul log `ECONNRESET`/UUID et serveur encore utilisable. Une sonde éphémère locale sur le serveur compilé `render-com` a reproduit trois corps interrompus et contrôlé stderr : exactement trois logs techniques, aucune stack/cause/message, réponse publique HTTP 200 ensuite. Aucune route de sonde ni fixture ajoutée au build déployable.

## Plan Change Log

## Review Triage Log

Revue préalable à publication du 6 octobre : medium / patch, auth.spec.ts, chaînes vides conservées par ?? malgré leur autorisation distante ; fallback synthétique corrigé. Medium / patch, package.json et playwright.config.ts, commande remote pouvait lancer localhost sans E2E_BASE_URL ; marqueur de mode imposant l'origine distante et test de refus ajoutés. Medium / tâche restante, fiche effective sans URL/ID/révision et recette HTTPS non exécutée ; preuves connues manquantes à ce point, publication et recette prises en charge avant revue finale, aucun report ni acceptation prématurée.

Revue finale indépendante : medium / patch, `app/src/start.ts`, le décodeur RPC TanStack attrape en interne puis journalise et sérialise un payload GET malformé avant notre catch. Reproduction sur un RPC compilé : SyntaxError avec extrait synthétique et stack. Le contrat de logs était déjà explicite ; correction limitée à la validation du transport exposé avant ce décodeur, sans API publique ni remplacement de console/dépendance. Test réel compilé étendu aux payloads JSON/Seroval invalides et au RPC valide. Aucun report. Revue indépendante du diff corrigé : aucun bug, critère manquant ou violation confirmé ; panne backend 503 sondée sur le RPC compilé, erreur UNAVAILABLE préservée sans fuite.

## Verification

Depuis `app/` : `bun install --frozen-lockfile`, `bun run test`, `bun run typecheck`, `bun run check` (zéro diagnostic), `bun run build`, serveur `bun run start` avec PORT/HOST, suite offline et auth locale si backend localhost. Recette distante explicite sur Render, tests contrats (nutrition/accès/intercompte) et sessions ; contrôler assets et logs sans imprimer secrets. Revue indépendante du diff complet, corriger puis répéter uniquement les contrôles affectés. Les gardes de références par ID restent vérifiées dans les tests existants, aucune API de test publique ajoutée.

Vérification locale du 6 octobre : installation frozen, 127/127 tests (11 fichiers, aucun skip), types et check (128 fichiers, aucun diagnostic), builds node-server et render-com réussis. Avertissements tiers MODULE_LEVEL_DIRECTIVE pendant build seulement. Offline Vite 4/4 et compilé render-com 4/4 ; smoke Node HOST=0.0.0.0 PORT=3099, pages public/login SSR et privé anonyme, formulaire POST et six assets HTTP 200. Orchestrateur : tests 127/127, typecheck et check relus/exécutés avec sortie 0. Matrice config distante couverte par tests/config/playwright.test.ts, panne/401 par auth-server.test.ts et server-errors.test.ts ; sessions et isolation réelles attendent recette HTTPS.

### Livraison et validation finales

Backend dédié sélectionné et URL cloud/site vérifiées ; absence de clé prioritaire locale contrôlée. SITE_URL passé à https://macrova-socle-test.onrender.com, secret auth existant conservé sans extraction ; `bun run convex:dev --once --tail-logs disable` réussit à 14:20 UTC, backend publié avant frontend. Render : srv-db2g7nqjnfac73cohoi0, workspace tea-db2fsavlot8c73f24nr0, free/frankfurt, autoDeploy no, previews off, sept variables publiques exactes et aucune clé backend. Budget Hobby sans carte conservé, aucune nouvelle offre, base, disque ou domaine. Révision applicative active `95bc8899e88aeb3ef9f8bfb965a0b411a21cb226`, déploiement `dep-db2gq3h42hec73ane5s0`, live 2026-10-06T15:02:02.443767Z, relevé API canonique. Les commits de livraison intermédiaires ont permis de corriger les erreurs observées, sans changement de contrats ou backend production.

Matrice auditée : serveur compilé et six assets HTTP200 sur Render ; configuration distante et refus couverts par 17 tests config ; absence/401 et pannes par auth-server/server-errors ; sessions par trois scénarios auth réels et deux publics ; intercompte, refus d'ownerId et JWT révoqué par contracts.spec.ts sur backend réel. Les guards par référence ID restent dans les tests Convex existants exécutés. Erreurs nutrition/access transportées pendant la recette ; sanitation Nitro/H3/Start couverte par tests dédiés et `node tests/integration/start-abort.mjs` (trois POST auth réellement interrompus, backend HTTP synthétique loopback, logs techniques seulement, CSRF RPC403, accueil200). Aucun test fixture déployé, aucun skip.

Résultats orchestrateur : 146/146 tests, 15 fichiers ; typecheck0 ; check138 fichiers, zéro diagnostic ; build render-com0 ; intégration Start1/1 ; recette HTTPS finale6/6 en22,8s, sans webServer local. Après recette : quinze lignes Render dont huit erreurs code/UUID, aucun aborted brut, e-mail ou JWT ; cent événements Convex sans pattern e-mail/JWT/credential. Six assets HTTP200 sans credentials locaux. Le getter BetterAuth contenant le nom de variable BETTER_AUTH_SECRET est du code générique sans sa valeur ; aucun secret backend n'a été extrait. Les avertissements MODULE_LEVEL_DIRECTIVE du build tiers sont distincts du check, qui est sans avertissement. Nitro beta exact reste un risque de mise à jour à surveiller ; service Free peut dormir.

Preuves de session locales : /tmp/macrova-story15-e2e-final.log, /tmp/macrova-story15-final-proof.json, /tmp/macrova-story15-deploys-final.json et test d'intégration persistant dans app/tests/integration/start-abort.mjs. Aucun log brut ou secret ajouté à Git. Fiche effective et retour localhost documentés dans app/docs/livraison-ssr-test.md ; `.env.local` ignoré aligné sur la cible HTTPS. Le périmètre livré est le socle de test, sans ouverture produit publique, restauration (1.8) ni modules métier fictifs.

Validation complémentaire du décodage RPC : neuf tests ciblés et intégration compilée réussis ; quatre payloads JSON/Seroval malformés HTTP400, réponses/logs limités à code/UUID, GET Seroval valide HTTP200, CSRF403 et trois abandons auth sans fuite. Seroval 1.6.8 déclaré directement, version déjà verrouillée ; plugins officiels identiques client/server confirmés, aucun adaptateur additionnel dans le runtime.

Clôture : révision corrigée 95bc8899e88aeb3ef9f8bfb965a0b411a21cb226 active sur Render, six parcours HTTPS réussis en 22,8s ; contrôle RPC distant quatre refus400 sans fuite, GET valide200 et CSRF403. Audit post-recette : quinze lignes Render dont huit codes/UUID, aucun payload synthétique ou erreur de décodage brute ; cent événements Convex contrôlés. Revue finale du diff corrigé sans finding confirmé, aucun élément différé.

## Clôture acceptée — 6 octobre 2026

Decision: Passage à `done` demandé par le propriétaire au vu des preuves de livraison et de recette finale consignées ci-dessus et dans `app/docs/livraison-ssr-test.md`, « Fiche effective — 6 octobre 2026 ». Backend publié avant frontend, révision `95bc8899e88aeb3ef9f8bfb965a0b411a21cb226` livrée, recette HTTPS 6/6 et six assets HTTP 200 ; sessions, révocation, isolation intercompte, erreurs et logs contrôlés. Les vérifications locales finales et la revue corrigée sont réussies, sans élément différé. La restauration et l'exploitation restent dans le périmètre de 1.8.
