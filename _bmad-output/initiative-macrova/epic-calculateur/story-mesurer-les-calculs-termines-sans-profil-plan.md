---
title: '2.5 — Mesurer les calculs terminés sans profil'
type: feature
ticket: 5
created: '2026-10-08'
status: built
baseline_revision: '17e607f7f625fcb792370d6bde46303d87c615b2'
route: full
route_source: auto
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-7f5718b3/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-7f5718b3/app/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-7f5718b3/app/convex/_generated/ai/guidelines.md
---

<frozen-after-approval reason="plan et décisions approuvés sous délégation explicite de l'utilisateur">

## Intent

**Problem:** Le calculateur gratuit fournit des résultats locaux valides mais ne rend pas leur usage observable selon le contrat public de 1.4.

**Approach:** Relier les intentions explicites réussies à un collecteur Convex anonyme strict et idempotent. Séparer entièrement collecte et domaine/calcul, fournir purge technique à 30 jours et bilan interne pour exploitation.

## Boundaries & Constraints

**Always:** Réutiliser PublicEvent v1 et validatePublicEvent, avec le validateur fermé Convex ; seuls version, eventId, occurredAt et type sont transportés. Le collecteur de cette story accepte exclusivement calculator_completed. Une soumission de calcul réussie et une confirmation de modification réussie produisent chacune une nouvelle intention, même si les valeurs sont identiques. Générer un UUID aléatoire sans dérivation du profil, conserver le même événement complet pour un retry borné. Aucun événement sur saisie, prévisualisation, annulation, reset, rendu, navigation/retour ou refus. Les résultats restent disponibles immédiatement même sans configuration backend, hors ligne, en timeout ou panne ; erreurs de collecte absorbées seulement dans cet adaptateur facultatif. Envoi navigateur sans auth ni cookie, aucune file persistante. Enveloppe sémantiquement valide et horodatage client borné à 24 h de passé et 5 min de futur ; retention pilotée par réception serveur, jamais par horloge cliente. Déduplication transactionnelle par eventId et refus d'une collision avec une enveloppe différente. Protection globale transactionnelle à budget documenté via composant officiel rate-limiter, sans IP/empreinte/identifiant de session. Purge à échéance serveur de 30 jours, avec tâche planifiée et rattrapage cron par lots bornés ; bilan interne excluant les événements expirés. Un simple compteur retenu cohérent avec insertions/purges suffit si aucune agrégation historique n'est exposée. Si nécessaire adopter une lecture interne paginée ou composant aggregate ; jamais scan non borné dans une mutation ou collect().length. Conserver auth privée, domaine nutritionnel pur et primitives shadcn déjà composées.

**Never:** Profil, nutrition, compte, ownerId, e-mail, URL de parcours, identifiant de personne, tracker tiers, stockage navigateur, changement de méthode, collecte démo/personnelle, blocage du calcul gratuit, publication/déploiement distant. La mesure déclare une intention navigateur sans prouver une personne ni empêcher la fabrication d'événements. Politique de conservation et ouverture publique restent à vérifier par epic-validation-lancement.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Erreur |
|---|---|---|---|
| Intentions | Calcul valide puis modification confirmée | Deux enveloppes distinctes minimales ; nouvelle soumission = nouvel UUID | Aucune |
| Sans succès | Rendu, retour, saisie, refus, prévisualisation, annulation, reset | Aucun envoi supplémentaire | Calcul local inchangé |
| Retry/concurrence | Même eventId et contenu réessayés simultanément | Une insertion et un seul comptage ; collision différente refusée | Refus explicite collision |
| Collecte indisponible | Backend absent/panne, réseau coupé, timeout | Résultat et édition utilisables ; retry borné même enveloppe | Aucun rejet non traité ni attente UI |
| Enveloppe | Extra profile/ownerId/macros, version/type/ID/date invalides | Refus avant écriture ; aucun contenu privé persisté | Transport/sémantique refusés |
| Abus | Dépassement du budget global documenté | Collecte refusée et stockage borné par quota ; reprise après fenêtre | Statut de limitation sans résultat fictif |
| Conservation | Réception +30j, horloge cliente malveillante, lots > taille batch | Suppression des événements et absence dans bilan expiré, rattrapage borné | Pas de conservation prolongée par timestamp client |
| Bilan privé | Accès public direct anonyme ou authentifié | Fonction internal inaccessible au client ; lecture exploitation minimale | Refus d'accès |

