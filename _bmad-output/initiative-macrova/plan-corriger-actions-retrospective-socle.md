---
title: Corriger et revalider les frontières auth du socle
type: bugfix
created: 2026-10-07
status: built
ticket: ""
baseline_revision: a97e0dbdeea7f2f449069c6f162945b9a1efe825
route: full
route_source: auto
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - /home/ubuntu/macrova/AGENTS.md
  - /home/ubuntu/macrova/app/AGENTS.md
---

<frozen-after-approval reason="Intent et arbitrages délégués par le propriétaire">

## Intent

**Problème :** La rétrospective du socle a établi deux défauts de frontière auth (A1 : réponses HTTP5xx brutes ; A2 : JWT vide assimilé à absence), une lacune de régression du consommateur Convex SSR (A3) et un état documentaire périmé (A6). Ces écarts empêchent de considérer le socle comme correctement vérifié.

**Approche :** Sanitiser toutes les réponses auth HTTP5xx avant leur retour, refuser un token vide ou uniquement blanc, exercer les consommateurs réels et restituer un état d’exploitation daté. Revalider les parcours publics et de session sur le code corrigé, puis la cible HTTPS isolée. Le propriétaire délègue les arbitrages et l’approbation du plan : poursuivre tous les objectifs liés au réexamen du socle.

## Boundaries & Constraints

**Always :** Réutiliser BackendUnavailableError et son UUID ; erreur navigateur et log du relais ne contiennent que code/incidentId. Préserver réponses normales, cookies, redirections et erreurs métier 4xx du SDK, 401 JWT reste absence. Tester le vrai ConvexHttpClient, sans mock qui cacherait la réactivation de son logger. Ne pas masquer les erreurs backend en session anonyme. Préserver les traces historiques des plans et de la rétrospective par ajouts datés. Distinguer test résolu, production encore ouverte et réception humaine non prouvée. Exécuter check sans avertissement, tests, typecheck, build et parcours concernés.

**Never :** Traiter A4/A5/A7, modifier schéma/backend, ajouter une borne JWT dans ce correctif, exposer secrets ou credentials dans les sorties, publier/pousser/déployer, prétendre que la cible distante exécute un correctif local, inventer une réception de notification humaine.

## I/O & Edge-Case Matrix

| Scénario | Entrée | Résultat | Erreur |
| --- | --- | --- | --- |
| Relais panne HTTP | 500/503 avec corps et en-têtes synthétiques sensibles | HTTP503 JSON code/UUID, sans en-têtes/corps arbitraires ; log code/UUID | UNAVAILABLE |
| Relais panne transport | fetch rejeté | Même frontière sanitizée | UNAVAILABLE |
| Relais normal | 200, 302 avec cookie/location, 400/401 | Réponse SDK préservée | Aucune conversion en panne |
| JWT absent | HTTP401 | null ; consommateur anonyme sans query privée | Absence normale |
| JWT malformé | HTTP200 token vide/blanc/non-string ou JSON invalide | Consommateur rejette, aucune query | UNAVAILABLE |
| Query authentifiée rejetée | JWT valide puis HTTP erreur ou réponse Convex error avec logLines sensibles | Erreur code/UUID sans message/cause/corps/données/log brut | UNAVAILABLE |
| Query authentifiée valide | JWT valide, résultat Convex | Résultat et Authorization conservés | Aucune erreur |

</frozen-after-approval>

## Code Map

