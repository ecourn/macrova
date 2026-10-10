# Walkthrough du commit a010774

Cible : `a0107740587f19b2161567de6feed63b4ccd914a`. Revue terminée, aucun bloc courant. Questions et décisions déléguées par l’utilisateur ; aucun changement de code durant cette revue. Les acceptations relèvent de ce mandat, sans validation humaine interactive. Décisions dans le [journal](walkthrough-a010774-log.md).

- [x] Bloc 1 — Intent — **accepté par délégation**
- [x] Bloc 2 — Grandes lignes — **accepté par délégation**
- [x] Bloc 3 — Normalisation et provenance — **accepté par délégation**
- [x] Bloc 4 — Accès et réseau borné — **accepté par délégation**
- [x] Bloc 5 — Quotas, déduplication et suspension — **accepté par délégation**
- [x] Bloc 6 — Parcours accessible et réponses tardives — **accepté par délégation**
- [x] Bloc 7 — Périphérie, preuves et tests — **accepté par délégation**

## Bloc 1 — Intent

Accepté par délégation. Changé pendant la revue : non.

**Problem:** Aucun parcours applicatif ne relie encore une recherche alimentaire à OFF. La story 3.2 ouvre Aliments dans l’espace personnel isolé, avec liste et détail sourcés et les protections communes requises pour les prochaines étapes.

**Approach:** Action Convex Search-a-licious configurée, normaliseur audité partagé, réservation durable centralisée, déduplication des appels identiques en vol et suspension globale. UI française accessible sur soumission explicite. Vérification répétable par fixtures, puis recherche réelle et détail sur backend isolé avec droit de test ; observation actuelle et simulation clairement distinguées, panne réelle recevable.

Source : [plan](../initiative-macrova/epic-catalogue/story-relier-la-recherche-off-au-premier-parcours-catalogue-plan.md).

## Bloc 2 — Grandes lignes

Accepté par délégation. Changé pendant la revue : non.

[aliments.tsx](../../app/src/routes/aliments.tsx) ouvre la route privée ; [catalogue-search.tsx](../../app/src/components/catalogue-search.tsx) porte formulaire, liste et détail ; [catalogue.ts](../../app/convex/catalogue.ts) orchestre le réseau ; [catalogueState.ts](../../app/convex/catalogueState.ts) centralise les réservations ; [off-normalization.ts](../../app/src/domain/off-normalization.ts) partage la transformation auditée.

Soumission → réservation autorisée → appel du meneur → normalisation → remise autorisée → affichage. Le détail reprend le hit reçu sans relecture produit.

## Bloc 3 — Normalisation et provenance

Accepté par délégation. Changé pendant la revue : non.

[off-normalization.ts](../../app/src/domain/off-normalization.ts) préserve les lexèmes numériques et construit FoodSnapshot v1 avec provenance et révision. [domain/catalogue.ts](../../app/src/domain/catalogue.ts) filtre les produits obsolètes, neutralise les valeurs invalides et conserve raisons et date d’index.

L’interface distingue zéro, absence, base ambiguë et état inconnu. Consultation et index sont séparés ; référence OFF et licences sont visibles.

## Bloc 4 — Accès et réseau borné

Accepté par délégation. Changé pendant la revue : non.

[catalogueState.ts](../../app/convex/catalogueState.ts) vérifie session, compte et droit à la réservation et à la remise ; le propriétaire du participant est contrôlé. [catalogue.ts](../../app/convex/catalogue.ts) vérifie encore avant fetch et laisse les erreurs Convex hors du catch réseau.

Endpoint/version imposés, champs minimisés, cookies omis, redirections refusées, timeout de 15 secondes, corps de 256 000 octets et dix hits maximum.

## Bloc 5 — Quotas, déduplication et suspension

Accepté par délégation. Changé pendant la revue : non.

[catalogueState.ts](../../app/convex/catalogueState.ts) réserve transactionnellement un quota de huit recherches par minute, complété par une fenêtre glissante. Appels identiques en vol regroupés ; résultat transitoire réservé aux participants rattachés ; soumission ultérieure sans cache. Expiration à 90 secondes, 128 participants maximum, budget produit séparé préparé à douze/minute.

429/503 suspendent globalement ; [suspensionDeadline](../../app/src/domain/catalogue.ts) respecte Retry-After valide ou retient 60 secondes, sans raccourcir une suspension existante. Aucun retry automatique.

## Bloc 6 — Parcours accessible et réponses tardives

Accepté par délégation. Changé pendant la revue : non.

[catalogue-search.tsx](../../app/src/components/catalogue-search.tsx) compose shadcn ; label, statut annoncé et contrôles de hauteur minimale accompagnent le formulaire POST désactivé avant hydratation. Ouverture du détail : focus sur son titre ; retour : focus sur le résultat choisi.

Un compteur ignore les réponses anciennes après nouvelle recherche, déconnexion ou démontage. Saisie conservée, reprise explicite et messages distincts pour accès, backend, panne source, quota et suspension.

## Bloc 7 — Périphérie, preuves et tests

Accepté par délégation. Changé pendant la revue : non.

- [public-auth-boundary.ts](../../app/src/lib/public-auth-boundary.ts), [routeTree.gen.ts](../../app/src/routeTree.gen.ts) : intégration de la route Aliments dans la frontière et le routage.
- [schema.ts](../../app/convex/schema.ts), [convex.config.ts](../../app/convex/convex.config.ts) : tables transitoires et composant de quota.
- [README](../../app/README.md), [audit-off.ts](../../app/scripts/audit-off.ts) : configuration, recette isolée et normaliseur partagé.
- [verification.md](../initiative-macrova/epic-catalogue/recherche-off-v1/verification.md), [sources.md](../initiative-macrova/epic-catalogue/recherche-off-v1/sources.md) : preuves datées et références.
- Suites [Convex](../../app/convex/catalogue.test.ts), [domaine](../../app/src/domain/catalogue.test.ts), [rendu](../../app/tests/config/catalogue-render.test.ts), [navigateur](../../app/tests/e2e/catalogue.spec.ts) : protections, normalisation et parcours.

Clause de lecture : distinguer fixtures, recette réelle historique et vérifications présentes ; les résultats et décisions sont consignés dans le [journal](walkthrough-a010774-log.md).
