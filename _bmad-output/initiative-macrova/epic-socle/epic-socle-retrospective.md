---
epic: epic-socle
date: 2026-10-07T14:20:11Z
verdict: rejected
criteria: declared
headless: false
---

# Rétrospective du socle

## Epic summary

Épic : socle partagé et livraison maîtrisée. Revue de HEAD `20270917f3bbf8b2b05d29a19556012d63c56f41`, sans modification applicative.

Le propriétaire a délégué les questions et arbitrages. Focalisation retenue : frontières session SSR, autorisation, fermeture, livraison et reprise. Discussion collective non demandée.

Ordre de construction : 1.1, 1.2, 1.3, 1.4, 1.7, 1.5, 1.8, 1.6. Les sept premiers sont `done/done` ; 1.6 est `built/review`, donc terminé au sens du workflow, sans clôture humaine. `pending_tickets = []`.

| Ticket | Plage Git |
| --- | --- |
| 1.1 | `f2af0670311047e05359c2515ad665300aed092a..aa522a3550f18230b6be4a68655deb458cbf02bc` |
| 1.2 | `aa522a3550f18230b6be4a68655deb458cbf02bc..80a2334829e84a6144b7b2753a565e9c92f618e1` |
| 1.3 | `80a2334829e84a6144b7b2753a565e9c92f618e1..7a97fad51a481741c8c93ca1b6d8565d90857adb` |
| 1.4 | `7a97fad51a481741c8c93ca1b6d8565d90857adb..9e3b1e10fc3fef90e89bf6fe2827156c21ea71d1` |
| 1.7 | `9e3b1e10fc3fef90e89bf6fe2827156c21ea71d1..c25398b3a8c93ed81b8890217baf219d2fef572b` |
| 1.5 | `c25398b3a8c93ed81b8890217baf219d2fef572b..fe78c8b95e50e4724e8aeb7e4f16007d38ec546c` |
| 1.8 | `fe78c8b95e50e4724e8aeb7e4f16007d38ec546c..ef544fba0e211a47b3d497428ccfc807ca9cb6d1` |
| 1.6 | `ef544fba0e211a47b3d497428ccfc807ca9cb6d1..20270917f3bbf8b2b05d29a19556012d63c56f41` |

La dernière borne HEAD est inférée ; elle est aussi le commit de nettoyage 1.6. Les huit baselines sont présentes et ordonnées dans une histoire linéaire : 27 commits distincts, aucune fusion, aucun chevauchement. `git_evidence.py` exécuté une fois par plage ; attribution par plage lorsque le sujet ne cite pas de ticket.

Inventaire : épic et ses quatre critères Done when déclarés ; initiative et renvoi à la spécification ; huit entrées `find` avec description/verify/covers ; huit plans avec baseline, revue et vérifications ; aucun fichier story raffiné (story_file=null pour chacun). SOC-1 à SOC-4 sont définis dans l’épic, tandis que les Requirements de l’initiative renvoient aux CAP de la spécification. Documentation de livraison et exploitation, registre des reports et tests disponibles. Journaux de conversation complets non identifiés : enseignements de processus limités aux faits consignés dans plans et commits, sans reconstruire les intentions. Preuves techniques historiques disponibles et lues : `/tmp/macrova-story15-final-proof.json` et `/tmp/macrova-story15-e2e-final.log` (recette 6/6, révision 95bc889, échantillon de 15 lignes Render dont 8 erreurs sanitizées) ; `/tmp/macrova-story18-evidence/proof.json`, `proof-ssr.json` et `proof-final.json`. Ce sont des fichiers locaux temporaires, non garantis dans un autre checkout. Les résultats essentiels sont repris ci-dessous ; aucun secret, cookie ou archive consulté. Le fichier assets-proof décrit une itération antérieure (noms d’assets différents) ; il n’est pas assimilé à la preuve finale.

Les plans ne constituent pas des journaux complets de conversation. Aucune analyse de cause de processus ou d’intention abandonnée n’est déduite de leur absence. Les propositions de prévention ci-dessous portent sur les chemins de code et les écarts observés.


## Findings

### Vues agrégées