- `app/src/lib/auth-server.ts` : getToken contrôle le type seul ; handler transmet directement la Response SDK ; fetchAuthQuery utilise déjà backendOperation et logger:false.
- `app/src/lib/server-errors.ts` : erreur commune sans cause ; réutiliser sans changement.
- `app/src/lib/auth.functions.ts` : getCurrentUser appelle getAuthToken puis fetchAuthQuery ; tester son callback en isolant seulement la plomberie createServerFn.
- `app/tests/config/auth-server.test.ts` : mocks fetch et Headers, SDK réel ; compléter. Ajouter au besoin un fichier consommateur dans le même dossier (inclus par vitest).
- `app/node_modules/convex/src/browser/http_client.ts` : query appelle /api/query ; réponse status:error/errorMessage/errorData/logLines permet de tester sanitation et logger réel.
- `app/docs/exploitation-socle.md`, `app/README.md` : cron décrit comme non publié. Ajouter état daté et preuve GitHub réelle.
- `_bmad-output/initiative-macrova/epic-socle/epic-socle.md`, `architecture-app/architecture-app.md`, `deferred-work.md` : compléter inconnues infrastructure de test et structure livrée, conserver histoire.
- `app/docs/hebergement-test.md`, `app/docs/livraison-ssr-test.md` : décisions effectives et limites cloud/reprise.
- `app/tests/integration/start-abort.mjs` : exercice serveur compilé, à relancer après build ; E2E offline et auth distants configurés dans playwright.config.ts.

### Preuves A6 disponibles

Vérification gh en lecture seule le 7 octobre 2026 : socle-monitor.yml actif (id 376762350), trois schedule success ; dernier run https://github.com/ecourn/macrova/actions/runs/37627836923 créé 2026-10-07T13:21:25Z sur 26dc7a76a1f17ce8cad1b000837ba256c4146d73. Main distante a97e0dbdeea7f2f449069c6f162945b9a1efe825. Notifications du dépôt all=true vides ; subscription HTTP404/scope notifications nécessaire ; aucun échec disponible. Réception humaine non établie, à suivre par propriétaire du dépôt au premier incident réel ou test du canal autorisé. Ne pas provoquer un échec artificiel.

Test livré : Render Free Frankfurt, Convex Free dev:dazzling-puffin-856 aws-us-east-1, budget nouveau 0 EUR, reprise locale racine et SSR historique exercée. Sources docs hébergement/livraison/exploitation. Ajouter complément daté au plan 1.8 également, sans changer son histoire. Production : régions/budget, RPO/RTO, restauration cloud complète/composant auth et SLA restent ouverts.

## Tasks & Acceptance

**Execution :**
- [x] `app/src/lib/auth-server.ts` — corriger A1/A2 avec sanitation commune existante.
- [x] `app/tests/config/auth-server.test.ts` et tests consommateur — couvrir toute la matrice, surtout A3 via client réel.
- [x] `app/docs/exploitation-socle.md`, `app/README.md`, documents epic/architecture/deferred-work — ajouter état daté A6 après contrôle gh en lecture seule ; vérifier séparément la possibilité de prouver réception des notifications.
- [x] Ce plan et rétrospective — consigner vérifications, portée distante/historique et clôture des actions sans effacer les constats initiaux.

**Acceptance Criteria :**
- Given une panne auth synthétique, when le relais ou le consommateur SSR est exercé, then seuls les détails techniques sanitizés traversent la frontière et aucune panne ne devient session absente.
- Given un client Convex réel et un JWT valide, when la query échoue avec logLines sensibles, then le test échoue si backendOperation ou logger:false sont retirés.
- Given les documents historiques, when leur état actuel est lu, then supervision test active et décisions test livrées sont explicites, production et réception humaine restent correctement qualifiées.
- Given le correctif local, when la recette compilée/public/session est exécutée, then les parcours passent ; la recette distante reste explicitement une validation de la cible antérieure.

## Implementation Notes

