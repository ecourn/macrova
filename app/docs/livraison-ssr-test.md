# Livraison SSR de recette isolée

Cette livraison concerne uniquement des comptes synthétiques et le socle, dans
un budget de dépense nouvelle de 0 €. Elle ne certifie ni ouverture publique ni
conformité. La production demeure séparée. Aucun module métier, fixture publique,
clé de déploiement frontend ou télémétrie personnelle n'est ajouté.

## Serveur et vérification locale

Depuis `app/`, avec Bun 1.4.2 et Node 24.21.0 :

```bash
bun install --frozen-lockfile
bun run test
bun run typecheck
bun run check
bun run build
node tests/integration/start-abort.mjs
HOST=0.0.0.0 PORT=3000 bun run start
```

Nitro est verrouillé à `3.0.260903-beta` et produit `.output/server/index.mjs`
ainsi que `.output/public/assets`. `start` lance Node, sans serveur Vite. `preview`
reste un outil de prévisualisation. Le preset local par défaut est `node-server` ;
Render utilise `NITRO_PRESET=render-com`, qui sert aussi les assets.

Les tests hors ligne utilisent toujours des URL backend neutralisées. Les variables
`import.meta.env.VITE_*` sont figées au build : pour une recette hors ligne du
serveur compilé, compiler avec `VITE_CONVEX_URL='' VITE_CONVEX_SITE_URL=''`
puis exécuter `E2E_COMPILED=1 bun run test:e2e`. Reconstruire ensuite avec les
URL de recette avant tout test auth ou publication. Pour
exercer le serveur compilé avec l'authentification, synchroniser la configuration
locale avant le build, arrêter tout serveur occupant le port correspondant au
`SITE_URL` backend puis lancer :

```bash
E2E_AUTH_PORT=3000 E2E_COMPILED=1 bun run test:e2e:auth
```

Ce mode local conserve les identifiants synthétiques `E2E_AUTH_EMAIL` et
`E2E_AUTH_PASSWORD` déjà requis par le README. Ils restent dans le terminal
privé ; aucun secret dans les logs ou dans les variables `VITE_*`.

## Backend puis frontend

L'orchestrateur effectue les opérations distantes après vérification et revue du
commit. Le fichier [`render.yaml`](../../render.yaml) décrit un seul service Free Frankfurt,
`macrova-socle-test`, déploiements et previews automatiques désactivés. Utiliser
le workspace `tea-db2fsavlot8c73f24nr0`. Recontrôler quotas et absence de carte ;
aucune offre payante, supplément de build, base, disque ou domaine acheté.

1. Relever l'origine HTTPS exacte du service (sans slash final ni chemin), puis
   définir `VITE_SITE_URL` avec cette origine dans Render avant build et runtime.
   Les URL cloud/site sont celles de `dazzling-puffin-856` dans le blueprint.
2. Depuis `app/`, retirer `CONVEX_DEPLOY_KEY` et `CONVEX_DEPLOYMENT_TOKEN` des
   sources d'environnement prioritaires, puis sélectionner explicitement
   `dev/socle-auth-tests`. Vérifier `CONVEX_DEPLOYMENT=dev:dazzling-puffin-856`
   et ses URL avant toute écriture. Ne jamais utiliser `convex:deploy` ici.
3. Définir `SITE_URL` sur ce backend avec l'origine exacte Render. Conserver son
   `BETTER_AUTH_SECRET` distinct existant côté backend, sans l'extraire.
   Synchroniser le backend avec `bun run convex:dev --once`.
4. Committer et pousser la révision validée puis lancer son déploiement manuel
   sur Render. Build : `bun install --frozen-lockfile && bun run build` ; start :
   `bun run start`. `HOST=0.0.0.0`, `PORT` fourni par Render. Contrôler les
   versions Bun/Node exactes, le preset et la région réelle du service.
5. Attendre la disponibilité HTTPS, puis effectuer la recette ci-dessous,
   contrôler les réponses assets et les journaux Render/Convex sans recopier
   leurs éventuelles données sensibles. Compléter la fiche effective.

Ce backend unique ne peut pas servir simultanément des parcours auth localhost
et Render : arrêter les essais locaux pendant la recette distante.

## Recette HTTPS explicite

Dans le terminal de recette, fournir les URL publiques cohérentes, jamais des
secrets. `E2E_BASE_URL` déclenche le mode distant sans serveur local et doit être
une origine HTTPS exacte identique à `VITE_SITE_URL` :

```bash
CONVEX_DEPLOYMENT=dev:dazzling-puffin-856 \
VITE_CONVEX_URL=https://dazzling-puffin-856.convex.cloud \
VITE_CONVEX_SITE_URL=https://dazzling-puffin-856.convex.site \
VITE_SITE_URL=https://macrova-socle-test.onrender.com \
E2E_BASE_URL=https://macrova-socle-test.onrender.com \
bun run test:e2e:remote
```

