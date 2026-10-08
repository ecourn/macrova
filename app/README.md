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

## Intentions, reçus et mesures communes v1

`src/domain/commands.ts` et `events.ts` définissent les contrats purs v1,
sans IO ni autorisation. Les validateurs de `convex/contracts/` refusent les
champs supplémentaires et versions inconnues. Leur validation structurelle doit
être suivie des validations sémantiques du domaine (identifiants, dates UTC,
condensat). Chaque propriétaire injecte un validateur fermé de contenu/résultat
aux fabriques `commandIntentValidator` et `commandReceiptValidator` ; aucun
validateur JSON générique permissif n'est fourni. Les identifiants de contrat
sont des chaînes ASCII de 1 à 256 caractères, commençant par une lettre ou un
chiffre, puis lettres/chiffres/`_ . : -` ; aucune adresse e-mail n'est acceptée.

Le navigateur conserve `operationId`, contenu, `expectedRevision` et
`contentDigest` pour une intention, y compris après panne. La canonicalisation
v1 trie récursivement les clés d'objets par unités UTF-16, conserve l'ordre des
tableaux et utilise les primitives `JSON.stringify` (nombres finis, `-0` → `0`).
Elle refuse BigInt, undefined, trous, cycles, accesseurs, symboles et prototypes
non JSON. Le condensat est `sha256:` suivi de 64 caractères hexadécimaux minuscules,
SHA-256 de l'UTF-8 de `{ content, expectedRevision }` canonicalisé. Le SHA-256
synchrone pur évite une dépendance aux API crypto des différents runtimes et
reste utilisable directement dans la décision de replay client/serveur ; les
tests le comparent à l'implémentation native sur vecteurs connus et plusieurs
blocs. Ce condensat assure la cohérence du contenu, aucune authentification.

Exemple : une confirmation avec destinations favori **et** journal conserve une
seule clé. Le module repas/journal dérive ownerId via Better Auth, vérifie propriété,
droit et fermeture avec `requirePersonalWrite` dans sa mutation, recherche son
reçu par ownerId + operationId puis appelle `decideReplay`. Même contenu et reçu
rendent le résultat acquis, avant contrôle de la révision actuelle, sans nouvelle
écriture ni événement. Un autre contenu ou une révision attendue périmée rendent
`CONFLICT`, non réessayable : relire et confirmer une nouvelle intention avec une
nouvelle clé. Un reçu d'un autre propriétaire rend `ACCESS_DENIED`.

Après effet effectif, `selectMealEvents` reçoit la preuve serveur de confirmation
personnelle, destinations et première confirmation. Une double destination ne
produit qu'un `first_personal_meal` ; copie/reprise exige filiation `sourceMealId`
et confirmation pour `meal_reused`. Les IDs sont déterministes par propriétaire,
clé d'intention et type. Démo, absence de confirmation ou absence d'effet ne
produisent aucune mesure personnelle. Le module abonnement fournit l'encaissement
réel confirmé serveur et sa clé interne `paymentId` à `selectPaymentEvents` ;
retour navigateur et droit actif ne sont pas des preuves. Déduplication de paiement
par propriétaire/paymentId reste indépendante du nombre de notifications.
Remboursements et renouvellements relèvent du rapprochement de ce propriétaire.

Le propriétaire enregistre son résultat typé, reçu et événements **atomiquement
avec l'effet** dans ses propres structures. Aucun schéma/table de reçus ou mesures,
API publique de collecte, tracker ni module repas/paiement n'est ajouté ici.
Les mutations internes vérifient `requireInternalWrite` dans la même transaction.
Les preuves des helpers purs proviennent exclusivement de ces propriétaires ;
elles ne sont jamais une autorisation ni des arguments clients faisant autorité.
Les erreurs communes gardent code stable et fields ; seul `UNAVAILABLE`, panne
explicitement transitoire, porte `retryable: true`. Absence, refus et conflit
restent distincts et aucune panne backend n'est absorbée.

