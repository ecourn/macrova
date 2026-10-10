# Revue indépendante de ee2fac3 — 10 octobre 2026

Révision examinée : `ee2fac3147f5f329d15df77879aaca4bdb86ec46`, parent `afa792bc8b9852dbbb85535aef9348b1d8616129`. Les six fichiers du commit ont été lus intégralement et confrontés au dépôt courant. Le rapport d’audit initial est un ensemble d’affirmations à vérifier, pas une preuve indépendante. Le fichier non suivi `macrova-review.patch`, présent avant la revue, a été préservé.

La revue applique bmad-review : lentilles adversariale, cas limites et structure documentaire indépendantes, puis analyse des lacunes de vérification. La lentille prose n’est pas applicable à cette mission de vérification technique, qui ne demande pas une réécriture stylistique. Les constats sont classés par gravité à la demande explicite de l’utilisateur. Aucun défaut n’a été inventé pour satisfaire le quota de dix suggestions de la lentille adversariale.

## Constats et corrections

### Moyen — ambiguïté de conservation d’une primitive personnalisée

- **Preuve :** `conventions-bibliotheques.md:13` permettait de conserver une « Primitive déjà adaptée sans gain à complexifier ». `AGENTS.md:8` impose de remplacer une primitive personnalisée ayant un équivalent shadcn. Les lentilles adversariale et cas limites ont identifié indépendamment la même ambiguïté.
- **Conséquence :** un futur agent pourrait invoquer les conventions pour conserver une primitive parallèle ; leur chargement comme faits persistants transmettrait aussi l’ambiguïté à une actualisation BMAD.
- **Correction minimale appliquée :** limiter la conservation au composant shadcn adapté ou à la primitive sans équivalent ; rappeler explicitement le remplacement prescrit par la règle racine. Aucun composant ni comportement métier modifié.
- **Validation :** concordance avec AGENTS, DESIGN et EXPERIENCE, résolution BMAD et seconde revue indépendante du diff corrigé, sans nouveau constat.

### Faible — règle shadcn partiellement reformulée dans les faits persistants

- **Preuve :** `_bmad/custom/bmad-project-context.toml:8` demandait seulement de vérifier les équivalents avant modification ; la règle racine couvre aussi la création et impose le remplacement. Le bloc AGENTS courant conserve bien la règle complète : aucune perte effective dans ce bloc n’est prétendue.
- **Conséquence :** une synthèse fondée sur cette reformulation pourrait réduire la prescription, malgré les autres sources et le registre de conservation.
- **Correction minimale appliquée :** reprendre dans le fait persistant création, modification, remplacement, composition, variantes, logique métier et accessibilité. Ne pas réécrire le bloc racine ni les règles enfant.
- **Validation :** résolution effective après correction, sept tests du résolveur et répétition contrôlée de composition décrite ci-dessous.

### Faible — consommateurs transitifs attribués à la mauvaise version directe

- **Preuve :** l’inventaire associe shadcn/registry aux versions directes cn 0.4.0 et Zod 4.6.5, et solid-js à seroval 1.6.8. Les tuples imbriqués de `app/bun.lock:1373`, `:1377`, `:1455`, `:1457` et `:1459` résolvent respectivement cn 0.2.6, Zod 3.25.76 et seroval 1.5.6 pour ces consommateurs. Le contrôle indépendant des 49 lignes a trouvé cet écart après les premières corrections.
- **Conséquence :** confusion entre famille de paquets et version effectivement utilisée ; justification transitive trompeuse d’une déclaration directe.
- **Correction minimale appliquée :** distinguer les versions imbriquées dans ces trois lignes et la synthèse Zod. Les imports UI de cn, le transport RPC utilisant seroval et les consommateurs Better Auth de Zod justifient déjà leur conservation.
- **Validation :** lecture des tuples racine et imbriqués, revue indépendante des usages suivis, puis nouvelle revue des corrections. Aucun changement de dépendance.

### Faible — traduction 404 sans protection automatisée du résultat observable

