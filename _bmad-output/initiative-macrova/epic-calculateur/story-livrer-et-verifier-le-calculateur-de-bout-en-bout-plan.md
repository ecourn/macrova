---
title: "2.8 — Livrer et vérifier le calculateur de bout en bout"
type: chore
ticket: 8
created: "2026-10-09"
status: built
baseline_revision: "736e43365efa1318ee07b7b044f1201846b5f903"
route: full
route_source: auto
review: quick
review_source: pinned
lenses_ran: [quick]
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-419a0d92/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-419a0d92/app/AGENTS.md
---

<frozen-after-approval reason="réponses, arbitrages et poursuite explicitement délégués par l’utilisateur">

## Intent

**Problem:** Le calculateur des stories 2.1–2.7 fonctionne localement ; le service HTTPS isolé livre encore le socle du 7 octobre. Le mode E2E distant sélectionne uniquement public/auth/contracts et ne vérifie pas CAP-1 ni son collecteur réel.

**Approach:** Étendre la recette distante avec une suite dédiée calculateur et publier le backend de développement puis le frontend sur la cible isolée existante. Consigner des preuves datées, la révision effectivement exécutée, le bilan interne et la procédure de production conditionnelle. Réutiliser les suites locales pour les états qui nécessitent une injection de contexte de méthode ; aucun interrupteur de test de production.

## Boundaries & Constraints

**Always:** Calcul purement local, six entrées en mémoire, contrat fermé PublicEvent v1, collecte sans cookies/auth/referrer, contrôles backend des opérations privées, méthode v1 et primitives shadcn inchangées. Cible de recette exclusivement https://macrova-socle-test.onrender.com avec dev:dazzling-puffin-856. Render Free Frankfurt, aucune nouvelle dépense, previews et auto-deploy désactivés. Profils synthétiques uniquement. Conserver les secrets dans les configurations privées existantes ; aucun log brut sensible versionné. Recette sans trace ni capture auth. Les interventions distantes de livraison sont autorisées par cette story et le mandat de poursuite utilisateur, malgré la restriction générique du workflow.

**Never:** Ouverture publique, déploiement Convex prod, modification de main ou merge automatique, fixture/backend de test déployé, persistance de profil, endpoint de calcul serveur, prétention de validation clinique ou réglementaire. Ne pas déclarer une vérification distante si elle a été exercée seulement localement.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Comportement attendu | Erreur |
|---|---|---|---|
| Référence et modification | 30 ans, 175 cm, 70 kg, coefficient 5, PAL 1.6, éligible ; protéines 110 | 2638/98,93/296,78/117,24 puis protéines 110 et glucides 285,70 ; retour conserve la session | Aucun |
| Invalidité et exclusion | Âge 19.5 puis éligibilité non | Aucun résultat ; saisies conservées ; aucune mesure | Refus visible |
| Collecte réelle | Calcul réussi sur HTTPS | POST minimal accepté, replay dédupliqué, contenu différent refusé ; bilan interne lisible uniquement exploitation | 409 si conflit |
| Panne de collecte | POST intercepté 503 dans le navigateur HTTPS | Deux tentatives identiques au maximum ; résultat et édition utilisables | Aucun succès synthétique |
| Méthode indisponible | Contexte méthode absente/retirée/version différente | Aucune estimation ; vérifier par suites locales existantes, pas par mutation du bundle distant | État explicite |
| Privé anonyme | query account:getAccess et mutation account:close | UNAUTHENTICATED ; bilan interne inaccessible via API publique | Refus backend |
| Confidentialité | Calcul et édition en session anonyme | Aucun profil dans requêtes, URL, cookies ou stockages ; reload efface la mémoire | Échec recette si fuite |

</frozen-after-approval>

## Code Map

