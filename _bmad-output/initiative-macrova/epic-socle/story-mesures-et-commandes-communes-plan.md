---
title: 'Mesures et commandes communes'
type: 'feature'
ticket: 4
created: '2026-10-05'
status: built
baseline_revision: '7a97fad51a481741c8c93ca1b6d8565d90857adb'
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

**Problem:** Les futurs propriétaires repas et abonnement ont besoin de contrats communs pour éviter confirmations doubles, mesures ambiguës et erreurs incompatibles.

**Approach:** Définir dans le domaine pur des contrats v1 d’intention, de reçu et d’événements minimisés, leurs validations et sémantiques réutilisables, avec validateurs Convex et fixtures. Réutiliser la propriété et fermeture du ticket 3 pour délimiter les responsabilités serveur.

## Boundaries & Constraints

**Always:** Respecter AD-1, AD-5, AD-6, AD-9 et AD-11. Une intention garde operationId et condensat canonique du contenu après panne ; le même propriétaire et operationId avec même contenu restitue le résultat acquis, un contenu différent est un conflit. Une nouvelle intention change de clé. expectedRevision interdit écrasement silencieux. Définir un format déterministe de canonicalisation des valeurs JSON et de condensat, utilisable client/serveur sans dépendance réseau ; ne pas confondre intention et événement. Les événements privés ont version, eventId, ownerId serveur et horodatage UTC ; produits uniquement après mutation effective. first_personal_meal exige première confirmation personnelle dans favori ou journal, meal_reused exige copie/reprise avec filiation et confirmation ; une double destination ne double pas un événement. payment_settled exige encaissement réel confirmé serveur, distinct du droit, du retour navigateur et de l’état remboursement/renouvellement. Public calculator_completed/demo_completed restent séparés, sans ownerId ni profil. Rejeter versions inconnues, dates/identifiants invalides et champs supplémentaires contenant des données personnelles. Les erreurs ont code stable, fields et retryable ; absence, refus, conflit et indisponibilité sont distincts, seul le transitoire explicite est réessayable.

**Never:** Ajouter persistance générique, table de reçus ou événements, commande publique de mesure, tracker, profil calculateur ou démo enregistré. Aucun module repas/paiement complet, fournisseur, politique commerciale ou déploiement. Aucun ownerId client faisant autorité, aucun catch masquant une panne ; le futur propriétaire vérifie identité/droit/fermeture dans sa transaction avant effet et enregistre reçu et événements atomiquement. Les helpers purs ne constituent pas une autorisation.

## I/O & Edge-Case Matrix

| Scénario | Entrée | Résultat attendu | Erreur |
| --- | --- | --- | --- |
| Première confirmation | personnel, première, favori ou journal après effet | un first_personal_meal | aucune |
| Copie/reprise | filiation + confirmation personnelle | un meal_reused, original indépendant | métadonnées si filiation absente |
| Deux destinations | une intention avec favori et journal | une occurrence par type, identifiants stables au retry | aucune |
| Démo/public | démo, calcul ou absence de confirmation effective | aucun événement personnel ; événement public minimal séparé | rejeter profil/champs privés |
| Paiement | encaissement serveur réel ou simple retour/droit | seul encaissement produit payment_settled | aucune mesure sur retour/droit |
| Retry | même ownerId/operationId/condensat et reçu | résultat existant, aucun nouvel effet | CONFLICT si autre contenu ; autre owner refusé |
| Révision | expectedRevision différente | demande relecture, aucun écrasement | CONFLICT non réessayable |
| Transport | version inconnue, timestamp invalide, données supplémentaires | refus explicite, JSON sans BigInt | UNSUPPORTED_VERSION ou INVALID_METADATA |
| Erreurs | absence/refus/conflit/indisponibilité | code + fields cohérents | retryable vrai seulement pour indisponibilité |

</frozen-after-approval>

## Code Map

