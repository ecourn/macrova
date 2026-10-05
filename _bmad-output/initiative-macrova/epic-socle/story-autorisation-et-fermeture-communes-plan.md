---
title: 'Autorisation et fermeture communes'
type: 'feature'
ticket: 3
created: '2026-10-05'
status: built
baseline_revision: '80a2334829e84a6144b7b2753a565e9c92f618e1'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['app/AGENTS.md', 'app/convex/_generated/ai/guidelines.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le socle ne dispose pas de contrôles partagés de propriété, de droits confirmés ni de fermeture durable. Les futurs modules pourraient autoriser une écriture sans droit ou recréer des données après fermeture.

**Approach:** Fournir des contrats communs et des gardes serveur réutilisables, une lecture privée du droit et une fermeture durable idempotente. Vérifier les contrôles par des comptes et commandes exclusivement synthétiques dans convex-test. Le module abonnement reste propriétaire de la projection ; le socle définit sa forme sans politique fournisseur.

## Boundaries & Constraints

**Always:** AD-6, AD-7, AD-9 et conventions architecture-app. Chaque entrée privée appelle authComponent.getAuthUser(ctx), ownerId est le _id Better Auth serveur. Les références privées sont contrôlées par propriétaire, même lues par ID. Index ownerId en premier. Les erreurs partagées conservent code stable, fields et retryable ; les erreurs backend réelles sont propagées sans catch générique. Une session absente/expirée/révoquée est refusée. La projection de droit porte enabled et validUntil UTC millisecondes : absent, désactivé, échéance atteinte ou valeur invalide refuse par défaut, sans durée de grâce. Une fermeture durable est persistée avant nettoyage et chaque transaction interne créatrice/modificatrice relit cette fermeture dans sa propre transaction. La fermeture est irréversible dans cette API et ne nécessite pas de droit actif. Compte, abonnement, résiliation et demandes de données demeurent accessibles au propriétaire sans droit actif : distinguer identité, ouverture et droit. Aucun droit accordé par le navigateur.

**Never:** Statut fournisseur, paiement public ou test donnant un droit dans une API publique ; pas de secret, déploiement ou accès distant. Pas de module repas/catalogue/export/delete complet, de suppression auth ou de promesse de suppression effective. Pas de seconde logique de droits SSR ni modification d'interface. Les fixtures de validation ne sont pas des commandes métier publiques déployables. Ne jamais exposer une commande générique de tables. Aucun ownerId client accepté comme autorité.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Propriétaire | Deux sessions valides et références appartenant à chacune | Chacun lit sa référence, toute référence de l'autre refusée | ACCESS_DENIED distinct de NOT_FOUND |
| Session | Anonyme, expirée ou révoquée | Aucune lecture privée ni écriture | UNAUTHENTICATED commun |
| Droit | Absent, disabled, expiré, limite exacte, date invalide | Lecture état sans inventer un droit ; écriture personnelle refusée | ENTITLEMENT_REQUIRED |
| Droit actif | enabled et validUntil strictement futur valide | Écriture personnelle autorisée pour propriétaire ouvert | Aucun |
| Gestion compte | Propriétaire sans abonnement | Lecture état et fermeture accessibles | Aucun |
| Fermeture | Fermeture demandée deux fois | Marqueur durable identique, écritures personnelles refusées même avec droit actif | ACCOUNT_CLOSED |
| Mutation interne | Travail arrivé après fermeture, même après suppression utilisateur auth | Relit le marqueur dans transaction et refuse création/modification ; aucune donnée recréée | ACCOUNT_CLOSED |
| Panne backend | Échec composant ou DB | Erreur technique conservée, aucune autorisation obtenue | Erreur originale propagée |

</frozen-after-approval>

## Code Map

- `app/convex/auth.ts` : authComponent, getAuthUser et safeGetAuthUser ; garder la lecture facultative existante.
- `app/convex/auth.test.ts` : fixtures Better Auth avec vrais documents session simulés, convex-test et module map ; réutiliser ce mécanisme.
- `app/convex/schema.ts` : vide hors composant auth ; ajouter seulement projection minimale et marqueur durable ownerId.
- `app/src/domain/contracts.ts`, `app/convex/contracts/food.ts` : codes et validateurs existants, étendre sans casser nutrition.
- `app/convex/_generated/api.d.ts` : bindings versionnés ; génération locale uniquement, le codegen habituel peut téléverser. Les modèles DataModel dérivent déjà du schéma.
- `app/README.md` : contrats et frontière SSR/backend existants, documenter usages et limitations du socle.
- Documents chargés : architecture AD-6/7/9 ; spec et compagnons, UX via investigation ; plan 1.2 garantit domaine pur et validateurs partagés.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/contracts.ts`, `app/src/domain/access.ts`, `app/convex/contracts/access.ts` — contrat versionné du droit et erreurs communes, validation pure et structure Convex.
- [x] `app/convex/schema.ts`, `app/convex/lib/access.ts` — tables minimales indexées, gardes identité/propriété/ouverture/droit et garde interne transactionnelle.
- [x] `app/convex/account.ts` — lecture privée du droit et état de fermeture, fermeture durable idempotente sans abonnement ; chaque fonction a args/returns validés.
- [x] `app/src/domain/access.test.ts`, `app/convex/access.test.ts`, fixtures test hors fonctions déployables — couvrir chaque ligne de matrice, avec deux comptes, références distinctes, transactions publiques simulées et internes ; droit alimenté par test uniquement, jamais paiement public.
- [x] `app/convex/_generated/api.d.ts`, `app/README.md` — bindings locaux et guide pour consommateurs futurs, portée limitée de fermeture et projection abonnement.

**Acceptance Criteria:**
- Étant donné deux comptes et leurs références, lorsqu'ils appellent les contrôles via Convex, alors leurs propres références sont lisibles et celles de l'autre sont refusées côté serveur.
- Étant donné un compte fermé ou sans droit confirmé, lorsqu'une commande personnelle est exécutée, alors aucune écriture ne réussit et une erreur technique reste distinguée d'un refus.
- Étant donné un travail interne différé, lorsqu'il tente de créer ou modifier après fermeture, alors le contrôle et l'écriture appartiennent à la même transaction et aucune recréation n'a lieu.

## Implementation Notes

Plan approuvé par délégation explicite de l'utilisateur : prendre les décisions courantes et continuer jusqu'à achèvement. Estimation supérieure à 100 lignes, route full. Fermeture de socle seulement, confirmation distincte exigée par la mutation ; le futur module de suppression orchestrera le nettoyage. Si les chemins proposés doivent être regroupés pour garder un code simple, consigner le choix sans changer le contrat.

## Plan Change Log

## Review Triage Log

Revue quick indépendante du diff intégral : aucun constat (high=0, medium=0, low=0, false=0, maybe-false=0). Aucun travail différé, aucune correction requise.

## Verification

Depuis app : bun run test (toutes fixtures enregistrées, zéro skip), bun run typecheck, bun run check (zéro erreur/avertissement), bun run build. Revue indépendante du diff intégral incluant nouveaux fichiers, audit de chaque ligne de matrice. Aucun backend distant nécessaire : convex-test vérifie les transactions et le composant Better Auth localement.

### Résultats de l’implémentation

89 tests réussis sans skip ; typecheck, check (zéro diagnostic) et build réussis. Matrice auditée : propriétés et NOT_FOUND, sessions invalides, droits absents/désactivés/échus/inconnus, écriture active, gestion sans droit, fermeture idempotente, transactions internes après suppression auth et pannes composant/DB sont couverts par access.test.ts (domaine et Convex). Fixtures hors convex/ ; aucune opération distante.

Vérification orchestrateur finale : bun run test (89/89, six fichiers, aucun skip), bun run typecheck (sortie 0), bun run check (115 fichiers, zéro diagnostic, sortie 0). Build client et SSR validé par implémenteur. Revue indépendante terminée sans constat. Aucun déploiement, push ni modification des tickets ; statut du plan built selon workflow.