- **Preuve :** le seul changement runtime est le littéral de `app/src/routes/__root.tsx:50`. La recherche des symboles `404`, `introuvable` et `notFound` dans `app/tests` et `app/src`, puis la lecture de `public.spec.ts` et du test du handler Nitro, ne montrent aucune assertion existante du texte de cette page. Le curl historique vérifie ponctuellement le SSR ; le test Nitro vérifie la transmission du statut, pas cette page.
- **Conséquence :** le retour au texte anglais ou une 404 répondant 200 pourrait passer les vérifications précédentes.
- **Correction minimale appliquée :** ajouter un E2E public avec JavaScript désactivé qui vérifie statut 404, titre et message français réellement visibles, et ferme son contexte dans `finally`.
- **Validation :** Biome et TypeScript après ajout ; E2E standard et compilé consignés ci-dessous. Aucun timeout ni assertion existante modifié.

### Faible — hiérarchie de titres incorrecte dans le rapport initial

- **Preuve :** deux titres `##` étaient immédiatement suivis de titres `#`, créant trois titres principaux et deux sections sans contenu.
- **Conséquence :** navigation et table des matières ambiguës ; aucun impact applicatif.
- **Correction minimale appliquée :** fusionner chaque paire en un titre `##`, sans retirer une preuve ni réécrire les résultats historiques.
- **Validation :** contrôle de tous les titres et `git diff --check`. Les suggestions de déplacement du bilan et de la légende ont été conservées comme recommandations éditoriales facultatives ; elles ne justifient pas un réordonnancement du rapport historique.

### Moyen — recette isolée toujours non fiable, origine exacte non établie

- **Preuve historique revérifiée :** les cinq traces ZIP des deux recettes citées dans l’audit contiennent respectivement 11, 7, 9, 6 et 6 erreurs réseau `net::ERR_INSUFFICIENT_RESOURCES`. Les échecs concernent calculateur et catalogue, avant chargement ou montage du client.
- **Preuve actuelle :** `bun run verify:calculator` sort 1 pendant le global setup, sur `Failed to fetch dynamically imported module: http://localhost:3001/node_modules/@tanstack/react-start/dist/plugin/default-entry/client.tsx`. Aucune des assertions des tests n’est alors exécutée ; le build de cette recette ne démarre pas. Journal privé : `/tmp/macrova-calculator.JoBtdCFL/recipe.log`.
- **Diagnostic supplémentaire :** copie temporaire, journalisation de `requestfailed` ajoutée seulement dans la copie, même délai et mêmes assertions de préparation, mais un seul serveur. Préparation et deux tests publics passent, sans erreur réseau relevée. Cette réduction de charge ne reproduit pas le défaut et ne valide pas la recette complète.
- **Conséquence :** la recette complète peut empêcher une livraison locale malgré les vérifications unitaires et compilées réussies. Les échecs ne démontrent aucun défaut métier ; ils ne permettent pas non plus d’attribuer avec certitude toute la panne au seul matériel plutôt qu’au harness Vite/Chromium.
- **Décision :** conserver les assertions, délais et configuration de prébundle. Le plugin Start installé exclut explicitement Router et ses devtools de l’optimisation ; aucun contournement arbitraire introduit.
- **Validation restante :** reproduire la recette intégrale avec ressources et versions mesurées dans un environnement propre, capturer les requêtes échouées dès la préparation, comparer à Vite standard et au build. Une correction du harness exigerait ensuite une reproduction et une recette complète réussie ; cette revue ne déclare pas la recette verte.

## Cohérence des six fichiers et décisions de non-modification

