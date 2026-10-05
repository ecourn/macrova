# Walkthrough — Ticket 1.3 : autorisation et fermeture communes

Cible : commit `02e9b50db5f56e0bb645ed3bbd27d168abd7efbe`, depuis la baseline `80a2334`. Le [plan](../epic-socle/story-autorisation-et-fermeture-communes-plan.md) décrit le périmètre.

Revue **terminée**. Les sept blocs sont acceptés par délégation explicite de l’utilisateur. Aucun bloc courant ; la prose du récit n’a pas été modifiée pendant la revue.

## [x] Bloc 1 — Intention — accepté par délégation

**Problem:** Le socle ne dispose pas de contrôles partagés de propriété, de droits confirmés ni de fermeture durable. Les futurs modules pourraient autoriser une écriture sans droit ou recréer des données après fermeture.

**Approach:** Fournir des contrats communs et des gardes serveur réutilisables, une lecture privée du droit et une fermeture durable idempotente. Vérifier les contrôles par des comptes et commandes exclusivement synthétiques dans convex-test. Le module abonnement reste propriétaire de la projection ; le socle définit sa forme sans politique fournisseur.

Source : section « Intent » du [plan approuvé](../epic-socle/story-autorisation-et-fermeture-communes-plan.md), reproduite verbatim.

## [x] Bloc 2 — Grandes lignes — accepté par délégation

Le domaine définit le droit confirmé. Les gardes serveur composent identité, propriété, ouverture et droit ; les opérations du compte exposent son état et sa fermeture durable.

- [Domaine du droit](../../../app/src/domain/access.ts) : validation pure de la projection.
- [Gardes serveur](../../../app/convex/lib/access.ts) : contrôles réutilisables dans les transactions.
- [Opérations du compte](../../../app/convex/account.ts) : lecture privée et fermeture idempotente.
- [Tests Convex](../../../app/convex/access.test.ts) : comportement observable avec comptes synthétiques.

## [x] Bloc 3 — Contrat et refus par défaut — accepté par délégation

Un droit confirmé porte une version, un état activé et une échéance. Une projection absente, désactivée, invalide ou arrivée à échéance refuse le droit, sans durée de grâce.

Le [domaine du droit](../../../app/src/domain/access.ts) applique les règles temporelles. Les [codes partagés](../../../app/src/domain/contracts.ts) et les [validateurs Convex](../../../app/convex/contracts/access.ts) transportent les résultats et refus entre couches.

## [x] Bloc 4 — Identité, propriété et erreurs — accepté par délégation

Chaque entrée privée résout l’utilisateur Better Auth côté serveur. La référence doit appartenir à cet utilisateur ; les contrôles d’identité, d’ouverture et de droit restent distincts.

Les [gardes serveur](../../../app/convex/lib/access.ts) distinguent session absente, référence étrangère et référence introuvable. Les [opérations du compte](../../../app/convex/account.ts) utilisent ces contrôles en préservant les erreurs techniques du composant et de la base.

## [x] Bloc 5 — Fermeture durable et travail interne — accepté par délégation

La fermeture inscrit un marqueur durable indépendant du compte auth. La répétition retrouve le même marqueur ; une transaction interne créatrice ou modificatrice relit cette fermeture avant son écriture.

La [mutation de fermeture](../../../app/convex/account.ts) demande une confirmation distincte et reste accessible sans droit actif. La [garde interne](../../../app/convex/lib/access.ts) consulte le marqueur même après disparition de l’utilisateur auth. Le [schéma](../../../app/convex/schema.ts) conserve séparément droit et fermeture.

## [x] Bloc 6 — Scénarios de la matrice — accepté par délégation

Les scénarios distinguent identité, propriété, ouverture et droit. Ils couvrent les frontières temporelles, la fermeture répétée, le travail interne après suppression auth et les erreurs techniques.

Les [tests du domaine](../../../app/src/domain/access.test.ts) ciblent la projection. Les [tests Convex](../../../app/convex/access.test.ts) exercent deux comptes et leurs références ; les [fixtures](../../../app/tests/fixtures/access-functions.ts) restent hors des fonctions métier déployables. La [matrice du plan](../epic-socle/story-autorisation-et-fermeture-communes-plan.md) fournit les attentes.

## [x] Bloc 7 — Périphérie — accepté par délégation

- [Documentation](../../../app/README.md) : usages et limites de la fermeture du socle.
- [Schéma Convex](../../../app/convex/schema.ts) : tables minimales et index par propriétaire.
- [Bindings générés](../../../app/convex/_generated/api.d.ts) : exposition locale des opérations du compte.