**Frontières respectées dans le périmètre inspecté.** Le domaine est neuf à la baseline `f2af067` ; analyse déterministe des imports directs dans `src/domain`, `convex/contracts`, `convex/lib` et `src/lib` : aucun cycle dans ce sous-graphe, aucun import React/Convex/réseau dans le domaine. Ce résultat ne constitue pas un graphe exhaustif des dépendances tierces. Nutrition réutilise le domaine ; droits, identité et fermeture restent backend. Sources : `architecture-app/architecture-app.md:51`, `app/src/domain/*.ts`, `app/convex/nutrition.ts:2`, `app/convex/lib/access.ts:15`, `app/convex/account.ts:26`. Disposition : accept as-is ; préserver ces frontières dans les futurs modules.

**Taille et duplication.** Le pré-pass cumulé classe `recovery-socle.ts` à 354 ajouts/0 suppression et 354 lignes actuelles, `commands.ts` à 251/0 et 251 lignes actuelles. Le runner regroupe préparation, validation de cible, CLI et preuve d’un exercice isolé ; commands regroupe contrat, canonicalisation, empreinte et replay. Aucun god-class établi. Les deux plus gros fichiers de tests (`access.test.ts`, 316 lignes ; `food.test.ts`, 286) ne sont pas des services applicatifs. README est transversal : 235 ajouts/7 suppressions, 438 lignes actuelles. Les validateurs structurels Convex et sémantiques du domaine sont complémentaires, avec tests de transport communs (`app/convex/contracts.test.ts:31`). Aucune implémentation concurrente de calcul/droit identifiée dans ces surfaces. Limite : comparaison ciblée des responsabilités et imports, sans détecteur exhaustif de clones. Disposition : accept as-is ; ne pas déduire une dette du seul churn.

**Périmètre produit préservé.** Catalogue, solver, paiement, reçus persistés, collecte d’événements et export/suppression complète sont des consommateurs futurs. Leur absence n’est pas un défaut du socle (`epic-socle.md:33`, `:55`, plans 1.3/1.4, sections Boundaries). Fermeture durable et test après suppression auth sont présents (`app/convex/access.test.ts:208`). La reprise documente honnêtement la perte des seules tables racine, sans preuve de reprise cloud totale (`app/docs/exploitation-socle.md:212`). Disposition : accept as-is ; conserver ces limites dans les critères des prochains epics.

### Constats consolidés et routage

**F1 — Réponse HTTP 5xx auth transmise brute (adversarial, confirmé).**

- Source : `app/src/lib/auth-server.ts:60`, SDK installé `@convex-dev/better-auth/src/react-start/index.ts:77`, test `app/tests/config/auth-server.test.ts:54`.
- Déclencheur : le backend renvoie une Response 500 au lieu de rejeter fetch. Le relais retourne directement cette réponse ; son catch ne s’exécute pas. Une sonde sur le module actuel avec fetch synthétique confirme HTTP500, corps `synthetic-sensitive-error` et en-tête synthétique conservés.
- Conséquence : un message interne ou un en-tête sensible présent dans une panne backend peut atteindre le navigateur. Aucune fuite de secret réel observée : reproduction exclusivement synthétique.
- Instance : **fix now** (A1). Prévention : vérifier séparément rejet réseau et réponse HTTP d’erreur, avec assertions de corps/en-têtes ; ne pas assimiler catch à sanitation exhaustive. Ce constat bloque l’acceptation de la frontière auth.

**F2 — JWT vide assimilé à session absente (adversarial, confirmé).**

- Sources : `app/src/lib/auth-server.ts:36`, `app/src/lib/auth.functions.ts:16`, `app/tests/config/auth-server.test.ts:43`.
- Déclencheur : HTTP200 `{ token: "" }` passe le seul contrôle typeof string. Sonde actuelle : chaîne vide acceptée ; `getCurrentUser` la traite ensuite comme anonyme.
- Conséquence : une réponse backend invalide est masquée par un retour normal vers la connexion, alors que le contrat distingue absence de session et panne.
- Instance : **fix now** (A2). Prévention : définir et tester le token vide/blanc comme réponse malformée, distincte de HTTP401. Bloque la garantie de traitement explicite des pannes.

**F3 — Sanitation de la query SSR authentifiée sans test du consommateur (verification-gap, confirmé).**

