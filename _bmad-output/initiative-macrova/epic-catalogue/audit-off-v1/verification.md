# Vérification — 10 octobre 2026

Révision de départ : `a7356935f43691944990d2af45bc20c11ed5bf4d`. Normaliseur `macrova-off-audit/1`, contrat nutritionnel partagé v1 inchangé. Code et artefacts du diff courant ; aucune publication/push. Bun1.4.2, Vitest5.0.3, Biome2.5.15, TypeScript6.0.3, dépendances du bun.lock installées avec `bun install --frozen-lockfile`.

| Entrée / commande depuis app/ | Attendu | Observé | Preuve | Limite |
| --- | --- | --- | --- | --- |
| `bun scripts/audit-off.ts validate` | 50 ids/requêtes uniques, catégories et états/bases présents | 50 cas, validation automatisée positive et négative | manifest.json, audit-off.test.ts | Corpus technique choisi par l’agent, aucune représentativité |
| `bun scripts/audit-off.ts capture` puis `capture-sal` | Captures réelles datées, suspension429/503, ≤8 recherches/min | 50 captures principales : 47HTTP 200, 3HTTP 503 ; échecs et mauvaises projections archivés | captures/, attempts/, traces classification.json | Deux méthodesOFF, indexSAL ancien, aucune garantie actuelle |
| `bun scripts/audit-off-products.ts capture` | Codes déjà retournés, lectures distinctes, ≤12/min | 3HTTP 200 : tofu utilisable, amandes INVALID_DECIMAL, yaourt SOURCE_OBSOLETE | products/, enrichment-classification.json | Ne gonfle pas les 50 recherches ; aucune valeur computed/estimate utilisée |
| `bun scripts/audit-off.ts replay`, deux sorties comparées par cmp puis à classification.json | Identité hors réseau et empreintes vérifiées | Même SHA256 3b88500b6eda909d9147d958e98e94eec2a9164c742f47529c50264f5037debb ; cmp 0 | verification-replay.txt | Photographie des fichiers, aucune nouvelle interrogation |
| `bun scripts/audit-off-report.ts` | Matrice50 cas, références source et calcul exact | 2utilisables, 39complétion privée sourcée nécessaire, 6non pris en charge, 3indisponibles ; 147occurrences, 2 vecteurs3/6 | decision.md, classification.json, repas-reference.json | Pas de solver ni de validation des besoins/portions plausibles |
| `bun run test` | Tous tests passent, réseau interdit dans replay, altération échoue | 25 fichiers/455 tests passent ; audit37 tests | verification-test.txt | Fixtures synthétiques séparées ; aucune authentification réelle revendiquée |
| `bun run check` | Sortie0, zéro erreur/avertissement | 169 fichiers vérifiés, sortie 0 | verification-check.txt | Analyse statique locale |
| `bun run typecheck` | Sortie0 | Sortie0, aucun diagnostic | verification-typecheck.txt | Typage local |

Les tests vérifient également les empreintes des captures archivées, la filiation des enrichissements, les références alimentaires de repas, les contraintes invalides (taille, doublon, borne, pas, verrou, unité), les rationnels exacts, les états crus/cuits inconnus ou incompatibles, unités/modificateurs, absence≠zéro, numérique, réponse malformée, timeout/HTTP429/503 et suspension persistante sans retry. Les mocks de ces scénarios sont explicitement synthétiques et ne participent pas au compte 50.

Échecs conservés et corrections : premier503 OFF réel avec page de surcharge, contrôle manuel curl également503, trois503 principaux et décisions/délais de reprise dans attempts/. Projection Search-a-licious avec fields répétés ne retournait que countries_tags : 36 réponses archivées, recontrôles manuels avec CSV et test de construction URL. Une assertion de test de référence altérée attendait MEAL_SOURCE alors que le lookup rejetait avant calcul ; le lookup a été corrigé pour laisser la vérification d’empreinte au vérificateur de repas, puis la suite 37/455 a réussi. Les erreurs initiales d’outillage (dépendances absentes) ont été résolues par l’installation verrouillée ; aucun diagnostic désactivé.

La disponibilité réelle de la base a été observée ponctuellement ; replay/simulations sont hors réseau. L’adaptateur applicatif, corrections privées, droits, moteur et ouverture publique restent à construire/vérifier selon les epics suivants. La référence 3/6 est un vecteur hétérogène source explicite, dont riz cru dans le vecteur 6, sans assimilation au cuit ni conseil alimentaire.

## Vérification finale après revue quick

Les 455 tests initiaux ci-dessus restent la preuve de la première implémentation. Deux défauts reproduits par la revue indépendante ont été corrigés : JSON numérique invalide accepté avant transformation et préparation v3.6 non contrôlée. La grammaire originale est désormais validée avant conservation des lexèmes ; les préparations autres que as_sold sont bloquées explicitement. Six cas de régression supplémentaires couvrent ces défauts.

Vérifications finales depuis app/ : `bun run test` : 25 fichiers / 461 tests réussis, dont 43 pour l’audit ; `bun run check` : 169 fichiers, aucun diagnostic, sortie 0 ; `bun run typecheck` : sortie 0. Deux replays strictement identiques à classification.json, SHA-256 3b88500b6eda909d9147d958e98e94eec2a9164c742f47529c50264f5037debb ; replay produit strictement identique à enrichment-classification.json. Les captures réelles sont inchangées. Aucun constat différé.