Les événements privés minimaux comportent version, eventId, ownerId serveur et
horodatage UTC en millisecondes ; seuls la filiation de réutilisation ou l'identifiant
interne de paiement s'ajoutent pour ces types. Leur collecte reste serveur ;
les mesures identifiantes rejoignent export/delete orchestrés par le futur module
demandes de données, selon la politique à approuver. Les mesures publiques
`calculator_completed` et `demo_completed` ont un contrat séparé, sans ownerId,
profil ni contenu nutritionnel. Aucun profil de calculateur/démo n'est enregistré.
Le futur propriétaire de cohorte conserve `invitationAt` pour **chaque invité**,
y compris sans usage ; fenêtres J6–J8 et dénominateurs suivent le protocole de
validation, sans calcul de seuil ajouté par ce socle.

Les fixtures de transport et mesures sont dans `tests/fixtures/`, chargées
uniquement par convex-test et hors du répertoire déployable.

## Hébergement de test

La [décision d’hébergement isolé](docs/hebergement-test.md) fixe Render SSR à
Francfort, le budget sans dépense, les variables et la remise des accès pour
les stories 1.7 et 1.5. La [procédure de livraison SSR](docs/livraison-ssr-test.md)
décrit le serveur Nitro autonome (`bun run start` après build), le blueprint
Render Free, la synchronisation backend puis frontend, la recette HTTPS
explicite (`E2E_BASE_URL` avec `bun run test:e2e:remote`) et le retour localhost.
La fiche effective y distingue les vérifications locales de la publication réelle.

## Exploitation et reprise du socle

`bun run monitor:socle` surveille SSR et une query publique Convex sans secret,
avec timeout borné, codes fixes et annotations GitHub en cas de panne. Le workflow
horaire/manuellement déclenchable est actif sur GitHub, vérifié le 7 octobre 2026
avec trois exécutions planifiées réussies. Le [relevé daté](docs/exploitation-socle.md)
donne la révision exécutée et distingue cette preuve de la réception des
notifications par le responsable, encore non établie.

`bun run recovery:socle prepare` crée une copie locale privée, sans `.env` courant,
pour l'exercice réel export/perte/import ; `exercise <copie>` refuse toute cible
cloud. Lire la [procédure d'exploitation](docs/exploitation-socle.md) avant de
lancer le backend local par le wrapper, configurer ses secrets ou exercer la
restauration. Elle distingue simulations, preuve CLI native et recette SSR avec
le frontend historique, ainsi que le backfill optionnel et le retour compatible.

## Calculateur public local

L'accueil Macrova ouvre `/calculateur` sans compte et sans lecture auth distante,
même avec Convex configuré mais indisponible. Seules `/login` et `/dashboard`
chargent la session et le provider auth ; les erreurs privées restent des pannes.
Le navigateur calcule la méthode `methode-estimative-v1`, adoptée le 8 octobre
2026 pour construction isolée (décision produit, sans validation clinique).
Les six entrées, les exclusions, les hypothèses et les quatre unités journalières
sont affichées dans le parcours. Les rationnels BigInt restent exacts ; seul
l'affichage est arrondi au centième, demi supérieur. Aucun profil n'est envoyé,
stocké dans l'URL, un cookie ou un stockage persistant, ni transféré au compte.
Le brouillon et son état sont dans la mémoire du router de la session navigateur ;
revenir par navigation les conserve, recharger la page les efface. Changer toute
entrée invalide immédiatement le résultat et exige un nouveau calcul explicite.
La disponibilité de la version est explicite dans le contexte du router : une
méthode absente, non adoptée, retirée ou différente ne produit aucun résultat.

`bun run test:e2e` inclut les références, refus, reprise, confidentialité,
clavier/mobile et un serveur auth local simulé répondant 503 avec ses URL
configurées. Ce dernier prouve le SSR public indépendant de l'auth et la panne
privée conservée ; il ne prouve aucune authentification réelle. La recette auth
réelle reste `bun run test:e2e:auth` avec le backend dev et un compte de test.