- Sources : `app/src/lib/auth-server.ts:40`, `app/src/lib/auth.functions.ts:17`, `app/tests/config/auth-server.test.ts:6`, `app/tests/config/server-errors.test.ts:8`, `app/tests/integration/start-abort.mjs:24`.
- Recherche dans tout app par `fetchAuthQuery`, `ConvexHttpClient` et `backendOperation` : tests du wrapper isolé et JWT/relais, aucun appel de test à fetchAuthQuery. L’intégration compilée répond 401 au JWT ; les E2E auth ne provoquent pas une panne de query après JWT valide.
- Démonstration : enlever l’enveloppe backendOperation de client.query ou réactiver le logger laisse passer les tests examinés malgré une erreur query brute. Le code actuel protège cette frontière ; c’est une lacune de régression, pas une fuite déjà observée.
- Instance : **fix now** (A3). Prévention : tester le chemin du consommateur JWT valide → query rejetée → code/UUID, absence de cause/corps/log brut, en plus du helper isolé.

**F4 — Attente JWT sans borne applicative (edge-case-hunter, confirmé sur le code).**

- Sources : `app/src/lib/auth-server.ts:26`, `:31`. L’appel fetch n’a ni signal de timeout ni annulation ; la sonde confirme l’absence de signal sortant.
- Déclencheur : transport qui reste ouvert ou corps JSON qui ne termine pas. Aucune borne définie dans ce module ; les délais de plateforme/transport ne prouvent pas un retour UNAVAILABLE au niveau applicatif.
- Instance : **defer** (A4) ; aucune panne réelle de cette forme reproduite sur la cible. Prévention : définir une borne commune couvrant en-têtes et consommation du corps, puis exercer le flux bloqué avec transport synthétique. Ne pas promettre un délai actuellement garanti.

**F5 — Validation de date divergente entre nutrition et contrats communs (edge-case-hunter / pattern divergence).**

- Sources : `app/src/domain/food.ts:19`, `:58`, `app/src/domain/access.ts:15`, `app/src/domain/food.test.ts:120`, `:232`.
- Déclencheur reproduit : capturedAt = Number.MAX_SAFE_INTEGER est accepté par validateFoodSnapshot, refusé par isUtcTimestamp et non représentable par Date (`toISOString` lève RangeError). Même prédicat pour density.capturedAt.
- Conséquence : les futurs lecteurs de provenance/export peuvent recevoir une date non représentable malgré un instantané validé. Aucun consommateur actuel convertissant capturedAt en ISO identifié dans la recherche `capturedAt|toISOString` ; risque aval, sans panne produit actuelle démontrée.
- Instance : **defer** (A5), à traiter avant adoption par le catalogue. Prévention : partager la définition d’horodatage et éprouver exactement la borne Date et son premier dépassement sur domaine et transport Convex.

**F6 — État d’exploitation et inconnues historiques devenus périmés (réconciliation documentaire).**

