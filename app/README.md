# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

## Qualité du code

Le projet utilise Biome, avec une version exacte verrouillée dans `package.json`
et `bun.lock`.

```bash
bun install --frozen-lockfile
bun run lint       # Analyse statique
bun run format     # Formate les fichiers pris en charge
bun run check      # Vérifie le lint et le formatage sans modifier les fichiers
bun run typecheck  # Vérifie les types TypeScript
bun run build     # Compile l'application
bun run test      # Vérifie les sessions simulées et la configuration E2E
```

La configuration `biome.json` conserve le style JavaScript/TypeScript existant
(deux espaces, LF, guillemets doubles, sans points-virgules, virgules finales ES5,
largeur de 80 caractères). Elle reprend les règles ESLint compatibles et conserve
les désactivations explicites du projet. Certaines règles ESLint n'ont pas
d'équivalent exact ; TypeScript reste responsable de la vérification des types.
Le tri automatique des imports reste désactivé.

Les fichiers ignorés par Git et l'arbre de routes généré `src/routeTree.gen.ts`
sont exclus. Les fichiers CSS et JSON sont également formatés ; le parseur CSS
accepte les directives Tailwind.

Le tri automatique des classes Tailwind n'est plus effectué : la règle Biome
[`useSortedClasses`](https://biomejs.dev/linter/rules/use-sorted-classes/)
est expérimentale et ne couvre pas entièrement les utilitaires et variantes
personnalisés de Tailwind. Les classes existantes sont conservées.
Prettier peut rester installé comme dépendance transitive du générateur TanStack,
mais aucun script du projet ne l'utilise.

Dans l'éditeur, utiliser l'extension Biome comme formateur pour ce projet.

## Tests de parcours avec Playwright

```bash
bunx playwright install chromium  # Une fois ; --with-deps en CI Linux
bun run test:e2e
bun run test:e2e:ui               # Mode interactif
bun run test:e2e:report           # Dernier rapport HTML
```

Playwright démarre son propre serveur sur `http://localhost:3001` et l'arrête
après les tests. Le port doit être libre. Par défaut, les variables Convex sont
neutralisées, même si `.env.local` est configuré : les quatre tests vérifient
la navigation publique, la redirection des visiteurs anonymes, le message de
configuration et la réponse HTTP 503 de l'API d'authentification.
Cette suite peut tourner sans compte ni connexion au backend Convex.
Les rapports, captures et traces d'échec sont ignorés par Git.

### Connexion réelle sur un backend de développement

Configurer `.env.local` avec un déploiement `dev:` et les deux URL Convex
correspondantes. Le backend doit déjà fonctionner. Dans Convex, `SITE_URL`
doit autoriser `http://localhost:3001` pour les requêtes du serveur de test ;
ce réglage peut nécessiter un déploiement de développement dédié aux tests.

Créer un compte de test depuis `/login` sur cet environnement, puis fournir
`E2E_AUTH_EMAIL` et `E2E_AUTH_PASSWORD` dans l'environnement du terminal ou les
secrets de CI. Ne pas versionner ces identifiants ni utiliser un compte réel.

```bash
bun run test:e2e:auth
# Si SITE_URL est déjà http://localhost:3000, arrêter le serveur Vite puis :
E2E_AUTH_PORT=3000 bun run test:e2e:auth
```

Cette commande exécute les deux tests publics, un parcours inscription →
session après rechargement → révocation de session sans clic de déconnexion →
retour automatique à la connexion, puis le parcours connexion →
session après rechargement → redirection d'un utilisateur connecté →
déconnexion → refus d'accès privé. Elle échoue dès la configuration si les
identifiants manquent ou si le déploiement déclaré n'est pas `dev:`.
Vérifier que les URL Convex correspondent effectivement à ce déploiement.
La configuration refuse les URL cloud/site qui ne correspondent pas au nom
du déploiement cloud `dev:` déclaré, avant de lancer le serveur ou les tests.
Le test d'inscription crée un compte dédié avec une adresse unique
`auth-signup-…@example.com`, conservé dans le composant pour inspection.
Le port choisi doit être libre et correspondre à `SITE_URL` côté Convex.
Les traces et captures sont désactivées
pour ce parcours afin de limiter l'enregistrement des données d'authentification ;
les rapports peuvent contenir l'adresse du compte de test en cas d'échec.

La configuration est dans `playwright.config.ts`, les scénarios dans `tests/e2e/`.
Le périmètre initial utilise Chromium ; d'autres navigateurs pourront être
ajoutés lorsqu'un besoin de compatibilité le justifiera.

### Environnement dédié aux tests de session

Le socle utilise le déploiement cloud `dev/socle-auth-tests`, séparé du
déploiement de développement habituel et de la production. Le sélectionner
avec le compte Convex autorisé :

Pour cette procédure locale, retirer `CONVEX_DEPLOY_KEY` et
`CONVEX_DEPLOYMENT_TOKEN` de l'environnement du terminal ainsi que de `.env`
et `.env.local` si elles y figurent : ces clés peuvent prendre priorité sur la
sélection et faire viser un autre backend aux commandes suivantes. Conserver
les éventuelles clés nécessaires ailleurs, hors Git, puis utiliser la connexion
du CLI avec le compte Convex autorisé.

```bash
bunx convex deployment select dev/socle-auth-tests
bun run convex:dev --once
E2E_AUTH_PORT=3000 bun run test:e2e:auth
```

La sélection met à jour les URL dans `.env.local`, ignoré par Git. Ce backend
possède son propre `BETTER_AUTH_SECRET`, conservé uniquement dans Convex, et
`SITE_URL=http://localhost:3000`. Utiliser uniquement des comptes de test ;
fournir leurs identifiants au processus E2E, jamais aux variables `VITE_*`.
Les tests créent des comptes d’inscription supplémentaires dans le composant
Better Auth de cet environnement, pas dans le backend habituel.

Pour recréer cet environnement dans un autre projet Convex autorisé :

Remplacer `mon-equipe` et `mon-projet` par les identifiants du projet cible.
Le sélecteur complet évite de créer le déploiement dans le projet actuellement
sélectionné ; dans le projet courant, `dev/socle-auth-tests` suffit.

```bash
bunx convex deployment create mon-equipe:mon-projet:dev/socle-auth-tests --type dev --select
bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
bunx convex env set SITE_URL http://localhost:3000
bun run convex:dev --once
```

Après la synchronisation, démarrer `bun run dev`, ouvrir
`http://localhost:3000/login` et créer le compte de test. Arrêter ensuite Vite
avec Ctrl+C pour libérer le port 3000. Fournir `E2E_AUTH_EMAIL` et
`E2E_AUTH_PASSWORD` au terminal ou aux secrets de CI, comme indiqué dans la
section de connexion réelle, puis lancer
`E2E_AUTH_PORT=3000 bun run test:e2e:auth`.
Pour reprendre le backend habituel, le sélectionner explicitement avec
`convex deployment select`.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Convex et Better Auth (Bun)

L'application utilise le composant officiel `@convex-dev/better-auth` :
Better Auth et ses tables tournent dans Convex. TanStack Start relaie les
requêtes via `/api/auth/$`, fournit la session au rendu serveur et initialise
le provider React Convex. Les exemples Next.js ne s'appliquent pas à ce projet.

La connexion e-mail/mot de passe et la création de compte sont accessibles sur
`/login`. La route `/dashboard` vérifie l'utilisateur côté serveur avant
d'afficher une requête Convex authentifiée. La fonction
`convex/auth.ts:getCurrentUser` vérifie aussi l'authentification dans le backend.
Cette lecture retourne `null` lorsque la session est absente, expirée ou révoquée,
et le tableau de bord revient à la connexion. Les opérations privées doivent
utiliser `authComponent.getAuthUser(ctx)` pour refuser les appels sans session.
Chaque future fonction privée doit vérifier l'utilisateur dans Convex ; la
protection d'une page ne suffit pas à protéger ses données.

### À faire avec ton compte Convex

1. Installer les dépendances, puis lancer la configuration :

   ```bash
   bun install --frozen-lockfile
   bun run convex:dev
   ```

   Connecte-toi dans le navigateur, sélectionne ou crée ton projet et choisis
   un **déploiement cloud** pour le retrouver sur
   [dashboard.convex.dev](https://dashboard.convex.dev/).
   Garde ce terminal ouvert : Convex synchronise les fonctions et régénère
   `convex/_generated/`. Le premier déploiement peut demander les variables
   ci-dessous avant de terminer.

2. Dans un autre terminal, configure les variables **du backend Convex** :

   ```bash
   bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
   bunx convex env set SITE_URL http://localhost:3000
   ```

   Le secret doit rester dans Convex (Settings → Environment Variables).
   Ne le mets jamais dans une variable `VITE_*` ni dans Git.

3. Complète le fichier `.env.local` créé par Convex à partir de
   `.env.example`. Conserve la valeur réelle de `CONVEX_DEPLOYMENT` :

   ```dotenv
   CONVEX_DEPLOYMENT=dev:ton-deploiement
   VITE_CONVEX_URL=https://ton-deploiement.convex.cloud
   VITE_CONVEX_SITE_URL=https://ton-deploiement.convex.site
   VITE_SITE_URL=http://localhost:3000
   ```

   Copie les URL exactes depuis le dashboard. L'URL `.cloud` sert au client
   Convex ; l'URL `.site` sert au proxy HTTP Better Auth.
   `VITE_SITE_URL` indique l'origine de l'application ; configure également
   cette même origine dans `SITE_URL` côté Convex.

4. Démarre le frontend dans un autre terminal :

   ```bash
   bun run dev
   ```

   Ouvre http://localhost:3000/login, crée un compte, vérifie l'accès à
   `/dashboard`, puis déconnecte-toi. Un accès anonyme à `/dashboard` doit
   rediriger vers `/login`. Dans le dashboard Convex, sélectionne le composant
   `betterAuth` pour voir les tables de comptes et de sessions.

Aucun déploiement cloud n'est créé automatiquement dans le dépôt : cette étape
nécessite ton compte. Sans variables Convex, la page publique reste accessible,
le formulaire est désactivé et l'API d'authentification renvoie HTTP 503.

### Commandes et déploiement

```bash
bun run convex:dev      # Synchronisation du backend de développement
bun run convex:codegen  # Régénération des types après configuration du projet
bun run convex:deploy  # Publication du backend de production
bun run typecheck
bun run check
bun run build
```

Les fichiers `convex/_generated/` sont versionnés pour permettre la compilation
avant connexion au compte. Ils ont été initialisés à partir des modèles du SDK
Convex et des types du composant ; `convex dev` les régénère depuis le déploiement.

Pour la production, configure un secret propre au déploiement de production
et `SITE_URL` avec l'origine HTTPS réelle (`bunx convex env set --prod ...`).
Configure les URL **de production** `VITE_CONVEX_URL` et
`VITE_CONVEX_SITE_URL` dans l'environnement de l'hébergeur avant la compilation,
et rends-les aussi disponibles au serveur TanStack Start à l'exécution.
Publie le backend avec `bun run convex:deploy`, puis compile le frontend.

La vérification d'e-mail est désactivée pour cette installation initiale.
Aucun fournisseur OAuth, envoi d'e-mail ou récupération de mot de passe n'est
configuré. Ces fonctionnalités nécessitent un fournisseur et sa configuration.

Documentation :
[TanStack Start + Convex + Better Auth](https://labs.convex.dev/better-auth/framework-guides/tanstack-start).

## Contrat nutritionnel v1

Le domaine pur `src/domain/` partage les règles AD-12 avec les validateurs
structurels Convex dans `convex/contracts/food.ts`. `FoodSnapshot` porte une
version (`1`), une révision source explicite, l'identifiant source, le nom, la
marque éventuelle, la provenance (nom et référence), la date UTC en millisecondes
(entier sûr positif ou nul), l'état `raw` / `cooked` / `unknown` et la nutrition.
La base connue représente **100 g** ou **100 ml** ; une base ambiguë conserve
son `sourceField`. Protéines, glucides et lipides sont en g, l'énergie en kcal.
Chaque valeur est une chaîne décimale canonique ou `null` (absence).

Les chaînes sources ne sont jamais normalisées : sans exposant, signe, zéros
initiaux superflus ni zéros décimaux finaux, de `0` à `1000000`, avec au plus six
décimales. Le pas et la densité sont strictement positifs. Ces bornes v1 restent
une **hypothèse technique AD-12 à éprouver dans l'audit catalogue**.
`normalizeFrenchDecimal` normalise explicitement les saisies utilisateur telles
que ` 12,50 ` vers `12.5` et refuse les séparateurs mixtes.

`api.nutrition.inspect({ snapshot, portion? })` est une query publique anonyme,
sans accès DB ni persistance. Elle retourne l'instantané intact, sa calculabilité
et, si demandé, les totaux de la portion (`quantity`, `unit`, `step?`). Une absence
nutritionnelle ou une base ambiguë bloque tout calcul, même pour une quantité
nulle ; aucune énergie n'est inférée. Une conversion g/ml exige une densité en
g/ml avec référence et date. Les résultats exacts sont des fractions réduites
(`numerator` / `denominator`, chaînes entières), avec un `display` au centième
arrondi demi supérieur. Aucun BigInt ne traverse l'API. Les totaux ne subissent
pas la borne des valeurs sources ni d'arrondi intermédiaire.
`api.nutrition.normalizeInput({ input, positive? })` expose la normalisation
explicite. Les erreurs partagées ont un code stable, `fields` et `retryable: false` ;
les messages français sont séparés dans `ERROR_MESSAGES`.

Ces erreurs communes concernent la validation sémantique d'arguments dont la
structure est correcte. Un champ obligatoire absent, un type incorrect ou une
propriété supplémentaire est refusé par les validateurs Convex avant le handler,
avec une erreur de validation Convex. Les fonctions du domaine prennent des
objets `FoodSnapshot` et `Portion` structurellement conformes ; un adaptateur
recevant du JSON inconnu doit en valider la structure avant de les appeler.
Le calcul des totaux vérifie la positivité de `step` lorsqu'il est fourni ;
l'admissibilité sur une grille de portions relève du futur moteur AD-4.

Cette API est un consommateur minimal du contrat ; elle ne constitue pas la
démonstration CAP-2 et ne corrige aucun catalogue.

## Autorisation et fermeture communes

`api.account.getAccess({})` exige une session Better Auth valide et retourne la
projection brute `entitlement` (ou `null`) et `closure` (ou `null`). Le propriétaire
est toujours le `_id` Better Auth obtenu côté serveur. La query n'invente aucun
droit effectif dépendant du temps : chaque écriture vérifie sa propre horloge
serveur. La projection v1 `{ version: 1, enabled, validUntil }` appartient au futur
module abonnement ; le socle n'expose aucune commande pour accorder un droit.
`validUntil` est une date UTC en millisecondes, entière et représentable ; un
contrat inconnu, une date invalide, une absence, un droit désactivé ou une échéance
atteinte refusent les écritures personnelles, sans grâce.

Dans `convex/lib/access.ts`, les consommateurs utilisent `requireOwner` pour
l'identité et `requireOwned` après chaque lecture par ID. `requirePersonalWrite`
vérifie identité, ouverture puis droit actif dans la mutation. Les index privés
commencent par `ownerId`. Les opérations compte, abonnement, résiliation et
demandes de données restent accessibles au propriétaire sans droit actif : ne
pas leur appliquer la garde personnelle. Les erreurs `ConvexError` partagent
`code`, `fields` et `retryable: false` ; `UNAUTHENTICATED`, `ACCESS_DENIED`,
`NOT_FOUND`, `ENTITLEMENT_REQUIRED` et `ACCOUNT_CLOSED` sont distincts. Seul le
refus explicite de session du composant est traduit ; toute panne réelle remonte.

`api.account.close({ confirmation: "CLOSE_ACCOUNT" })` requiert une confirmation
distincte et une identité valide, sans abonnement. Elle persiste un marqueur
irréversible et retourne le même `closedAt` aux appels suivants. Ce marqueur est
conservé indépendamment des tables auth. Il bloque les écritures personnelles,
mais cette API ne supprime aucune donnée ni session et ne promet aucun nettoyage.
Le futur module de demandes de données orchestrera le nettoyage après fermeture.

Chaque transaction interne créatrice ou modificatrice doit appeler
`requireInternalWrite(ctx, ownerId)` **dans la même mutation que son écriture**.
Le propriétaire provient du travail durable relu côté serveur, jamais du
navigateur ; cette garde fonctionne même après suppression du compte auth et
n'exige pas de session. Les opérations de nettoyage pourront uniquement supprimer
et avancer leur progression. Ne jamais supprimer le marqueur lors du nettoyage.
Les règles fournisseur, génération de rapprochement, réconciliation, délais et
politique de conservation restent à construire dans leurs modules respectifs.

Les fixtures dans `tests/fixtures/access-functions.ts` sont exclusivement
synthétiques et chargées par la module map de `convex-test` ; elles se trouvent
hors du répertoire déployable `convex/`. Les bindings `api.d.ts` ont été mis à jour
localement, sans commande de codegen susceptible de téléverser le backend.