- `AGENTS.md` : provenance explicitement rattachée au parent avant audit, nouveaux déclencheurs valides, règles anciennes conservées. Fichier inchangé pendant cette revue.
- Conventions : décisions conditionnelles et bénéfice exigé, API installée à vérifier, distinction entre dépendance et fonctionnalité livrée. Form/Zod/Table/nuqs ne deviennent pas obligatoires. L’obligation shadcn spécifique reste applicable ; elle n’impose pas une migration des bibliothèques métier.
- Audit : les 49 entrées correspondent aux 33 dépendances production et 16 développement ; leurs versions ont été comparées au verrou. Installation frozen sans changement. Usages CSS, outils, types et primitives indirectes distingués des routes actives. Les résultats anciens restent datés et ne remplacent pas les exécutions actuelles.
- Plan : périmètre, critères et limites cohérents avec les six fichiers. Ses étapes historiques ne sont pas présentées comme une nouvelle exécution de cette revue.
- Personnalisation : override équipe, tableaux de faits et sources effectivement fusionnés ; pas de modification des defaults installés. Tous les chemins `file:` résolus existent et ont été chargés.
- `__root.tsx` : changement limité au texte 404 ; aucun changement du provider auth, de ses matches, du contexte, du token ou de la garde SSR. La page SSR française est désormais vérifiée automatiquement.

L’architecture distingue sa cible de sa photographie datée. Par exemple, son cache OFF cible ne signifie pas que la recherche actuelle possède un cache durable ; les documents des stories 3.2/3.3 et le README décrivent explicitement l’état livré. Les nouvelles conventions ne changent ni propriétaires métier, ni contrats, ni persistance. Les gardes backend restent distinctes des gardes SSR.

Aucune suppression de dépendance, modification du manifeste/verrou, migration Form/Zod/Table/nuqs, optimisation JWT/polices ou réimplémentation n’est justifiée. Les règles `app/AGENTS.md`, les protections SSR/POST, Better Auth et les autorisations Convex sont préservées. Aucun secret ni backend externe modifié ; aucun déploiement, compte ou appel d’authentification réelle créé.

## Répétition BMAD sans réécriture des règles

Le mécanisme est conversationnel, pas un générateur déterministe. Son skill installé, son template, ses critères et le résolveur ont été lus. L’override corrigé charge `app/AGENTS.md`, les conventions et les deux sources UX. Les sept tests de `test_resolve_customization.py` passent avant et après correction.

Un agent indépendant a composé `/tmp/macrova-final-review/AGENTS.candidate.md` et un registre `/tmp/macrova-final-review/bmad-ledger.md`, sans écrire les règles du dépôt. Le registre conserve les 16 lignes d’instructions racine et les neuf prescriptions/informations enfant. La comparaison automatique confirme que le candidat diffère uniquement par sa ligne de provenance. Le fichier enfant reste identique à HEAD, derrière le déclencheur racine obligatoire.

Cet exercice vérifie ce candidat et le chargement des sources ; il ne simule pas tous les échanges du workflow interactif, ne teste pas une écriture réelle dans AGENTS et ne garantit pas les futures synthèses LLM. Toute actualisation doit encore contrôler son registre et son candidat. Aucun mécanisme nouveau de régénération ni test de présence de phrases dans les règles n’a été introduit.

## Vérifications exécutées

Journaux complémentaires privés : `/tmp/macrova-final-review/`. Commandes applicatives exécutées depuis `app/`, modes locaux sans configuration d’authentification réelle.