- `app/playwright.config.ts` : garde HTTPS/dev cohérents, pas de webServer distant ; ajouter seulement une suite remote conditionnée à remoteOrigin, garder les tests locaux.
- `app/tests/config/playwright.test.ts` : validations isolées de configuration ; confirmer sélection distante et captures désactivées sans perdre les gardes.
- `app/tests/e2e/calculator.spec.ts` : références, édition, refus, mobile et confidentialité réutilisables comme preuves locales.
- `app/tests/e2e/calculator-failure.spec.ts` : fixture localhost indisponible ; ne pas l’exécuter comme preuve cloud.
- `app/src/domain/calculator.test.ts` : vérification méthode indisponible sans changement du produit.
- `app/convex/calculatorMeasurements.ts`, `app/convex/http.ts` : collecteur POST et bilan interne existants, déployer tels quels ; aucun nouveau contrat.
- `app/docs/livraison-ssr-test.md` : accès et ordre backend/frontend de 1.5 ; compléter par une recette calculateur distincte, sans remplacer ses preuves historiques.
- `app/README.md` : relier la nouvelle recette et sa commande.

## Tasks & Acceptance

**Execution:**
- [x] `app/tests/e2e/calculator-remote.spec.ts` : ajouter recette réelle valide/édition/retour/invalidité/exclusion/confidentialité, POST et replay/conflit, panne interceptée, refus privés et internal ; uniquement profils synthétiques, assertions sans impression des corps.
- [x] `app/playwright.config.ts` et `app/tests/config/playwright.test.ts` : sélectionner cette suite uniquement pour une cible HTTPS distante validée et vérifier cette frontière.
- [x] `app/docs/recette-calculateur-livraison.md`, `app/README.md` : documenter commandes, limites d’injection méthode, bilan paginé et procédures backend/frontend, rollback compatible, conditions de production et preuves datées. L’orchestrateur complète les faits après livraison.
- [x] Vérifier localement, revue indépendante, puis orchestrateur : synchroniser Convex dev avec le wrapper, commit/push de branche dédiée pour révision immuable et déploiement manuel Render ; vérifier révision live, recette distante, mesures et sondes. Le push de branche est nécessaire à cette livraison, sans merge main.

**Acceptance Criteria:**
- Given la révision validée, when livraison backend puis frontend sur la cible isolée, then la révision live exacte et les résultats de recette HTTPS sont consignés.
- Given les conditions de lancement non clôturées, when préparation production, then la procédure indique les validations requises et aucune ouverture publique n’est effectuée.
- Given le bilan d’exploitation, when lecture interne paginée à asOf fixé, then comptes seulement, aucun profil ni confusion avec usage personnel ; la recette publique ne peut appeler ce bilan.

## Implementation Notes

- Reconnaissance : arbre initial propre, branche t3/implement-story-2-8-calculateur cohérente ; initiative active absente, ticket résolu en passant le dossier explicitement sans modifier la configuration. Accès Render et GitHub opérationnels ; configuration Convex privée présente, .env.local absent. Les arbitrages et l’approbation sont assumés selon le mandat explicite. Route full estimée >100 lignes de recette/documentation.

- Implémentation locale (9 octobre 2026) : ajout de quatre scénarios `calculator-remote.spec.ts`, sélection exclusivement distante et tests isolés de cette frontière, recette de livraison distincte et lien README. Confirmation CAL-7 : calcul et confirmation d’édition produisent chacun une intention distincte, chaque intention a deux tentatives maximum. Aucun changement produit ou backend.
- Vérifications relevées : `bun run check` code 0, 162 fichiers sans erreur ni avertissement ; `bun run typecheck` code 0 ; `bun run test` code 0, 412/412 tests dans 23 fichiers ; build code 0 avec avertissements tiers existants ; `git diff --check` code 0. `bun run test:e2e:remote --list` code 0 : 10 scénarios dans quatre fichiers, dont quatre calculateur, sans serveur local. Aucun scénario distant exécuté à ce stade.
- Un premier E2E lancé en parallèle du build a rencontré un échec de chargement du module client Vite ; arrêté, puis relancé seul après build conformément au piège connu. Les journaux restent temporaires `/tmp/macrova-2-8-*`, hors Git ; E2E final code 0, **25/25** scénarios réussis en 1,5 min. Une émission Vite de chargement client a aussi été observée sur le serveur synthétique localhost:3002 sans échec de scénario ; aucune preuve cloud n’en est déduite.

