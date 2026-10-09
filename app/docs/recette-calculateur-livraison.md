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
bun run verify:calculator
git diff --check
```

`verify:calculator` exige `bun`, `flock`, `setsid`, `tar` et `cp` (GNU).
Elle exige aussi `ps` pour identifier ses groupes de processus descendants.
La commande prend un verrou de recette dans `node_modules` et refuse un port
occupé parmi 3001, 3002 et 3999, sans arrêter le serveur présent. Ces ports
restent réservés pendant la recette ; ne pas y démarrer un autre serveur.
Elle prépare deux copies de l'app dans un répertoire temporaire privé sans fichiers `.env`,
anciens builds ni caches. Les dépendances installées sont copiées aussi
(reflinks si disponibles), sans installation réseau ; les caches Vite des deux
serveurs sont distincts, chaque serveur a son propre répertoire de travail,
et `.vite-temp`, TanStack, Nitro, rapports et build
restent dans cette copie. L'environnement des phases exclut les URL Convex et
les identifiants d'authentification. Aucun serveur existant n'est réutilisé.

Avant les tests, une préparation explicite charge `/calculateur` puis l'accueil
sur chaque serveur, attend le bouton hydraté puis le réseau au repos et ferme
ce navigateur. Elle prépare les routes et l'optimisation des dépendances ; les
tests utilisent ensuite leurs propres contextes. Les erreurs JavaScript de
cette préparation font échouer la phase. Aucun test n'est relancé et aucune
assertion n'est assouplie. Cette commande ne valide pas le tout premier clic
sur un serveur Vite froid ; ce comportement reste une limite distincte.

E2E s'exécute avant le build ; le build ne démarre que si E2E réussit et ses
serveurs sont arrêtés. L'arrêt et Ctrl+C visent les seuls enfants de la recette.
Toute erreur conserve son code non nul et empêche la phase suivante, sans
relance automatique. Le répertoire annoncé `macrova-calculator.*` contient
`recipe.log`, `e2e.log`, puis `build.log` si cette phase a commencé, ainsi que
les rapports Playwright dans `app/`. Les traces sont conservées même en cas
d'échec ; elles ne sont pas versionnées. Après consultation, supprimer seulement
ce répertoire privé, jamais les caches partagés ni le fichier de verrou.
Cette recette couvre les profils synthétiques locaux ; elle ne prouve ni
l'authentification, ni une livraison cloud, ni une restitution audio réelle.

Le test `tests/config/calculator-render.test.ts` rend la véritable route et
l'éditeur avec une session déjà calculée : témoin v1, `null`, `undefined`,
méthode non adoptée, retirée et v2. Les six entrées restent sélectionnées et
la session complète est inchangée ; toute méthode indisponible masque résultat
et éditeur et affiche le refus réel. Seuls route/Link/hydratation sont simulés.

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

## Preuves datées — 9 octobre 2026

| Preuve | Résultat effectif |
| --- | --- |
| Date UTC de recette | 2026-10-09, terminée avant le bilan de 15:04:32.736 UTC ; 34,7 secondes |
| Backend synchronisé avant frontend | dev:dazzling-puffin-856, prêt à 15:00:34 UTC ; indexes by_eventId/by_expiresAt et composants rateLimiter/batchWorker installés ; wrapper --once --tail-logs disable --codegen disable, sortie 0 ; secret existant conservé |
| Révision complète live / déploiement Render | `c232f4fd3f16ab325d8ee9f70dc8b3f9db600d17` / `dep-db4g3bbl550s73bkth7g`, live à 15:03:29.566014 UTC ; révision publiée sur branche dédiée, aucune fusion main |
| Validation locale / méthode indisponible | 412 tests sur 23 fichiers ; 25 E2E ; types et check (162 fichiers) sans diagnostic ; build réussi. Méthode absente/retirée/version différente et transitions protégées : calculator.test.ts, exclusivement local |
| Recette HTTPS et quatre scénarios calculateur | 10/10 réussis, sortie 0, dont 4 calculateur : référence/édition/retour/confidentialité, invalidité/exclusion, panne 503 interceptée et retries, refus privés et bilan interne ; 6 scénarios du socle incluant auth réelle et isolation intercompte |
| Sondes SSR/Convex et assets | SOCLE_SSR_OK et SOCLE_CONVEX_OK ; 10 assets référencés par /calculateur, tous HTTP 200 |
| Bilan internal : asOf, pages, comptes | Avant recette : asOf 1791558043163 (15:00:43.163 UTC), 1 page, 0 événement. Après : asOf 1791558272736 (15:04:32.736 UTC), 1 page, 2 événements. Calcul et confirmation distincts ; replay dédupliqué et conflit 409 ; aucun profil extrait |
| Logs : échantillons contrôlés | 4 entrées Render après publication et 100 événements Convex contrôlés : aucun marqueur de profil, e-mail, JWT ou assignation de credential détecté ; échantillons seulement, corps conservés dans /tmp |
| Offre/région/auto-deploy/previews | Service srv-db2g7nqjnfac73cohoi0 existant : Free, Frankfurt, autoDeploy off et previews off vérifiés par CLI ; aucune nouvelle ressource |

Toute preuve locale ou panne interceptée est distinguée du fonctionnement réel
du collecteur et de la révision distante. Les comptes de recette et secrets
restent dans les configurations et outils privés existants.

Les contrôles de confidentialité commencent avant toute saisie : références
cookies/stockages et écoute réseau, POST seulement vers le collecteur sous contrat
fermé, autres transmissions GET same-origin vers navigation ou assets connus,
sans query ni corps. Les deux intentions ont deux UUID distincts ; navigation
et refus ne produisent aucun événement. La panne simulée 503 n’a pas atteint
le collecteur réel ; elle confirme quatre essais pour deux intentions, aucun
succès annoncé par la simulation. Le bilan de deux événements confirme les
seules insertions de cette recette isolée.

La surveillance native T3 était indisponible en environnement headless ; les
preuves navigateur viennent de Chromium Playwright, sans traces/captures auth.
Une correction de recette issue de revue indépendante a avancé la surveillance
avant saisie et remplacé le filtre partiel de valeurs brutes par le contrôle
structurel des requêtes. La recette distante corrigée passe sans assouplir les
attentes. Les avertissements use client des dépendances au build restent ceux
observés dans le socle ; aucun avertissement du check applicatif.

Logs temporaires de session : /tmp/macrova-2-8-remote.log,
/tmp/macrova-2-8-summary-before.json et -after.json,
/tmp/macrova-2-8-deploys-progress.json, /tmp/macrova-2-8-assets.json,
/tmp/macrova-2-8-log-audit.json. Ces fichiers ne sont pas des dépendances de cette
procédure et ne sont pas versionnés. Les faits résumés ici suffisent à identifier
la révision et reproduire la recette.

Le flux Convex a été arrêté volontairement après six secondes. Le contrôle
de ces échantillons ne garantit pas l’absence de données sensibles dans tous
les journaux futurs ; les refus privés attendus ne sont pas des pannes.