- `bun install --frozen-lockfile` : sortie 0, 626 installations vérifiées sur 705 paquets, aucun changement.
- `bun run check` : sortie 0, 181 fichiers, zéro erreur et zéro avertissement. Après ajout du test, un diagnostic de formatage a été corrigé ; la nouvelle exécution sort 0 sans suppression de règle.
- `bun run typecheck` : sortie 0 avant et après ajout du test.
- `bun run test` : 29 fichiers, 561 tests réussis ; fixtures locales, aucune identité distante démontrée.
- `bun run build` : sortie 0 ; avertissements `MODULE_LEVEL_DIRECTIVE` dans les dépendances, notamment Router et Base UI. Aucune suppression ; build réussi ne signifie pas build sans avertissement.
- `bun run verify:calculator` : sortie 1, échec de préparation détaillé ci-dessus ; zéro test de la suite exécuté et build de recette non exécuté.
- `E2E_COMPILED=1 bun run test:e2e` avec variables de modes auth/remote retirées : sortie 0, 25/25 tests existants réussis, dont les trois tests du backend synthétique indisponible. Exécution antérieure à l’ajout du test 404.
- Diagnostic temporaire à un serveur : sortie 0, préparation et 2/2 tests publics existants réussis. Ce n’est pas la recette complète.
- Première tentative E2E Vite ciblée : sortie 1 avant tests, erreur d’écriture `-122`. La préparation diagnostique avait saturé le quota disque lors de la copie des dépendances (`Disk quota exceeded`). Seules les copies de dépendances créées par cette revue ont été nettoyées ; cet échec environnemental est distinct des erreurs réseau Chromium historiques.
- `bun run test:e2e -- tests/e2e/catalogue.spec.ts tests/e2e/public.spec.ts --project chromium` en mode Vite standard après nettoyage : sortie 0, 16/16 tests réussis (13 catalogue, 3 publics), nouveau test 404 inclus.
- `E2E_COMPILED=1 bun run test:e2e -- tests/e2e/public.spec.ts --project chromium` avec variables de modes auth/remote retirées : sortie 0, 3/3 tests publics réussis en 6,9 s, dont la nouvelle 404 sans JavaScript.
- Résolution BMAD et `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s _bmad/scripts/tests -p test_resolve_customization.py` : sortie 0, 7/7 tests ; sources existantes et conservation du candidat contrôlées.
- Comparaison automatisée des versions : première tentative lancée depuis le mauvais répertoire, `FileNotFoundError`; corrigée et exécutée depuis la racine, 49 entrées, aucune divergence. Aucun résultat de cette première tentative utilisé comme preuve.
- `git diff --check` : sortie 0 ; manifeste, verrou et deux AGENTS inchangés.

Les cinq indicateurs de prérequis auth réelle sont faux : déploiement dev, URL cloud, URL site, email et mot de passe de test. `test:e2e:auth` et `test:e2e:remote` non exécutés. Cookies externes, expiration/révocation distante, parcours complet authentifié et OFF vivant restent à vérifier sur un environnement autorisé. Les tests synthétiques ne valident ni identité réelle ni service externe.

## Revue après correction et diff final

Deux nouvelles passes adversariales indépendantes sur les corrections documentaires puis sur le diff incluant le test 404 ne trouvent aucun nouveau défaut vérifiable. La revue des cas limites initiale converge sur l’ambiguïté shadcn corrigée. La lacune de vérification de la 404 est fermée par une assertion du résultat observable, sans mock du composant racine.

Le contrôle indépendant ultérieur des 49 entrées a trouvé les trois preuves transitives imprécises, corrigées puis revérifiées. Sa dernière passe sur le diff complet et le rapport ne relève qu’un résultat compilé encore annoncé comme à consigner ; ce résultat est maintenant renseigné ci-dessus. Aucun autre défaut vérifiable n’est laissé dans le diff. La recette isolée reste explicitement en échec, avec son diagnostic et ses limites.

Diff complémentaire : une ligne de conventions clarifiée ; un fait persistant complété ; deux paires de titres fusionnées, trois preuves transitives corrigées, synthèse Zod précisée et renvoi vers cette revue dans l’audit ; un test E2E public ajouté ; ce rapport de preuves. Aucune logique applicative modifiée pendant cette revue. Aucun commit, push ou publication effectué.

Conclusion : aucun défaut runtime du commit démontré ; règles désormais cohérentes et conservation BMAD vérifiée dans l’exercice contrôlé. La vérification locale distingue les suites réussies de la recette isolée en échec. L’authentification et les services externes nécessitent toujours leur environnement réel ; aucune validation externe ni fiabilité complète du harness n’est revendiquée.

## Constats canoniques des lentilles

Les recoupements sont conservés : adversariale et cas limites identifient le même défaut. Les recommandations éditoriales de déplacement sont facultatives et n’ont pas été appliquées. Les champs ci-dessous décrivent les constats avant correction ; leur traitement et leur gravité figurent plus haut.

