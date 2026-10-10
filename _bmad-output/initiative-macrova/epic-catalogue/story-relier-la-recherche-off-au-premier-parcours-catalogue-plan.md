---
title: 'Relier la recherche OFF au premier parcours catalogue'
type: feature
ticket: 2
created: '2026-10-10'
status: built
baseline_revision: '5957dbc7fba582638f7bc7060620ca540bbaddcd'
route: full
route_source: auto
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - app/AGENTS.md
  - app/convex/_generated/ai/guidelines.md
  - _bmad-output/initiative-macrova/epic-catalogue/epic-catalogue.md
  - _bmad-output/ux-macrova/DESIGN.md
  - _bmad-output/ux-macrova/EXPERIENCE.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Aucun parcours applicatif ne relie encore une recherche alimentaire à OFF. La story 3.2 ouvre Aliments dans l’espace personnel isolé, avec liste et détail sourcés et les protections communes requises pour les prochaines étapes.

**Approach:** Action Convex Search-a-licious configurée, normaliseur audité partagé, réservation durable centralisée, déduplication des appels identiques en vol et suspension globale. UI française accessible sur soumission explicite. Vérification répétable par fixtures, puis recherche réelle et détail sur backend isolé avec droit de test ; observation actuelle et simulation clairement distinguées, panne réelle recevable.

## Boundaries & Constraints

**Always:** AD-1/3/6/8/10/12 ; contrat FoodSnapshot v1 inchangé. Session Better Auth, compte ouvert et droit actif vérifiés côté Convex avant réseau et remise des résultats. Conserver les vraies pannes backend. Aucun profil, cookie, compte ou identifiant privé envoyé à OFF. Endpoint/version/User-Agent serveur identifiés ; huit recherches/minute maximum par déploiement, budget produit séparé préparé à douze/minute. Réservation transactionnelle avant réseau, échec consommant son budget. Suspension globale 429/503, Retry-After valide respecté sinon au moins 60 secondes, suspension existante jamais raccourcie. Aucun retry automatique. Normalisation conservatrice : null ≠ zéro, bases ambiguës visibles, état inconnu, unités/modificateurs/précision invalides rejetés, produits obsolètes écartés. Dates consultation/index distinctes, référence et attribution OFF/ODbL/DbCL. shadcn locaux ; mobile/clavier, annonces et saisies conservées, réponse ancienne jamais substituée à une recherche récente.

**Never:** Cache, reprise générale des réservations, lecture produit v3.6, correction privée, sélection calculable, moteur, images, fallback legacy, ouverture publique ou paiement. Le détail 3.2 affiche le hit reçu avec limites d’index, sans prétendre relire le produit. Aucun secret Git/VITE, aucune nouvelle autorité nutritionnelle ou de droits, aucun push.

**Décisions déléguées:** Plan et arbitrages approuvés suivant le mandat utilisateur. Initiative Macrova résolue explicitement faute de configuration active. Tests réseau hors OFF par fixtures ; observation réelle ponctuelle conservatrice sur service officiel, pas de contournement d’une suspension. Autoriser les opérations nécessaires sur backend de développement isolé déjà disponible, sans production ; utiliser les accès locaux existants sans exposer leurs secrets. Dédup durable interinstances : seuls participants rattachés pendant l’appel récupèrent son résultat terminal transitoire ; une nouvelle soumission après terminaison appelle de nouveau OFF. Expiration bornée et nettoyage technique de ces résultats, sans cache ni relance de travail. Si regroupements de fichiers utiles, les consigner sans changer ces contrats.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Sortie attendue | Traitement |
|---|---|---|---|
| Recherche | Texte saisi puis soumis | Aucun appel à la frappe ; liste et détail sourcés | Soumission uniquement |
| Vide / panne | hits vide, timeout, HTTP, JSON ou hits invalides | États distincts, aucune nutrition inventée | Reprise explicite |
| Normalisation | zéro, absence, base/état ambigu, nombre/unité invalide, obsolete | Contrat v1 et raisons visibles, donnée invalide non calculable | Aucun arrondi/inférence |
| Accès | Session absente/expirée/révoquée, droit inactif, compte fermé | Aucun fetch ni remise autorisée | Erreur socle conservée |
| Concurrence | Appels identiques/différents, neuvième recherche | Un fetch/un jeton par travail en vol, plafond partagé | Budget distinct de panne |
| Suspension | 429/503, Retry-After secondes/date/invalide | Toutes clés suspendues, délai conservé | Zéro retry automatique |
| Réponse tardive | Nouvelle recherche avant réponse ancienne, hors ligne | Réponse récente et saisie conservées | Ancienne réponse ignorée |

</frozen-after-approval>

## Code Map

