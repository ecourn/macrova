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
commit. Le fichier `../render.yaml` décrit un seul service Free Frankfurt,
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

## Retour localhost

Arrêter les parcours Render puis sélectionner explicitement le même backend de
test, remettre `SITE_URL=http://localhost:3000` côté Convex et
`VITE_SITE_URL=http://localhost:3000` dans `.env.local`. Reconstruire si le
serveur compilé est utilisé. L'auth Render cesse alors d'être la cible valide.
Pour une recette Render ultérieure, restaurer explicitement les deux origines
HTTPS identiques. Aucun changement de secret n'est nécessaire.

## Fiche effective (à compléter par l'orchestrateur)

| Preuve | Résultat |
| --- | --- |
| URL HTTPS attribuée | En attente de publication |
| Service / workspace | `macrova-socle-test` / `tea-db2fsavlot8c73f24nr0` ; ID à relever |
| Instance / région frontend | Free / Frankfurt ; à confirmer après création |
| Backend | `dev:dazzling-puffin-856`, `aws-us-east-1` observé par 1.7 |
| Révision manuellement déployée | À relever |
| Recette HTTPS / assets / logs | À relever, sans secret |
| Accès responsable | CLI Render et Convex déjà authentifiés selon 1.7 |

Les contrôles locaux ne constituent pas une preuve de publication distante.
