# Walkthrough de 5e84ce8

Cible : `5e84ce8015898e94e43c02d7e04901c5f84c6437` — `feat(calculator): mesurer les calculs terminés sans profil`.

État : walkthrough terminé sous mandat utilisateur ; les validations ont été prises par délégation.

- [x] Bloc 1 — Intention — accepté par délégation, inchangé
- [x] Bloc 2 — Grandes lignes — accepté par délégation, inchangé
- [x] Bloc 3 — Déclenchements et transport facultatif — accepté par délégation, inchangé
- [x] Bloc 4 — Entrée publique — accepté par délégation, inchangé
- [x] Bloc 5 — Stockage, déduplication et quota — accepté par délégation, inchangé
- [x] Bloc 6 — Expiration, purge et bilan interne — accepté par délégation, inchangé
- [x] Bloc 7 — Périphérie — accepté par délégation, inchangé

## Bloc 1 — Intention

Source verbatim : section `Intent` du [plan de la story 2.5](../initiative-macrova/epic-calculateur/story-mesurer-les-calculs-termines-sans-profil-plan.md).

## Intent

**Problem:** Le calculateur gratuit fournit des résultats locaux valides mais ne rend pas leur usage observable selon le contrat public de 1.4.

**Approach:** Relier les intentions explicites réussies à un collecteur Convex anonyme strict et idempotent. Séparer entièrement collecte et domaine/calcul, fournir purge technique à 30 jours et bilan interne pour exploitation.

## Bloc 2 — Grandes lignes

