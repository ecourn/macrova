# Revue guidée — Mesures et commandes communes

Cible : [plan de la story](../epic-socle/story-mesures-et-commandes-communes-plan.md).

Revue terminée : les six blocs sont acceptés par délégation explicite de l’utilisateur. Aucun bloc courant ; le contenu des blocs n’a pas changé pendant la revue.

## 1. Intention

- [x] Accepté par délégation explicite utilisateur.

Texte repris verbatim des paragraphes Problem et Approach de la section Intent du [plan](../epic-socle/story-mesures-et-commandes-communes-plan.md).

**Problem:** Les futurs propriétaires repas et abonnement ont besoin de contrats communs pour éviter confirmations doubles, mesures ambiguës et erreurs incompatibles.

**Approach:** Définir dans le domaine pur des contrats v1 d’intention, de reçu et d’événements minimisés, leurs validations et sémantiques réutilisables, avec validateurs Convex et fixtures. Réutiliser la propriété et fermeture du ticket 3 pour délimiter les responsabilités serveur.

## 2. Vue d’ensemble

- [x] Accepté par délégation explicite utilisateur.

La story fournit des contrats purs et leurs validateurs de transport pour les futurs modules propriétaires. Le plan relie les invariants métier aux fichiers, aux critères d’acceptation et aux preuves d’exécution.

- [Intent](../epic-socle/story-mesures-et-commandes-communes-plan.md#intent) : problème, approche et limites approuvées.
- [Code Map](../epic-socle/story-mesures-et-commandes-communes-plan.md#code-map) : points d’intégration du domaine et de Convex.
- [Tasks & Acceptance](../epic-socle/story-mesures-et-commandes-communes-plan.md#tasks--acceptance) : livrables cochés et comportement attendu.
- [Verification](../epic-socle/story-mesures-et-commandes-communes-plan.md#verification) : contrôles annoncés et couverture de la matrice.

## 3. Intentions, replay et révision

- [x] Accepté par délégation explicite utilisateur.

Une intention conserve sa clé et son condensat après une panne. Le reçu permet de restituer le résultat acquis pour le même propriétaire et le même contenu ; les changements de contenu et de révision doivent produire un conflit explicite.

- [Commandes du domaine](../../../app/src/domain/commands.ts) : canonicalisation, condensat, décision de replay et contrôle de révision.
- [Erreurs communes](../../../app/src/domain/contracts.ts) : codes stables, champs et caractère réessayable.
- [Tests des commandes](../../../app/src/domain/commands.test.ts) : retry, conflits et refus entre comptes.

## 4. Événements, minimisation et responsabilité serveur

- [x] Accepté par délégation explicite utilisateur.

Les événements personnels correspondent à des effets réellement confirmés ; les événements publics restent séparés. Les contrats organisent les preuves et les métadonnées minimales, tandis que le propriétaire métier conserve l’autorisation et la persistance atomique dans sa transaction.

- [Événements du domaine](../../../app/src/domain/events.ts) : sélection, déduplication et séparation public/privé.
- [Contrats Convex des événements](../../../app/convex/contracts/events.ts) : forme du transport.
- [Gardes d’accès](../../../app/convex/lib/access.ts) : contrôles serveur existants de propriété et de fermeture.
- [Tests des événements](../../../app/src/domain/events.test.ts) : confirmations, filiation, paiement et métadonnées.

## 5. Matrice, acceptation et vérifications

- [x] Accepté par délégation explicite utilisateur.

Chaque ligne de la matrice doit être reliée à un comportement exécuté, y compris les rejets. Les résultats annoncés couvrent aussi la compatibilité du socle nutrition et accès, la parité domaine/transport et la compilation.

- [Matrice du plan](../epic-socle/story-mesures-et-commandes-communes-plan.md#io--edge-case-matrix) : cas nominaux et limites attendus.
- [Critères d’acceptation](../epic-socle/story-mesures-et-commandes-communes-plan.md#tasks--acceptance) : contrats partagés et absence de régression.
- [Tests de transport](../../../app/convex/contracts.test.ts) : validation Convex, versions et données superflues.
- [Résultats annoncés](../epic-socle/story-mesures-et-commandes-communes-plan.md#résultats) : 110 tests, typecheck, check et build.

## 6. Périphérie : documentation et triage

- [x] Accepté par délégation explicite utilisateur.

- [README](../../../app/README.md) : intégration transactionnelle, double destination/retry et responsabilité des mesures privées.
- [Bindings Convex](../../../app/convex/_generated/api.d.ts) : déclaration locale des modules.
- [Triage du plan](../epic-socle/story-mesures-et-commandes-communes-plan.md#review-triage-log) : revue quick annoncée sans constat ni travail différé.
- [Journal de cette revue](walkthrough-mesures-commandes-log.md) : décisions, preuves et points ouverts.

## Clôture

Aucun problème concret identifié dans ce parcours, sans conclusion d’audit exhaustif. Vérifications relancées : 110/110 tests sur neuf fichiers sans skip, typecheck réussi, check de 124 fichiers sans diagnostic et build client/SSR réussi. Plan et code conservés ; récit et journal livrés. Aucun commit ni push effectué.
