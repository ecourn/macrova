# Livraison et recette isolée du calculateur

Cette recette complète les [preuves historiques du socle](livraison-ssr-test.md).
Elle vise exclusivement https://macrova-socle-test.onrender.com et
`dev:dazzling-puffin-856`, avec profils synthétiques, Render Free Frankfurt,
previews et déploiements automatiques désactivés et aucune dépense nouvelle.
Aucune ouverture publique, publication Convex prod ou fusion dans main.

## Validation locale puis livraison backend/frontend

Depuis `app/`, installer si nécessaire avec `bun install --frozen-lockfile`, puis :

```bash
bun run check
bun run typecheck
bun run test
bun run test:e2e
bun run build
git diff --check
```

Les tests de `src/domain/calculator.test.ts` vérifient localement une méthode
absente, retirée et de version différente. `calculator-failure.spec.ts` utilise
un serveur synthétique localhost. Ces preuves ne sont jamais présentées comme
une injection distante ; aucun interrupteur, fixture ou backend de test n'est
déployé. Le calcul et les six saisies restent en mémoire navigateur ; le backend
reçoit seulement le contrat fermé PublicEvent v1 existant.

Après revue indépendante, l'orchestrateur :

1. Vérifie la sélection explicite `CONVEX_DEPLOYMENT=dev:dazzling-puffin-856`,
   les URL cloud/site et `SITE_URL=https://macrova-socle-test.onrender.com` côté
   backend. Retire les clés/tokens prioritaires de déploiement ; conserve le
   secret Better Auth existant en configuration privée, sans l'extraire.
2. Synchronise ce backend avant le frontend :
   `bun run convex:dev --once --tail-logs disable`. Le wrapper gère les verrous
   temporaires et exige `flock`. Ne pas utiliser `convex:deploy`.
3. Committe et pousse la branche dédiée pour obtenir une révision immuable,
   puis déclenche manuellement cette révision sur le service Render existant
   `srv-db2g7nqjnfac73cohoi0`. Vérifie offre Free, région Frankfurt, absence de
   nouvelle dépense, previews et auto-deploy désactivés. Build et start restent
   ceux du blueprint existant, avec les URL publiques identiques au backend.
4. Attend le statut live ; relève par API/CLI la révision complète réellement
   active et l'identifiant du déploiement. Exécute la recette HTTPS et les sondes
   SSR/Convex ; vérifie les assets. Conserve les journaux bruts seulement dans
   les fichiers temporaires privés, jamais dans Git.

Le backend de recette ne peut pas servir simultanément l'auth localhost et
Render. Le remettre à localhost demande la procédure historique explicite ;
une configuration localhost ne constitue pas une preuve de livraison HTTPS.

## Recette HTTPS réelle

```bash
CONVEX_DEPLOYMENT=dev:dazzling-puffin-856 \
VITE_CONVEX_URL=https://dazzling-puffin-856.convex.cloud \
VITE_CONVEX_SITE_URL=https://dazzling-puffin-856.convex.site \
VITE_SITE_URL=https://macrova-socle-test.onrender.com \
E2E_BASE_URL=https://macrova-socle-test.onrender.com \
bun run test:e2e:remote
```

La configuration vérifie origine HTTPS exacte et URL dev cohérentes, ne démarre
aucun serveur local et sélectionne public/auth/contracts/calculator-remote.
La suite calculateur distante est absente des deux modes locaux. Traces,
captures et vidéos restent désactivées ; ne pas activer une capture auth ou
réseau qui pourrait conserver les corps, cookies ou tokens. Aucun compte
préexistant n'est nécessaire pour les suites auth/contracts synthétiques.

Les quatre scénarios calculateur vérifient : référence 2638/98,93/296,78/117,24,
protéines 110 et glucides 285,70 après édition, retour conservant la mémoire,
invalidité 19.5 et exclusion « non » sans mesure, absence de profil dans les
requêtes/URL/cookies/stockages et effacement après reload. Le POST réel est
minimal, sans cookie, auth ni referrer ; son replay est dédupliqué et le conflit
renvoie 409. Calcul et confirmation d'édition émettent chacun un événement
distinct ; navigation et preview n'en émettent aucun. La panne 503 est interceptée
dans le navigateur HTTPS : deux tentatives identiques au maximum par intention,
résultat et édition disponibles, sans insertion synthétique annoncée. Les
opérations account privées renvoient UNAUTHENTICATED à l'anonyme et l'API publique
refuse le bilan interne.

## Bilan d'exploitation paginé

Avec la CLI déjà autorisée sur le seul backend dev, fixer une date UTC `asOf`
en millisecondes et la garder pour toutes les pages :

```bash
bunx convex run calculatorMeasurements:summary \
  '{"asOf":<millisecondes UTC fixées>,"paginationOpts":{"numItems":100,"cursor":null}}'
```

Remplacer la valeur de date avant exécution. Répéter avec `continueCursor` comme
`cursor` jusqu'à `isDone`, puis sommer les `count`. Vérifier que chaque page
contient seulement `count`, `isDone`, `continueCursor` ; ne pas extraire les
lignes de table. Consigner date, nombre de pages et somme, sans enveloppes.
Cette fonction est internal : la CLI d'exploitation autorisée est distincte de
l'API publique, qui doit la refuser.

La rétention technique est de 30 jours à partir de la réception serveur ; les
événements expirés sont exclus même si leur purge physique est retardée. Le
bilan n'est pas un instantané comptable : insertions/purges peuvent modifier la
lecture entre pages. Un compte d'événements navigateur synthétiques ne mesure
ni personnes distinctes, ni usage personnel, ni validation d'offre premium.

## Rollback et conditions de production

En cas d'échec frontend, republier manuellement la dernière révision compatible
vérifiée sur le même service, en conservant les URL de recette. Avant tout
rollback backend, vérifier sa compatibilité avec les données et composants déjà
synchronisés ; ne jamais supprimer les mesures ou tables auth pour contourner
un échec. Un frontend du socle peut fonctionner sans exposer le calculateur,
mais cela ne valide pas CAP-1. Après rollback, relever révision live et refaire
les sondes et parcours effectivement disponibles ; suspendre l'acceptation du
calculateur si sa recette ne passe plus.

La production reste conditionnée à la clôture de `epic-validation-lancement` :
validation de la méthode et du périmètre, information et modalités de collecte,
rétention/purge surveillées, responsabilité d'exploitation, budget et accès,
validation des parcours et des limites restantes. La région américaine du
backend existant et le sommeil possible du frontend gratuit doivent être
considérés dans cette décision. Cette livraison ne revendique aucune validation
clinique, réglementaire ou conformité ; elle n'autorise aucun déploiement prod.

## Preuves datées — à compléter par l'orchestrateur après livraison

| Preuve | Résultat effectif |
| --- | --- |
| Date UTC de recette | À relever |
| Backend synchronisé avant frontend | À relever, dev:dazzling-puffin-856 seulement |
| Révision complète live / déploiement Render | À relever via API/CLI |
| Validation locale / méthode indisponible | À relever ; preuves exclusivement locales |
| Recette HTTPS et quatre scénarios calculateur | À relever ; aucun résultat distant présumé |
| Sondes SSR/Convex et assets | À relever |
| Bilan internal : asOf, pages, comptes | À relever ; aucun profil |
| Logs : échantillons contrôlés | À relever sans recopier les journaux bruts |
| Offre/région/auto-deploy/previews | À reconfirmer |

Toute preuve locale ou panne interceptée est distinguée du fonctionnement réel
du collecteur et de la révision distante. Les comptes de recette et secrets
restent dans les configurations et outils privés existants.