- `app/src/domain/contracts.ts` : codes, Result, failure et textes ; conserver erreurs nutrition/access existantes.
- `app/src/domain/access.ts` : isUtcTimestamp réutilisable ; contrat propriété/fermeture inchangé.
- `app/convex/contracts/food.ts` : errorValidator partagé à adapter avec contrat commun, sans changer les calculs.
- `app/convex/lib/access.ts` : gardes existantes ; consommateurs futurs appellent requirePersonalWrite/requireInternalWrite ; ne pas les remplacer.
- `app/src/domain/commands.ts`, `app/src/domain/events.ts` : nouveaux contrats purs, validation, sélection et décision de replay sans IO.
- `app/convex/contracts/commands.ts`, `app/convex/contracts/events.ts` : validateurs structurels typés ; validation sémantique du domaine demeure obligatoire.
- `app/src/domain/*.test.ts`, `app/convex/*.test.ts`, `app/tests/fixtures/` : fixtures synthétiques, hors API métier déployable.
- `app/README.md` : documenter intégration et propriétaire de persistance. Spec et ses compagnons, UX, AD5/11 et plan ticket 3 examinés en investigation.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/contracts.ts`, `app/convex/contracts/food.ts` — étendre erreurs et préserver compatibilité nutrition/access.
- [x] `app/src/domain/commands.ts` — contrats versionnés, canonicalisation/condensat, décision replay et contrôle révision ; résultat du reçu typé sans table générique.
- [x] `app/src/domain/events.ts` — contrats privés/publics séparés et helpers de sélection avec preuve serveur explicite ; métadonnées minimales et identifiants dédupliquables.
- [x] `app/convex/contracts/commands.ts`, `app/convex/contracts/events.ts` — validateurs partagés sans nouvelle API ni schéma persistant.
- [x] `app/src/domain/commands.test.ts`, `app/src/domain/events.test.ts`, `app/convex/contracts.test.ts` — couvrir toute la matrice, canonicalisation indépendante de l’ordre des clés, collision de contenu, minimisation et parité du transport via fixtures locales.
- [x] `app/README.md` — préciser frontières, exemple double destination/retry, collecte serveur et export/delete des mesures privées ; cohorte invitationAt détenue par futur propriétaire avec invités sans usage, pas de calcul de seuil inventé.

**Acceptance Criteria:**
- Étant donné les futurs modules propriétaires, lorsqu’ils consomment ces contrats, alors les intentions et événements partagent une version et une définition unique sans persistance commune ajoutée.
- Étant donné les fixtures de transport, lorsqu’elles sont validées côté domaine et Convex, alors les versions inconnues et données superflues sont refusées et aucun profil public n’est accepté.
- Étant donné le socle existant, lorsque toute la suite est exécutée, alors nutrition, propriété et fermeture restent vérifiées sans régression.

## Implementation Notes

Plan approuvé par délégation explicite : l’utilisateur demande de répondre à sa place et de poursuivre jusqu’à achèvement. Route full estimée supérieure à 100 lignes. Choix techniques de noms et regroupement autorisés si les invariants demeurent explicites. Les événements de paiement ne portent pas de détail fournisseur ou montant inutile ; le rapprochement reste au propriétaire abonnement.

## Plan Change Log

## Review Triage Log

Revue quick indépendante du diff intégral : aucun constat (high=0, medium=0, low=0, false=0, maybe-false=0). Aucun travail différé.

## Verification

Depuis app : bun run test (aucun skip), bun run typecheck, bun run check (zéro erreur/avertissement) et bun run build. Audit des tests exécutés couvrant chaque ligne de matrice ; revue quick indépendante du diff complet incluant fichiers nouveaux. Aucune opération distante nécessaire.

### Résultats

Contrats v1 purs livrés dans commands.ts et events.ts ; validateurs Convex et fixtures de transport hors API déployable. SHA-256 synchrone pur vérifié contre node:crypto et vecteurs standard, frontières de padding et multi-blocs. Erreurs discriminées par code, UNAVAILABLE seul réessayable. Guide README précisant transaction, propriété/fermeture et minimisation. Bindings api.d.ts actualisés localement sans opération distante.

Vérifications : 110/110 tests réussis, neuf fichiers, aucun skip ; typecheck sortie 0 ; check sur 124 fichiers, zéro erreur/avertissement, sortie 0 ; build client et SSR réussi. Vérification orchestrateur : test, typecheck et check réussis ; revue indépendante avec exécution des 110 tests, aucun constat.

Audit matrice : première confirmation et double destination dans events.test.ts ; copies/reprises et filiation, démo et absence d’effet, paiement réel/retour sans preuve, minimisation/versions/dates dans events.test.ts et contracts.test.ts ; replay, conflit de contenu/révision et refus intercompte dans commands.test.ts ; tous codes/fields/retryable transportés dans contracts.test.ts. Toutes ces suites exécutées sans skip. Aucun schéma persistant ni API de collecte ajouté ; la persistance et les autorisations transactionnelles demeurent aux propriétaires métier futurs.