- A1/A2 : relais HTTP5xx passé par BackendUnavailableError ; token vide/blanc refusé. Réponses SDK normales préservées. L’orchestrateur a conservé la réponse de configuration absente préexistante après lecture du test hors ligne, pour éviter une modification de contrat sans rapport avec A1.
- A3 : nouveau `app/tests/config/auth-consumer.test.ts`, seules plomberie Start et Headers isolées ; SDK et ConvexHttpClient réels. Tests HTTP et ConvexError avec logLines, message et données sensibles synthétiques. Mutations temporaires : retirer logger:false fait échouer un test ; retirer backendOperation fait échouer deux tests ; code restauré.
- Complément intégré dans `app/tests/integration/start-abort.mjs` : vrai serveur compilé, relais HTTP500/503, JWT vide/blanc et query rejetée ; aucun contenu synthétique sensible dans réponse ou logs, panne SSR HTTP500 sans redirection anonyme.
- A6 : README, exploitation, epic, architecture, deferred-work et complément plan 1.8 réconciliés ; histoire préservée. Notifications examinées séparément et réception non prouvée suivie.
- Recette auth native : copie jetable préparée par recovery:socle, wrapper anonymous ports 3340/3341, secret généré uniquement dans backend local, SITE_URL localhost:3330. Build render-com aux URL loopback puis configuration Playwright temporaire reprenant les six scénarios existants, sans traces/captures ; aucune configuration du backend cloud changée. Config temporaire requise car la configuration habituelle exige un backend cloud dev:. Aucun exercice de perte/import nécessaire pour ces corrections.
- Build final rétabli avec configuration du checkout. Aucun push/déploiement ; la recette HTTPS observe la révision publiée antérieure.

## Plan Change Log

## Review Triage Log

Revue quick indépendante : 0 high, 0 medium, 0 low, 0 false, 0 maybe-false.
Aucun défaut établi ; 29 tests ciblés relais/consommateur exécutés par le reviewer,
tous réussis. Aucun correctif ni loopback requis. Seul suivi distinct : réception
humaine des alertes, déjà qualifiée non établie et confiée au propriétaire du dépôt.

## Verification

- Depuis app : `bun run test`, `bun run typecheck`, `bun run check`, `bun run build` ; zéro diagnostic bloquant.
- `node --test tests/integration/start-abort.mjs` et recette compilée locale ; revalidation auth locale sur backend dev si possible sans altérer la cible publiée.
- `bun run monitor:socle` puis `E2E_AUTH_EMAIL="" E2E_AUTH_PASSWORD="" E2E_BASE_URL=https://macrova-socle-test.onrender.com bun run test:e2e:remote` ; documenter code distant antérieur.
- Contrôler par mutation temporaire l’efficacité A3 puis restaurer le code.

### Résultats exécutés — 7 octobre 2026

- `bun run test` : **195/195**, 19 fichiers, zéro skip, sortie 0.
- `bun run typecheck` et `bun run check` : sortie 0 ; **145 fichiers, zéro erreur/avertissement**.
- Build SSR render-com local : sortie 0 ; avertissements tiers MODULE_LEVEL_DIRECTIVE déjà présents, aucune suppression de règle.
- `node --test tests/integration/start-abort.mjs` : **1/1**, HTTP500/503 auth sanitizés, JWT vide/blanc et query Convex rejetée HTTP500 sans fuite, trois POST interrompus, 12 logs code/UUID, CSRF403, payloads RPC invalides400, accueil/RPC valide200.
- Recette compilée + Convex natif local : **6/6** en 10,8 s ; protection avant hydratation, inscription/persistance/révocation, connexion/déconnexion, refus anonyme, fermeture/isolation/ownerId usurpé et nutrition invalide.
- `bun run test:e2e` : **4/4** en 8,8 s ; public et backend absent.
- Audit matrice : chaque ligne est couverte par les tests auth-server/auth-consumer passés ; relais normal, transport, HTTP5xx, JWT401/malformé et query valide/erreur sont tous exécutés. Les pannes du consommateur sont aussi exercées sur le serveur compilé.

- Build final avec configuration du checkout : sortie 0 ; mêmes avertissements tiers. Intégration compilée répétée après build final : 1/1.
- `bun run monitor:socle` : SOCLE_SSR_OK/SOCLE_CONVEX_OK, sortie 0.
- Recette distante HTTPS : **6/6** en 23,8 s, sortie 0 ; cible antérieure sans correctif local publié.

- Revue quick indépendante : aucun défaut établi ; 29 tests ciblés passés.
- Vérification finale `bun run check` : 145 fichiers, zéro diagnostic ; `git diff --check` sortie 0.
- Backend local jetable arrêté ; copie, stockage auth et secret local synthétique supprimés. Configuration cloud inchangée.