Remplacer l'origine d'exemple par celle réellement attribuée. La configuration
refuse le mode distant hors ligne, les chemins, credentials URL et URL Convex
étrangères au déploiement `dev:` déclaré. Le service gratuit peut nécessiter
un réveil avant la recette. Les traces, captures et vidéos sont désactivées dans
le mode auth. Ne pas activer de capture réseau ou de trace contenant les corps
POST, cookies ou JWT.

La recette couvre accueil, assets via navigation, refus anonyme du privé,
protections du formulaire avant hydratation, inscription synthétique, connexion
POST, session après reload, révocation et déconnexion. Si les identifiants E2E
sont absents, le test de connexion crée son propre compte synthétique via le
relais puis le déconnecte avant la connexion : aucun compte préalable requis.

Les probes utilisent les API existantes et un JWT obtenu via le relais auth.
Deux comptes synthétiques distincts sont créés ; seul A est fermé, B conserve
une projection sans fermeture et ne peut injecter `ownerId` dans lecture ou
fermeture. Aucune fixture n'est déployée. La fermeture de A persiste un marqueur
irréversible, sur ce compte jetable uniquement, et n'est pas une suppression des
données. Les gardes de références par ID restent vérifiées dans `convex-test`.
La requête privée anonyme et le JWT révoqué rendent `UNAUTHENTICATED`, la
nutrition invalide rend `INVALID_DECIMAL`, une panne SSR rend `UNAVAILABLE`
avec identifiant technique et demeure une erreur. Les messages/cause backend
bruts ne sont transmis ni au framework SSR ni à son sérialiseur ; le logger
Better Auth ne conserve que code stable et ID technique.

Le test d'intégration du serveur compilé utilise uniquement un backend HTTP
synthétique sur loopback. Trois POST auth interrompus doivent traverser le vrai
relais Start, produire seulement des logs code/UUID, puis laisser l'accueil
accessible. Il vérifie aussi le refus 403 d'un RPC compilé envoyé depuis une
origine étrangère. Quatre payloads GET RPC JSON/Seroval invalides sont refusés
avec une réponse 400 code/UUID, sans contenu dans les logs ou la réponse ; un
appel Seroval valide reste fonctionnel. La prévalidation précède le décodeur
interne TanStack et reprend sa limite GET, après le contrôle CSRF.
Le middleware Start reprend explicitement le CSRF par défaut ;
le plugin Nitro normalise le motif du signal d'abandon avant les courses internes
de Start. Le handler d'erreurs et l'instance H3 extérieure conservent eux aussi
les logs techniques ; aucune console globale ou dépendance n'est remplacée.

## Retour localhost

Arrêter les parcours Render puis sélectionner explicitement le même backend de
test, remettre `SITE_URL=http://localhost:3000` côté Convex et
`VITE_SITE_URL=http://localhost:3000` dans `.env.local`. Reconstruire si le
serveur compilé est utilisé. L'auth Render cesse alors d'être la cible valide.
Pour une recette Render ultérieure, restaurer explicitement les deux origines
HTTPS identiques. Aucun changement de secret n'est nécessaire.

## Fiche effective — 6 octobre 2026

| Preuve | Résultat |
| --- | --- |
| URL HTTPS attribuée | https://macrova-socle-test.onrender.com |
| Service / workspace | `srv-db2g7nqjnfac73cohoi0` (`macrova-socle-test`) / `tea-db2fsavlot8c73f24nr0` |
| Instance / région frontend | `free` / `frankfurt`, vérifiés dans la réponse API de création |
| Backend | `dev:dazzling-puffin-856`, `aws-us-east-1` observé par 1.7 |
| Révision manuellement déployée | `95bc8899e88aeb3ef9f8bfb965a0b411a21cb226` ; déploiement `dep-db2gq3h42hec73ane5s0` |
| Recette HTTPS / assets / logs | 6/6 scénarios Chromium réussis sur la révision active ; 6 assets HTTP 200 ; logs Render et Convex sans credentials dans les échantillons contrôlés |
| Accès responsable | CLI Render et Convex déjà authentifiés selon 1.7 |