- `app/scripts/audit-off.ts` : extraire parseLossless/sourceDecimal/normalizeProduct dans module pur commun, réexporter pour audit et préserver replay 3.1. SAL retourne hits ; projection CSV auditée, nutrition_data_per et last_indexed_datetime.
- `app/src/domain/contracts.ts`, `food.ts`, `decimal.ts` et `app/convex/contracts/food.ts` : FoodSnapshot v1, validations et limites canoniques, aucune redéfinition.
- `app/convex/lib/access.ts`, `auth.ts`, `access.test.ts` : requirePersonalWrite en mutation interne et requireOwner/ouverture ; sessions de tests Better Auth et droit serveur isolé existants.
- `app/convex/schema.ts`, `convex.config.ts`, `_generated/` : ajouter travail transitoire/suspension catalogue ; rateLimiter déjà monté, utiliser ce composant pour quotas. Environnement typé via env généré. Aucun owner client.
- `app/src/routes/dashboard.tsx`, `lib/public-auth-boundary.ts`, `__root.tsx` : garde SSR existante, provider limité login/dashboard ; étendre explicitement à Aliments sans toucher aux routes publiques/calculateur.
- `app/src/components/ui/{button,input,label,card,alert}.tsx` : composer primitives existantes ; `app/README.md` et `playwright.config.ts` : procédure cible dev et tests réels distincts du mode neutralisé.
- Continuité : plans 3.1/1.2/1.3 done, audit conservateur et guards canoniques livrés. Aucune infra catalogue actuelle.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/off-normalization.ts`, `app/scripts/audit-off.ts` — extraire logique auditée pure sans changer replay et ajouter contrats catalogue partagés dans `app/src/domain/catalogue.ts`.
- [x] `app/convex/catalogue.ts`, `catalogueState.ts`, `contracts/catalogue.ts`, `schema.ts`, `convex.config.ts`, `_generated/` — action réseau bornée, gardes, réservations/dédup durables, quota et suspension, résultats transitoires nettoyés.
- [x] `app/src/routes/aliments.tsx`, `components/catalogue-search.tsx`, `dashboard.tsx`, `lib/public-auth-boundary.ts` — formulaire, liste/détail, provenance, erreurs et réponses tardives, route privée et navigation.
- [x] `app/convex/catalogue.test.ts`, `src/domain/catalogue.test.ts`, `tests/config/catalogue-render.test.ts`, `tests/e2e/catalogue.spec.ts` — couvrir chaque ligne de matrice, requête sortante minimisée, parité audit et parcours réel.
- [x] `app/README.md`, `epic-catalogue/recherche-off-v1/` — configuration et preuves datées documentation/disponibilité/parcours isolé ; distinguer vrais résultats et fixtures.

**Acceptance Criteria:**
- Étant donné un compte isolé avec droit actif, lorsqu’il soumet un texte puis ouvre un résultat, alors liste et détail montrent source, quatre valeurs disponibles ou manquantes, base/état et dates sans invention.
- Étant donné les cas de la matrice, lorsqu’ils passent par domaine/Convex/UI, alors chaque comportement est vérifié, aucune donnée privée ne sort vers OFF et les refus empêchent le réseau.
- Étant donné plusieurs instances/comptes, lorsqu’elles recherchent simultanément ou rencontrent 429/503, alors budget/dédup/suspension sont partagés et une reprise exige une nouvelle soumission.

## Implementation Notes

Normaliseur audité extrait sans changement de classifications, imports Node conservés seulement dans CLI. Résultats terminaux publics transitoires et participants privés limités à 128, expiration à 90 secondes sans reprise. RateLimiter fixe complété par contrôle transactionnel glissant sur travaux pour plafonner aussi les frontières de minutes. Participants lus par ID avec propriété vérifiée ; index jobId réservé au nettoyage interne borné, aucune liste privée par propriétaire.

Cible dev dédiée créée pour préserver le socle Render. Droit synthétique accordé uniquement par administration serveur ; recette réelle recherche/détail réussie et preuves sans secrets dans recherche-off-v1. Tests navigateur du composant de production via harness Vite, sans route produit de test ni auth simulée. Premiers essais harness ont échoué sur cache React/CJS et reload d’optimisation ; corrigés par chargement des modules optimisés de la même instance. Les trois tests passent, zéro skip. 509 tests unitaires passent ; typecheck/check/build réussis, replays audit inchangés. Backend synchronisé sur cible dédiée.

## Plan Change Log

## Review Triage Log

| Constat | Verdict | Route | Preuve et résolution |
|---|---|---|---|
| Focus perdu à l’ouverture du détail et au retour (`catalogue-search.tsx`) | medium | patch | Les contrôles focalisés étaient démontés sans transfert de focus ; le statut ne signalait pas le détail. Correction locale : titre focalisable ciblé après ouverture et bouton du résultat restauré au retour. Assertions navigateur sur ces deux transitions réussies. |

Revue quick indépendante du diff complet ; aucun autre constat, aucun report. Le patch a été relu et les vérifications complètes relancées.

## Verification

Depuis app : `bun run test`, `bun run typecheck`, `bun run check` (zéro erreur/avertissement), `bun run build`. Replay recherche/produit identique aux classifications 3.1. Tests UI ciblés et recette identité réelle avec backend dev isolé, droit de test serveur ; enregistrer limites/panne réelle sans la masquer. Revue quick indépendante du diff complet incluant nouveaux fichiers.