## Plan Change Log

## Review Triage Log

- 2026-10-09 — Revue quick finale indépendante après correction et livraison : high=0, medium=0, low=0, false=0, maybe-false=0. Correction de confidentialité et concordance SHA live / 10 scénarios / bilan0→2 / 10 assets confirmées ; aucun constat restant ouvert, aucun travail différé.

- 2026-10-09 — Quick : high=0, medium=1, low=0, false=0, maybe-false=0. medium / patch : calculator-remote surveillait réseau et stockage après profile(page), donc une fuite de saisie serait invisible ; le filtre de valeurs brutes manquait le profil normalisé. Correction minimale : références avant saisie et contrôle structurel des seules requêtes permises dans ce parcours public, sans corps dans les rapports. Aucun défaut produit constaté.

## Verification

Depuis app/ : bun install --frozen-lockfile si nécessaire, bun run check (zéro avertissement/erreur), bun run typecheck, bun run test, bun run test:e2e puis bun run build ; git diff --check. Vérifier suite remote listée sans démarrer de serveur local et gardes de configuration. Après revue : bun run convex:dev --once --tail-logs disable sur dev explicite ; build Render manuel de révision précise ; bun run test:e2e:remote avec origines cohérentes. Sondes SSR/Convex, bilan internal via CLI, compte rendu daté avec preuve méthode indisponible identifiée locale. Ne jamais publier un secret ou des comptes de recette.


### Vérification et livraison finales — 9 octobre 2026

- Correction de revue appliquée et vérifiée : surveillance avant toute saisie, contrat réseau fermé ; check 162 fichiers sans diagnostic, typecheck sortie 0, unit 412/412 à nouveau. E2E locaux 25/25 et build post-E2E sortie 0. Aucun test supprimé ou attente assouplie ; aucune dette différée.
- Backend dev dédié synchronisé à 15:00:34 UTC avec --codegen disable pour conserver les bindings versionnés déjà typés ; indexes et composants rateLimiter installés. Configuration privée .env.local ignorée ne contient que sélection dev et URL publiques ; secret Better Auth ni lu ni modifié.
- Révision applicative livrée c232f4fd3f16ab325d8ee9f70dc8b3f9db600d17, Render dep-db4g3bbl550s73bkth7g live à 15:03:29.566014 UTC. Push de branche dédiée nécessaire pour déployer cette révision immuable ; aucune fusion main ni ouverture publique. Aucune ressource payante créée.
- Recette HTTPS réelle : 10/10 scénarios, sortie 0, 34,7 s ; comptes synthétiques auth créés par les suites, traces/captures désactivées. Sondes SSR/Convex OK, 10 assets HTTP200. Bilan interne 0 avant / 2 après, dates asOf fixées consignées dans la recette ; replay dédupliqué, conflit409, lecture internal refusée via API publique.
- Audit matrice : référence/édition/retour/confidentialité et collecte réelle couverts par premier scénario remote ; invalidité/exclusion par second ; panne503 et quatre essais pour deux intentions par troisième ; opérations privées et bilan internal par quatrième. Tous exécutés et réussis. Méthode indisponible : tests purs disponibilité prioritaire et transitions dans calculator.test.ts, exécutés parmi les 412 tests ; preuve explicitement locale. Bilan d’exploitation lu via CLI autorisée, comptes uniquement.
- Preuves et procédure complète : app/docs/recette-calculateur-livraison.md. Le commit documentaire final complète les preuves sans changer le code applicatif de la révision live ; aucun redéploiement nécessaire pour des documents seulement.

- Journaux contrôlés sans afficher les corps : 4 entrées Render après publication, 100 événements Convex ; aucun marqueur profil/e-mail/JWT/assignation credential détecté. Échantillons seulement, pas garantie générale. Flux Convex arrêté après six secondes ; aucun log brut versionné.

- Clôture workflow : statut built, critères satisfaits et revue finale sans constat ; le fichier tickets.toml n’est pas modifié conformément au workflow Build. Documents de recette complétés après livraison, aucun changement applicatif post-recette.