Backend dédié synchronisé à 14:20 UTC avant première publication frontend ;
`SITE_URL` relu et identique à l'origine HTTPS. Seuls `BETTER_AUTH_SECRET` et
`SITE_URL` existent côté backend ; le secret existant n'a pas été extrait.
Les sept variables Render correspondent au blueprint et à cette origine,
sans clé Convex ni secret auth. Déploiements automatiques et previews désactivés.
Le responsable conserve les accès fournisseur déjà vérifiés par 1.7 :
[service Render](https://dashboard.render.com/web/srv-db2g7nqjnfac73cohoi0) et
[backend Convex](https://dashboard.convex.dev/t/h-michelpique/macrova/dazzling-puffin-856).

Publication finale active à **15:02:02 UTC**, vérifiée par l'API Render avec
la révision complète ci-dessus. Recette HTTPS explicite : **6/6** en **22,8 s**,
sans serveur local, traces ni captures. Elle couvre protections avant hydratation,
inscription, connexion POST, SSR après rechargement, déconnexion, refus anonyme,
JWT révoqué, fermeture propre de A et isolation de B, refus d'arguments ownerId
usurpés et erreur nutritionnelle canonique. Contrôle de six assets distants :
HTTP 200, aucun credential Render/Convex du poste présent. Un getter générique
Better Auth conserve le seul nom `BETTER_AUTH_SECRET` dans une dépendance client,
sans valeur backend ; aucun secret n'a été extrait pour la compilation.

Contrôle RPC supplémentaire sur la cible HTTPS : quatre payloads invalides
HTTP400 sans contenu synthétique dans les réponses, GET valide HTTP200 et
CSRF403. Les headers de navigation same-origin sont conservés pour ce contrôle.

Audit après cette recette et ce contrôle : **15 lignes Render**, dont **8 erreurs code/UUID**,
aucune erreur brute `aborted`, stack/cause de cette interruption, payload RPC
synthétique, erreur de décodage brute, e-mail ou JWT.
Les messages de plateforme de démarrage sont distingués des logs applicatifs.
Échantillon Convex : 100 événements contrôlés sans e-mail, JWT ni assignation de
credential. Ces contrôles portent sur la recette et ses échantillons, pas une
garantie de tous les journaux futurs. Les premiers essais ont révélé les émissions
H3 brutes ; la normalisation Start/Nitro a été vérifiée localement puis sur cette
révision distante, sans changer les attentes fonctionnelles.

Vérification locale finale : **146 tests unitaires**, types et `bun run check`
(138 fichiers, zéro diagnostic), build `render-com` et test d'intégration du
vrai POST Start interrompu réussis. Le build conserve des avertissements tiers
`MODULE_LEVEL_DIRECTIVE` sur `use client` ; Nitro beta est verrouillé exactement,
et la recette confirme les assets et l'hydratation sur les parcours du socle.

La région américaine du backend existant est conservée ; aucune migration
européenne ou ouverture publique n'est annoncée. L'instance Free peut dormir
après inactivité. Les fonctions nutrition, commandes, mesures et accès restent
limitées aux contrats du socle ; aucune fonctionnalité métier fictive ajoutée.

## Actualisation — 7 octobre 2026 : corrections du socle publiées

La publication manuelle `dep-db38e2mgekts73ak9n60` est **live** depuis
**2026-10-07T17:54:09.812142Z**, selon le relevé CLI Render. Sa révision exacte
est `1b7e060328c7a32153f41ecb0c83cb1179553830` : elle comprend les corrections
auth `6aaa299` (sanitation HTTP5xx et refus JWT vide/blanc) et la réutilisation
des primitives shadcn. Elle remplace la révision du 6 octobre ci-dessus.

Le service, workspace, offre Free, région Frankfurt, déploiements automatiques
et previews désactivés sont reconfirmés. Les sept variables Render correspondent
exactement au blueprint et à l’origine HTTPS. Sélection locale
`dev:dazzling-puffin-856`, URL cloud/site cohérentes et aucune clé prioritaire ;
`SITE_URL` backend reste identique à l’origine HTTPS. Le backend dédié a été
synchronisé avec `bun run convex:dev --once --tail-logs disable` à 17:52:55 UTC,
avant le frontend, sans modification du secret existant.

Vérifications sur cette publication :

- **6/6 scénarios HTTPS Chromium réussis en 23,8 s**, via
  `bun run test:e2e:remote`, sans serveur local ni credentials préexistants,
  avec comptes synthétiques et captures/traces désactivées. Protection avant
  hydratation, inscription, connexion POST, persistance après rechargement,
  révocation, déconnexion, refus anonyme, fermeture et isolation intercompte
  sont exercés sur la nouvelle révision.
- Sondes `SOCLE_SSR_OK` et `SOCLE_CONVEX_OK` ; **6 assets JS/CSS HTTP 200**.
- Contrôles locaux : **195/195 tests**, typecheck et check sans diagnostic
  (145 fichiers), build SSR et intégration compilée **1/1**. Cette intégration
  vérifie aussi HTTP500/503 sanitizés, JWT vide/blanc et query Convex en erreur ;
  ces pannes synthétiques sont exercées localement, pas provoquées sur le cloud.
- Échantillons runtime Render après publication et historique Convex contrôlés
  sans afficher les corps : aucun marqueur d’adresse e-mail, mot de passe,
  cookie de session ou JWT détecté. Le flux Convex est arrêté volontairement
  après cinq secondes ; ce contrôle d’échantillons ne certifie pas tous les logs.

Preuves temporaires de session : `/tmp/macrova-publication-deploys.json`,
`/tmp/macrova-publication-e2e.log`, journaux locaux et échantillons runtime
`/tmp/macrova-publication-*`. Aucun secret ou journal brut versionné.
La configuration demeure orientée vers la recette HTTPS existante.