```json
[
  {
    "lens": "adversarial",
    "location": "conventions-bibliotheques.md:13",
    "trigger_condition": "Une primitive adaptée possède un équivalent shadcn local, mais la clause autorise sa conservation.",
    "guard_snippet": "Réserver la conservation aux composants shadcn adaptés ou aux primitives sans équivalent ; rappeler le remplacement obligatoire.",
    "potential_consequence": "Une future implémentation peut contourner la règle racine, y compris après actualisation BMAD."
  },
  {
    "lens": "edge-case-hunter",
    "location": "conventions-bibliotheques.md:13",
    "trigger_condition": "Une primitive personnalisée adaptée possède déjà un équivalent shadcn local.",
    "guard_snippet": "Remplacer les primitives personnalisées ayant un équivalent shadcn local conformément à AGENTS.md.",
    "potential_consequence": "La clause de conservation peut contourner le remplacement obligatoire prescrit dans AGENTS.md."
  },
  {
    "lens": "adversarial",
    "location": "_bmad/custom/bmad-project-context.toml:8",
    "trigger_condition": "Le fait persistant réduit la prescription shadcn à la vérification avant modification.",
    "guard_snippet": "Conserver création, modification, remplacement, composition, variantes, logique métier et accessibilité.",
    "potential_consequence": "Une synthèse future peut réduire la prescription malgré le bloc courant correct."
  },
  {
    "lens": "adversarial",
    "location": "audit-dependances-parcours-regles.md:48,60,64",
    "trigger_condition": "Les consommateurs de versions imbriquées sont associés aux versions directes de cn, seroval et Zod.",
    "guard_snippet": "Distinguer cn 0.2.6, seroval 1.5.6 et Zod 3.25.76 des versions directes auditées.",
    "potential_consequence": "L’inventaire confond présence d’une famille de paquets et consommation de sa version directe."
  },
  {
    "lens": "verification-gap",
    "location": "app/src/routes/__root.tsx:50",
    "trigger_condition": "Le texte français et le statut de la page 404 ne sont pas protégés par un test de cette page.",
    "guard_snippet": "Naviguer sans JavaScript vers une URL inconnue et vérifier statut 404, titre et texte français visibles.",
    "potential_consequence": "Le texte anglais ou un statut 200 pourrait revenir sans faire échouer les tests lus.",
    "gap_shape": "regression-gap",
    "consumer": "Page inconnue rendue par le composant notFound de la route racine.",
    "evidence": "Recherche 404/introuvable/notFound dans app/tests et app/src ; public.spec.ts couvre seulement accueil et garde privée, nitro-error-handler.test.ts transmet le statut sans rendre cette page."
  },
  {
    "lens": "structure",
    "location": "audit-dependances-parcours-regles.md — titres inventaire et authentification",
    "trigger_condition": "Deux sections de niveau 2 sans contenu précèdent deux nouveaux titres principaux.",
    "guard_snippet": "MERGE : fusionner chaque paire en un titre de niveau 2 ; réduction de 9 mots.",
    "potential_consequence": "Hiérarchie et navigation documentaire ambiguës."
  },
  {
    "lens": "structure",
    "location": "audit-dependances-parcours-regles.md — résumé du diff et risques résiduels",
    "trigger_condition": "Les limites essentielles apparaissent après l’inventaire et les résultats détaillés.",
    "guard_snippet": "MOVE facultatif : placer les 368 mots du bilan après l’introduction, sans réduction de contenu.",
    "potential_consequence": "Le lecteur découvre tardivement la recette en échec et l’absence de preuve d’identité réelle."
  },
  {
    "lens": "structure",
    "location": "audit-dependances-parcours-regles.md — interprétation des statuts",
    "trigger_condition": "La légende des statuts arrive après le tableau des dépendances.",
    "guard_snippet": "MOVE facultatif : placer les 161 mots de légende avant le tableau, sans réduction de contenu.",
    "potential_consequence": "Une première lecture peut confondre primitive disponible et fonctionnalité active."
  }
]
```
