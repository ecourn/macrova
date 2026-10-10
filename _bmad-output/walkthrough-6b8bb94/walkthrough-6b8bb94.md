# Revue guidée du commit 6b8bb94

Cible : `6b8bb9404bcac7bd8cfc031e18384beb30521186` — enrichir et valider les détails produit sourcés.

- [x] 1. Intention
- [x] 2. Grandes lignes
- [x] 3. Normalisation conservatrice
- [x] 4. Accès, quotas et réseau
- [x] 5. Interface et immutabilité
- [x] 6. Périphérie, documentation et preuves

## 1. Intention — accepté

**Problem:** Le détail de 3.2 est un hit de recherche dont l’index peut être ancien et incomplet. La story 3.3 doit relire le produit par son code OFF et fournir un instantané v1 vérifié ou des blocages précis.

**Approach:** Étendre le module catalogue avec une action produit v3.6, normalisation conservatrice partagée, quota produit durable et suspension commune. Relier cette relecture explicite au détail existant pour rendre la fonction utilisable ; garder le hit initial et les dates distinguées, sans remplacement automatique ni sélection calculable nouvelle.

Texte reproduit intégralement depuis la section Intent du [plan de la story](../initiative-macrova/epic-catalogue/story-enrichir-et-valider-les-details-produit-sources-plan.md).

## 2. Grandes lignes — accepté

Le détail conserve le résultat de recherche et permet une consultation produit explicitement déclenchée. Cette consultation suit le même circuit de réservation et de remise que la recherche, avec sa propre normalisation et son budget distinct.

- [Normalisation produit](../../app/src/domain/catalogue.ts) : `normalizeProductBody` transforme l’enveloppe OFF v3.6 en résultat absent, indisponible ou snapshot valide avec statut et blocages.
- [Action produit](../../app/convex/catalogue.ts) : `product` valide le code puis utilise l’exécution réseau commune à la recherche.
- [Réservation partagée](../../app/convex/catalogueState.ts) : `reserve` vérifie l’accès, la suspension, la déduplication et le budget du type de travail.
- [Détail interactif](../../app/src/components/catalogue-search.tsx) : la nouvelle lecture s’ajoute séparément et les réponses devenues obsolètes sont ignorées.

## 3. Normalisation conservatrice — accepté

Le wrapper produit neutralise les nutriments et la base legacy avant d’appeler le normaliseur existant. Il conserve les lexèmes publics utiles et construit un snapshot v1 validé ; toute raison restante rend le résultat explicitement bloqué. Préparation, obsolescence, source packaging, base et précision sont contrôlées sans inventer de valeur ni arrondir.

La lecture centrale est [normalizeProductBody](../../app/src/domain/catalogue.ts), le contrat de transport est [productResultValidator](../../app/convex/contracts/catalogue.ts), et les captures réelles immuables ainsi que les négatifs synthétiques sont regroupés dans les [tests produit du domaine](../../app/src/domain/catalogue-product.test.ts).

## 4. Accès, quotas et réseau — accepté

Les réservations produit et recherche ont des budgets globaux distincts, avec déduplication des appels en vol et compatibilité des anciennes réservations de recherche. La suspension OFF est commune aux deux types et enregistrée même si une session expire. L’accès est relu avant réseau et remise ; le catch réseau laisse les erreurs backend originales remonter.

Le circuit est décrit par [runCatalogue](../../app/convex/catalogue.ts), les transactions par [catalogueState](../../app/convex/catalogueState.ts), et le nouvel index par le [schéma](../../app/convex/schema.ts). Les [tests Convex](../../app/convex/catalogue.test.ts) portent sur concurrence, quotas glissants, suspension, droits, réponses 404 validées, taille et timeout. La requête produit transmet le code et une projection de champs publics ; staging seul reçoit les identifiants publics OFF.

## 5. Interface et immutabilité — accepté

Le bouton de consultation produit laisse le hit initial lisible et ajoute chaque lecture réussie dans un résultat séparé avec sa propre date. Le compteur de génération invalide les réponses tardives lors d’un retour, changement de hit, nouvelle recherche, déconnexion réseau ou démontage. Les blocages gardent leurs nutriments nommés et une panne n’annonce pas de consultation fraîche.

Le comportement est porté par [CatalogueSearch](../../app/src/components/catalogue-search.tsx), branché à l’action via la [route aliments](../../app/src/routes/aliments.tsx). Les [tests navigateur catalogue](../../app/tests/e2e/catalogue.spec.ts) décrivent les consultations successives, l’absence, les blocages et l’abandon des réponses tardives avec des promesses locales.

## 6. Périphérie, documentation et preuves — accepté

- [README](../../app/README.md) : configuration serveur, confidentialité, limites et distinction entre simulation et recette réelle.
- [Configuration Convex](../../app/convex/convex.config.ts) : deux variables serveur optionnelles pour l’endpoint et la version produit.
- [Déclarations générées](../../app/convex/_generated/server.d.ts) : types Env synchronisés ; génération normale requise avant publication ultérieure selon le plan.
- [Plan de la story](../initiative-macrova/epic-catalogue/story-enrichir-et-valider-les-details-produit-sources-plan.md) : matrice de scénarios et preuves d’implémentation antérieures.