</frozen-after-approval>

## Code Map

- `app/src/domain/events.ts`, `app/convex/contracts/events.ts` : enveloppe et validation publique v1 réutilisables, ne pas élargir.
- `app/src/routes/calculateur.tsx` : submit appelle calculateCalculatorSession ; update copie le contexte en mémoire. Émettre uniquement depuis gestionnaire explicite après réussite.
- `app/src/components/calculator-target-editor.tsx` : confirmation appelle confirmCalculatorEdit ; preview/reset/cancel utilisent update aussi, donc ne pas déduire l'émission d'un simple update. Ajouter callback explicite de succès.
- `app/src/router.tsx`, `app/src/routes/__root.tsx` : ConvexReactClient facultatif et auth réservée aux routes privées ; conserver cette frontière et utiliser transport de mesure distinct sans auth.
- `app/convex/schema.ts`, `convex.config.ts` : nouvelles tables minimales et composant rate-limiter ; types via codegen local, sans déploiement.
- `app/convex/_generated/ai/guidelines.md` : règles composants rate-limiter, crons.interval, fonctions internes, tests convex-test, requêtes bornées.
- `app/tests/e2e/calculator.spec.ts`, `calculator-failure.spec.ts`, `backend-unavailable.ts`, `app/playwright.config.ts` : confidentialité et panne existantes ; ajuster assertions de panne pour distinguer collecte permise et lectures auth interdites.
- Plans 2.4 et 1.4 : méthode/édition exacte, contrats et auth livrés ; ne pas changer leurs règles.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/lib/calculator-measurement.ts` et tests — construction minimale et transport facultatif, timeout et retry borné, aucune donnée de profil.
- [x] `app/src/routes/calculateur.tsx`, `app/src/components/calculator-target-editor.tsx` — émission explicite après calcul et confirmation valides ; préserver gestion locale et accessibilité.
- [x] `app/convex/calculatorMeasurements.ts`, `schema.ts`, `convex.config.ts`, `crons.ts`, `package.json`, `bun.lock`, `_generated/*` — collecteur fermé, déduplication transactionnelle, quota global officiel, purge et bilan internal.
- [x] `app/convex/calculatorMeasurements.test.ts`, `app/tests/e2e/calculator*.spec.ts`, fixtures/config si nécessaires — couvrir toutes les lignes de matrice, concurrence, interdiction publique et panne intégrée.
- [x] `app/README.md` — documenter sémantique, enveloppe, budget/limites abus, exploitation/purge/retry et condition de vérification politique avant ouverture.

**Acceptance Criteria:**
- Given un parcours sans compte, when deux intentions réussies sont exécutées, then deux événements minimaux distincts sont collectables sans transmission du profil.
- Given une collecte indisponible, when la personne calcule ou confirme une modification, then les valeurs locales restent immédiatement utilisables.
- Given des envois publics hostiles, when le collecteur les reçoit, then validation et quotas empêchent les écritures non conformes et le bilan demeure inaccessible.
- Given un événement reçu, when 30 jours s'écoulent, then sa purge serveur et son exclusion du bilan sont vérifiables.

## Implementation Notes

- 2026-10-08 — Initiative passée explicitement à find après erreur d'absence d'initiative active. Arbre initial propre, branche t3/implement-initiative-2-5 cohérente. Route full (>100 lignes). Arbitrages et checkpoint « approve and continue » pris sous mandat utilisateur ; aucun point ouvert.
- Choix techniques peuvent être ajustés dans ces frontières selon les API installées ; toute limite effective doit être documentée et testée sans prétention de conformité.

- Plan complet conservé sous mandat utilisateur malgré dépassement indicatif de 1600 tokens : un seul objectif transverse et matrice de sécurité/rétention nécessaire.

- Collecteur public HTTP à `/measurements/calculator` ; opérations persistence/internal et bilan paginé interne. Quota global officiel 1000 nouvelles insertions/heure UTC, corps ≤1024 octets. Transport sans cookie/auth/referrer, deux essais ≤1,5s chacun. Suppression programmée + rattrapage horaire par lots 100. Bindings actualisés localement sans opération distante.

## Plan Change Log

## Review Triage Log

- 2026-10-08 — Revue quick indépendante du diff complet : high=0, medium=0, low=0, false=0, maybe-false=0 ; aucun constat retenu, aucun travail différé. Contrat PublicEvent générique d'identifiant confirmé ; UUID aléatoire imposé au constructeur navigateur, respecté et testé. Relecteur a exécuté les dix tests ciblés de collecte/transport : tous réussis.

## Verification

Depuis `app/` : `bun run check` exit 0, zéro erreur/avertissement ; `bun run typecheck`, `bun run test`, `bun run test:e2e`, `bun run build`. Audit de chaque ligne matrice : test exécuté et réussi. `git diff --check`. Aucune validation auth réelle revendiquée par E2E public, aucune ouverture publique/déploiement nécessaire pour cette story.

### Audit de matrice — 8 octobre 2026

- Intentions et absence de succès : E2E « intentions explicites seules » (trois UUID distincts, calcul resoumis et confirmation identité, aucun rendu/saisie/prévisualisation/annulation/reset/refus/retour).
- Retry et concurrence : test Convex cinq appels simultanés, une insertion/quatre duplicatas, collision ; transport réseau/503/timeout conserve corps.
- Indisponibilité : absence configuration en unité, E2E panne auth/collecte et timeout puis hors ligne avec confirmation immédiate, sans pageerror.
- Enveloppe : tests Convex versions/types/IDs/dates/champs privés refusés ; endpoint HTTP corps supplémentaire ou >1024 refusé.
- Abus : 999 insertions puis deux simultanées = accepté/limité ; endpoint 429, fenêtre suivante acceptée.
- Conservation : expiration exacte +30j, timestamp futur n'allongeant pas échéance, bilan excluant expirés, 107 lignes purgées avec continuation.
- Bilan privé : enregistrement internal et absence de route de lecture HTTP pour clients anonymes/connectés ; bilan borné 100 puis 5, enveloppes absentes du résultat. Convex-test ne simule pas l'API RPC cloud ; la visibilité repose sur internalQuery (aucune recette cloud revendiquée).

Les 412 tests unitaires et trois scénarios E2E ciblés ont été exécutés et réussis. Check zéro diagnostic et typecheck réussis. Construction client/SSR réussie (avertissements use client des dépendances connus). Suite E2E complète en cours ; première tentative perturbée au premier chargement par import dynamique Vite, investiguée séparément.

### Vérification finale — 8 octobre 2026

- `bun run check` : exit 0, 160 fichiers, zéro erreur et zéro avertissement ; `bun run typecheck` : exit 0.
- `bun run test` : exit 0, 412 tests réussis, 23 fichiers, aucun skip. Revue indépendante : dix tests ciblés supplémentaires réussis.
- `bun run test:e2e` : exit 0, 21 scénarios réussis en 1,1 minute. Première tentative : 20 réussites et un échec au chargement du module client Vite avant navigation (cache de développement lors de construction concurrente) ; redémarrage puis relance complète réussie sans modification d'attente ou suppression de scénario.
- `bun run build` : exit 0, client et SSR générés ; avertissements de directives use client provenant des dépendances, déjà observés dans 2.4. `git diff --check` : exit 0.
- Toutes les lignes de matrice sont couvertes par des tests exécutés et réussis. Revue quick sans constat restant, aucun travail différé. Aucune recette RPC cloud ni authentification réelle revendiquée, aucun déploiement effectué ; publication backend/frontend et vérification de politique avant ouverture suivent les stories de livraison/lancement.