- Sources : `app/docs/exploitation-socle.md:210`, plan 1.8:102, `../deferred-work.md` section Résolution ; ils annoncent cron non publié. Épic `epic-socle.md:49` conserve hébergeur/région/coûts/restauration à définir. La spine décrit explicitement une Structure initiale (`architecture-app.md:148`) : ce n’est pas une assertion du code actuel, mais aucune photographie finale n’y succède.
- Preuve actuelle en lecture seule : main distante = `20270917f3bbf8b2b05d29a19556012d63c56f41` ; API GitHub workflow socle-monitor = active ; trois dernières exécutions schedule complétées avec success, dont [run 37627836923](https://github.com/ecourn/macrova/actions/runs/37627836923), créée le 7 octobre à 13:21:25 UTC sur `26dc7a7`. La documentation historique ne prévaut pas sur cet état. Les notifications humaines ne sont pas établies par ces runs.
- Instance : **fix now** (A6, réconciliation proposée), sans réécrire les traces historiques ; ajouter état daté et distinguer décisions de test résolues des décisions de production encore ouvertes. Prévention : relever l’état GitHub réel après publication ; un statut done ou un cron configuré ne suffisent pas à le déduire.

**F7 — Version de fermeture implicite (réconciliation de contrat, interprétation à trancher).**

- Sources : `epic-socle.md:29`, `app/src/domain/access.ts:9`, `app/convex/contracts/access.ts:8`, `app/README.md:305`.
- Done when 2 demande une définition commune versionnée ; les droits transportent version, la fermeture ne transporte que closedAt et son enveloppe n’a pas de version. Les preuves de reprise parlent d’un lecteur v1, sans identifier précisément où réside la version de fermeture.
- Aucune incompatibilité actuelle prouvée ; « définition versionnée » n’impose pas à elle seule un champ dans chaque objet. Instance : **defer** (A7, réconciliation proposée), sans changement automatique de schéma. Prévention : préciser version du contrat/enveloppe et règle d’évolution compatible avant le consommateur demandes de données. Ce point n’est pas le motif du rejet.

### Revue et vérification des rapports

bmad-review appliqué au diff applicatif + GitHub `f2af067..2027091`, via trois reviewers indépendants : adversarial, edge-case-hunter, verification-gap. Vues agrégées déléguées séparément ; constats retenus recontrôlés sur sources primaires par l’orchestrateur. Le candidat « inscription pouvant finir après abandon client » est écarté comme défaut d’acceptation : aucune règle de cet épic n’exige annulation/rollback de la commande lors de l’abandon ; le test compilé vise la sanitation des interruptions. Le délai JWT et les dates sont conservés avec leur portée explicite. Les opinions sans preuve et les anciennes dépendances 1.7 déjà résolues ne sont pas routées comme défauts ouverts.


## Behavior verification

### Exécuté pendant cette rétrospective

- Depuis `app/`, `bun run test` : **173/173 tests, 18 fichiers, zéro skip**, sortie 0. `bun run typecheck` : sortie 0. `bun run check` : 144 fichiers, aucun diagnostic, sortie 0. Aucun build répété : aucune modification applicative, build final antérieur consigné dans les plans.
- `bun run monitor:socle` sur les vrais services : **SOCLE_SSR_OK, SOCLE_CONVEX_OK**, sortie 0.
- `E2E_AUTH_EMAIL="" E2E_AUTH_PASSWORD="" E2E_BASE_URL=https://macrova-socle-test.onrender.com bun run test:e2e:remote` : **6/6 réussis**, sortie 0, sans serveur local. Compte de test généré par les scénarios, aucune donnée réelle ; captures/traces auth désactivées par la configuration. Les scénarios ont réellement exercé protection avant hydratation, inscription, connexion, lecture Convex après rechargement, révocation, déconnexion, refus anonyme, fermeture propre, isolation d’un autre compte, arguments ownerId usurpés et erreur décimale. Sources : `app/playwright.config.ts:81`, `app/tests/e2e/auth.spec.ts:23`, `:51`, `:91`, `app/tests/e2e/contracts.spec.ts:44`, `app/tests/e2e/public.spec.ts`.
- Exploration complémentaire : accueil déployé rendu « Project ready! », lien Mon espace → login anonyme ; champs E-mail/Mot de passe et actions connexion/création visibles. T3 preview_status puis preview_open ont explicitement signalé l’absence de host. agent-browser utilisé dans une session propre ; premier lancement échoué faute de sandbox Chromium, doctor puis lancement avec --no-sandbox réussi. Session fermée après observation, sans enregistrement. Le contenu starter est cohérent avec le périmètre technique du socle ; UX produit reste future.
- Lecture GitHub : cron réellement actif avec exécutions schedule réussies ; cela établit son exécution, pas la réception des notifications par le responsable.

### Sondes synthétiques locales indépendantes

Le module actuel `auth-server.ts` a été chargé via Vite SSR dans un script temporaire `/tmp/macrova-retro-probe.mjs`. Seul getRequestHeaders a été remplacé par une Headers vide pour fournir le contexte de requête ; le SDK du relais et le reste de l’implémentation sont réels. fetch sortant a été remplacé en mémoire, sans appel ni configuration backend distant. Variables uniquement dans ce processus ; aucun fichier env modifié. Résultats :

```json
{"probe":"auth-http-500","status":500,"rawBodyForwarded":true,"rawHeaderForwarded":true}
{"probe":"empty-token","accepted":true,"treatedAsMissing":true}
{"probe":"jwt-timeout","outboundSignalPresent":false}
{"probe":"timestamp-parity","foodAccepted":true,"commonAccepted":false,"isoRejected":true}
```

Reproduction minimale F1 : fetch retourne `new Response("synthetic-sensitive-error", {status:500, headers:{"x-synthetic-sensitive":"synthetic"}})` ; appeler handler avec une Request synthétique `/api/auth/get-session`, puis comparer corps/en-tête. F2 : fetch retourne `Response.json({token:""})` ; getToken retourne une chaîne vide. F5 : fixture() avec capturedAt = Number.MAX_SAFE_INTEGER ; comparer validateFoodSnapshot, isUtcTimestamp et new Date(capturedAt).toISOString(). Ces sondes prouvent les branches observées, pas l’émission de secrets réels par Convex.

### Preuves de reprise antérieures vérifiées

Exercice natif final daté **2026-10-06T19:30:15.365Z**, cible locale isolée, condensat archive **0152d6af50052ba692a5a12802b15abaf4cb93869f64a29fb717c2741b386392** : racines/IDs/fermeture restaurés, lecteur privé v1 conservé, refus anonyme/autre propriétaire/compte fermé/session révoquée, backfill 1 puis rejeu 0. `frontendHistoricVerified:false` dans le runner est correct : il ne pilote pas le navigateur. Preuve SSR séparée du **2026-10-06T19:22:42.574885+00:00** sur frontend `fe78c8b95e50e4724e8aeb7e4f16007d38ec546c` : signup200, privé SSR/hydraté avant/après import et schéma additif, retour frontend historique vérifié. Sources primaires : preuves temporaires inventoriées et `app/docs/exploitation-socle.md:138` à `:218`, plan 1.8 section Verification.

Cette rétrospective ne répète pas l’exercice destructif local ni la restauration totale du composant auth : elle revalide le parcours HTTPS actuel et lit les preuves natives antérieures. Aucune archive ou secret sauvegardé n’est ouvert. Pas de preuve nouvelle de reprise cloud, de SLA, de notification humaine, ou de validation produit avant lancement.


## Previous-retro follow-through

`status` à la racine de l’initiative place epic-socle en premier : aucun épic précédent et aucun document de rétrospective précédente à suivre. Cela ne signifie pas que des actions antérieures ont été vérifiées.

Les reports internes à cet épic ont été recontrôlés séparément : portabilité BMad résolue par `2027091` (.gitignore et retrait des snapshots du suivi), prérequis Render/Convex/budget et recette 1.7/1.5 résolus par `c25398b`, `95bc889` et la fiche de livraison ; source `../deferred-work.md`, section Résolution de clôture. La seule assertion de cron non publié de ce registre est périmée, traitée par F6.

## Action items

**Sept actions proposées ; propriétaires désignés par rôle, sans engagement humain inventé. Aucune correction ni réconciliation appliquée par cette rétrospective.**

| ID | Nature et disposition | Action concrète et preuve de clôture attendue | Responsable proposé |
| --- | --- | --- | --- |
| A1 | Remédiation, fix now — F1 | Traiter les réponses auth HTTP5xx avant retour du SDK ; réponse et logs code/incidentId uniquement, sans corps/en-têtes backend arbitraires. Tester HTTP500/503 avec contenu/en-tête synthétique sensible et préserver réponses auth normales. | Propriétaire socle auth/SSR |
| A2 | Remédiation, fix now — F2 | Refuser token vide/blanc comme panne UNAVAILABLE ; conserver HTTP401 comme absence de session. Test du chemin réponse200 malformée et du consommateur qui ne doit pas la transformer en état anonyme. | Propriétaire socle auth/SSR |
| A3 | Vérification, fix now — F3 | Exercer fetchAuthQuery avec JWT valide puis query Convex rejetée : code UNAVAILABLE et UUID, absence de message/cause/corps/log sensible. Le test doit échouer si le wrapper ou logger:false disparaît. | Propriétaire socle auth/SSR |
| A4 | Remédiation, defer — F4 | Définir puis appliquer une borne d’attente JWT couvrant aussi le corps JSON ; tester transport/corps bloqué et propagation d’une panne sanitizée. | Propriétaire socle auth/SSR |
| A5 | Remédiation, defer — F5 | Unifier capturedAt et density.capturedAt avec le prédicat UTC commun ; tester borne Date exacte et premier dépassement, y compris transport Convex. À terminer avant consommation par catalogue/export. | Propriétaire domaine partagé, avec catalogue |
| A6 | Réconciliation documentaire, fix now — F6 | Ajouter l’état daté de supervision GitHub réellement active et sa preuve ; préserver traces historiques. Actualiser les inconnues infrastructure de test résolues et compléter la Structure initiale par état livré, en gardant décisions production ouvertes distinctes. Vérifier séparément notification du responsable. | Propriétaire dépôt/exploitation, avec architecte |
| A7 | Réconciliation de contrat, defer — F7 | Fixer où réside la version du contrat de fermeture et sa règle d’évolution ; expliciter soit le versionnement documentaire/enveloppe v1, soit une évolution compatible autorisée. Ne pas ajouter de champ obligatoire sans migration. | Architecte et propriétaire demandes de données |

Les préventions proposées ciblent des branches ou preuves manquantes établies. Faute de journaux de session complets, aucune causalité de processus (« ticket précipité », mauvaise coordination ou intention abandonnée) n’est affirmée.


## Acceptance verdict

**Verdict machine : `rejected`. Critères déclarés. Épic non accepté à ce stade.**

Aucun pending_tickets : le rejet n’est pas causé par 1.6 built/review. Aucune décision humaine d’acceptation ou d’override fournie ; la délégation des questions et du jugement autorise la présente conclusion, sans inventer une acceptation humaine.

| Done when | Évaluation et preuves |
| --- | --- |
| 1 — Public/session fiables sur environnement isolé | Parcours courant démontré par E2E HTTPS 6/6 et preuves 1.1/1.5. Garantie de traitement des pannes non satisfaite : F2 transforme une réponse JWT malformée en session absente. |
| 2 — Définitions communes versionnées | Nutrition/erreurs/droits/événements/commandes et gardes partagés livrés, 173 tests réussis. Version de fermeture à clarifier (F7), sans incompatibilité actuelle démontrée. |
| 3 — Backend puis frontend, secrets et restauration documentés/exercés | Preuve 1.5 backend publié avant Render ; reprise native et SSR historique dans 1.8 et preuves lues. Limites de reprise correctement déclarées. Supervision désormais active vérifiée dans GitHub ; état documentaire périmé F6. |
| 4 — Intégré sur cible, erreurs et accès interdits | Refus et erreurs contractuelles vérifiés par recette réelle. La frontière d’erreur auth n’est pas entièrement protégée : F1 transmet une réponse500 brute malgré sanitation des exceptions réseau. Ouverture produit toujours conditionnée aux validations de lancement. |

**Conditions de réexamen :** corriger A1 et A2, fermer la lacune A3 puis revalider les chemins affectés et le parcours réel. F4/F5/F7 peuvent rester ouverts avec leur portée et propriétaire explicitement suivis ; F6 doit restituer l’état d’exploitation correct. La réussite des tests actuels ne neutralise pas les reproductions indépendantes F1/F2.


## Open questions

- La version de fermeture doit-elle être documentaire, portée par une enveloppe ou transportée sur chaque objet ? A7 expose l’ambiguïté et permet de la trancher sans bloquer la fin de cette rétrospective.
- Les notifications d’échec GitHub sont-elles effectivement reçues par le responsable ? Exécutions schedule réussies observées, réception non vérifiée. A6 en assure le suivi.
- Les limites numériques AD-12, politique fournisseur, méthode nutritionnelle et conditions de lancement restent à éprouver dans leurs epics propriétaires. Cette rétrospective n’en prononce pas l’acceptation.

Le propriétaire a demandé de répondre aux questions à sa place : priorité aux frontières de sécurité et aux preuves réelles, absence de discussion collective, routage conservateur des incertitudes. Aucune réponse humaine ni validation réglementaire n’est inventée.

## État final du document

Phases 1, 2, 4 et 5 terminées ; phase 3 opt-in non demandée. Seul ce document est ajouté au dépôt : aucun statut, épic, plan, story, code ou configuration versionnée modifié ; aucun commit, push ou déploiement effectué. Les vérifications ont créé les comptes synthétiques prévus par les E2E sur le backend dev isolé et des artefacts temporaires/rapports ignorés, sans donnée réelle ni secret versionné.


## Suivi de remédiation — 7 octobre 2026

Le propriétaire a demandé de corriger A1, A2, A3 et A6, avec arbitrages délégués.
Le [plan de correction](../plan-corriger-actions-retrospective-socle.md) contient
le détail des changements et vérifications. Ce suivi complète la rétrospective
initiale sans réécrire ses constats, reproductions ni verdict historique.

- **A1 corrigée localement** : les réponses HTTP500/503 du SDK sont remplacées
  par HTTP503 code/UUID, sans corps/en-têtes backend arbitraires. Logs du relais
  code/UUID uniquement ; réponses normales, cookies, redirections et 4xx
  préservés. Tests synthétiques via SDK réel et relais Start compilé réussis.
- **A2 corrigée localement** : token vide ou uniquement blanc refusé comme
  UNAVAILABLE ; HTTP401 reste absence de session. Le consommateur est testé
  sans query privée après réponse malformée. Sur le vrai serveur compilé,
  `/dashboard` répond HTTP500 et ne redirige pas vers login.
- **A3 fermée** : tests getCurrentUser → JWT valide → vrai ConvexHttpClient →
  query HTTP rejetée/ConvexError avec données et logLines sensibles ; code/UUID,
  absence de message/cause/données/log brut. Retirer temporairement logger:false
  produit un échec ; retirer backendOperation produit deux échecs. Code restauré.
  Le serveur compilé est également exercé avec JWT valide et query rejetée.
- **A6 réconciliée** : état daté dans exploitation/README, décisions de test
  résolues dans l’épic, structure livrée dans la spine, compléments historiques
  dans le plan 1.8 et les reports. Workflow GitHub actif, trois schedule success,
  dont [37627836923](https://github.com/ecourn/macrova/actions/runs/37627836923)
  créée à 13:21:25 UTC sur `26dc7a76a1f17ce8cad1b000837ba256c4146d73`.
  **Réception humaine examinée séparément, non établie** : aucune notification
  du dépôt/aucun échec disponible, préférences de souscription non lisibles.
  Suivi explicite au propriétaire du dépôt dans deferred-work ; aucune réception
  inventée ni panne artificielle provoquée.

Vérifications du code corrigé : **195/195 tests**, 19 fichiers, zéro skip ;
typecheck et **check sur 145 fichiers, zéro erreur/avertissement** ; build SSR
réussi (avertissements tiers MODULE_LEVEL_DIRECTIVE déjà présents).
Intégration compilée : HTTP500/503 auth, JWT vide/blanc, query rejetée,
3 POST interrompus, 12 logs code/UUID, CSRF403, RPC invalides400,
RPC valide/accueil200, aucun marqueur sensible synthétique transmis.
Recette compilée avec **Convex natif local jetable : 6/6** en 10,8 s, sans
modification du backend cloud ; secret local synthétique, aucun enregistrement
auth. Les scénarios existants couvrent inscription, persistance, révocation,
connexion/déconnexion, refus anonyme, fermeture et isolation entre comptes.
Recette hors ligne : **4/4** en 8,8 s.

Sur la cible HTTPS antérieure : supervision **SOCLE_SSR_OK/SOCLE_CONVEX_OK**,
recette distante **6/6** en 23,8 s. **Aucun push/déploiement effectué : la cible
distante n’exécute pas encore ces corrections locales.** Cette recette prouve
la continuité du parcours publié ; la recette compilée locale prouve le parcours
corrigé. Les anciens F1/F2 demeurent donc pertinents pour cette révision publiée
jusqu’à sa mise à jour. L’acceptation sur cible après publication reste à
réexaminer ; le verdict historique `rejected` est conservé.

A4, A5 et A7 restent différées avec leurs périmètres et responsables d’origine.
La restauration cloud complète, la notification humaine, les décisions de
production et les validations produit avant lancement ne sont pas déclarées
acquises par cette remédiation.

Revue quick indépendante du correctif : aucun défaut établi, 29 tests ciblés
réexécutés avec succès. Backend local jetable arrêté et état auth/secret
synthétiques supprimés. Remédiation locale achevée, réception humaine suivie
séparément et publication du correctif non effectuée.