La mesure suit une chaîne distincte du calcul local. Le gestionnaire `submit` de la [route calculateur](../../app/src/routes/calculateur.tsx) calcule puis met à jour la session avant d'appeler le transport en cas de succès. L'[éditeur de cibles](../../app/src/components/calculator-target-editor.tsx) signale une confirmation réussie avec `onConfirmed`, raccordé au même transport par la route. L'[adaptateur `sendCalculatorMeasurement`](../../app/src/lib/calculator-measurement.ts) construit une enveloppe minimale et l'envoie au [point d'entrée HTTP](../../app/convex/http.ts). Celui-ci valide l'entrée puis délègue à la mutation interne `collect` du [collecteur Convex](../../app/convex/calculatorMeasurements.ts).

Le résultat local et les cibles modifiées sont disponibles avant la collecte. Le transport n'a pas besoin du profil nutritionnel pour déclarer l'intention.

## Bloc 3 — Déclenchements et transport facultatif

Dans la [route calculateur](../../app/src/routes/calculateur.tsx), seul `next.outcome?.ok` après soumission appelle l'adaptateur. Une nouvelle soumission réussie constitue une nouvelle intention, même si les valeurs sont identiques. Dans l'[éditeur](../../app/src/components/calculator-target-editor.tsx), la confirmation exige un résultat valide, l'état `modified`, aucune erreur d'édition et une prévisualisation fermée avant `onConfirmed`. Les changements de saisie, prévisualisations, annulations et resets restent des mises à jour locales.

L'[adaptateur](../../app/src/lib/calculator-measurement.ts) retourne immédiatement sans URL configurée. Sinon, il crée un UUID aléatoire et une seule enveloppe PublicEvent v1 contenant `version`, `eventId`, `occurredAt` et `type: "calculator_completed"`. Les deux essais maximum utilisent le même corps JSON et le même UUID. Chaque essai dispose d'un délai de 1500 ms et d'un `AbortController` ; erreurs réseau, timeout ou réponse serveur 5xx permettent l'essai suivant. Une réponse réussie ou inférieure à 500 arrête les essais. Les erreurs restent absorbées dans l'adaptateur facultatif, sans file persistante.

Le POST utilise `credentials: "omit"` et `referrerPolicy: "no-referrer"`. L'enveloppe respecte le [contrat de domaine PublicEvent](../../app/src/domain/events.ts) ; elle ne transporte ni compte ni profil.

## Bloc 4 — Entrée publique

La [route HTTP `/measurements/calculator`](../../app/convex/http.ts) propose un OPTIONS à 204 et un POST, avec CORS pour `Content-Type`. Le POST lit le flux et refuse un corps dépassant 1024 octets avant son décodage complet. Un corps absent, un JSON invalide ou une enveloppe hors contrat retourne 400 ; un dépassement retourne 413.

Après [validation PublicEvent](../../app/src/domain/events.ts), seuls les événements `calculator_completed` passent à `collect`. La [mutation interne](../../app/convex/calculatorMeasurements.ts) vérifie aussi la sémantique et borne `occurredAt` entre 24 heures de passé et 5 minutes de futur par rapport à l'heure serveur. La réponse HTTP traduit `accepted` et `duplicate` en 200, `invalid` en 400, `collision` en 409 et `limited` en 429. Le [validateur fermé Convex](../../app/convex/contracts/events.ts) garde la même enveloppe minimale côté mutation.

## Bloc 5 — Stockage, déduplication et quota

Le [schéma](../../app/convex/schema.ts) ajoute `calculatorMeasurements` avec les quatre champs publics et deux horodatages serveur, `receivedAt` et `expiresAt`. Les index `by_eventId` et `by_expiresAt` servent respectivement à la déduplication et à la conservation.

Dans [collect](../../app/convex/calculatorMeasurements.ts), la recherche transactionnelle par `eventId` précède le quota. Une enveloppe identique retourne `duplicate` ; un autre contenu sous le même identifiant retourne `collision`. Un duplicata n'entraîne donc ni nouvelle insertion ni consommation supplémentaire du quota.

Le composant rate-limiter applique une fenêtre fixe globale de 1000 nouvelles insertions par heure UTC, sans clé IP ou session. La [configuration Convex](../../app/convex/convex.config.ts) enregistre ce composant. Une insertion acceptée ajoute les horodatages serveur et programme sa suppression. Le budget partagé limite le nombre d'insertions et peut être consommé par des événements fabriqués ; la mesure représente des intentions navigateur.

## Bloc 6 — Expiration, purge et bilan interne

Le [collecteur](../../app/convex/calculatorMeasurements.ts) fixe `expiresAt = receivedAt + 30 jours` et programme `expire` à cette échéance. `expire` supprime seulement une ligne encore présente et effectivement expirée. `purge` lit au plus 100 lignes expirées via l'index, les supprime puis programme une continuation immédiate si le lot est complet. Le [cron](../../app/convex/crons.ts) lance ce rattrapage chaque heure.

`summary` est une requête interne paginée du même [module](../../app/convex/calculatorMeasurements.ts). Elle exige un `asOf` entier sûr positif ou nul et une taille de page entre 1 et 100 ; elle refuse `endCursor`. Le filtre `expiresAt > asOf` exclut les événements expirés pour la date retenue. Chaque page ne retourne que `count`, `isDone` et `continueCursor` ; l'exploitation conserve `asOf`, parcourt les curseurs et additionne les comptes. Cette lecture des lignes retenues peut évoluer avec des insertions ou des purges, comme l'explique le [README](../../app/README.md).

## Bloc 7 — Périphérie

- [README](../../app/README.md) : décrit contrat, transport, quota, rétention, bilan et politique à vérifier avant ouverture publique.
- [package.json](../../app/package.json) et [bun.lock](../../app/bun.lock) : déclarent et verrouillent le composant rate-limiter.
- [convex.config.ts](../../app/convex/convex.config.ts) : enregistre le composant rate-limiter aux côtés du composant d'authentification.
- [Types API générés](../../app/convex/_generated/api.d.ts) : exposent le module de mesures et les types du composant rate-limiter.
- [Schéma](../../app/convex/schema.ts) : ajoute les champs minimaux de mesure et les index de déduplication et d'expiration.
- [Configuration Vitest](../../app/vitest.config.ts) : ajoute `src/lib/**/*.test.ts` à la découverte des tests.
- [Tests du transport](../../app/src/lib/calculator-measurement.test.ts) : décrivent enveloppe, configuration absente, retries et timeouts.
- [Tests Convex](../../app/convex/calculatorMeasurements.test.ts) : couvrent validation, concurrence, collisions, quota, HTTP, purge et bilan interne.
- [Scénarios E2E de panne](../../app/tests/e2e/calculator-failure.spec.ts) et [backend indisponible](../../app/tests/e2e/backend-unavailable.ts) : suivent les intentions explicites et l'usage immédiat en timeout ou hors ligne en distinguant collecte et autres appels backend.

## Changements du récit

Le bloc 7 a été précisé : la configuration Vitest étend la découverte des tests, et les éléments de périphérie sont regroupés sous forme de références commentées. Aucun code applicatif n'a été changé.
