---
epic: epic-calculateur
date: 2026-10-09T15:24:36.395451+00:00
verdict: accepted-with-open-items
criteria: declared
headless: true
---

# Rétrospective — cible estimative publique

## Epic summary

Épic examiné : `epic-calculateur`, capacité CAP-1 et exigences locales CAL-1 à CAL-8. Révision du dépôt : `ced59c77c9fdb8c06e7137ad1711d0b4bf1055b8`. Les huit stories sont `done/done`, aucun ticket encore `built`, `pending_tickets = []`. Le statut de l’épic reste `in-progress` : cette rétrospective ne clôture pas le board.

Les huit commandes `find` confirment un plan par ticket et `story_file=null` pour tous. Les descriptions, vérifications et couvertures sont dans [tickets.toml](tickets.toml), les six critères déclarés dans [epic-calculateur.md](epic-calculateur.md#done-when). Les Requirements de l’initiative renvoient à la spécification CAP-1 ; CAL-1 à CAL-8 résident dans l’épic.

### Plages Git et attribution

| Story | Statut / état | Plage issue des baselines |
| --- | --- | --- |
| 2.1 | done / done | `b44758a9b3dcc4c60a3fe73b85e63568b8b4d057..20eacb2b858a48eb4ac424663bf0d167df21f65a` |
| 2.2 | done / done | `20eacb2b858a48eb4ac424663bf0d167df21f65a..6bbca37f9dd24818f6b1ee45a558decee8a8651b` |
| 2.3 | done / done | `6bbca37f9dd24818f6b1ee45a558decee8a8651b..f521489e378e7cd021715e0a41c257af5eaa70a2` |
| 2.4 | done / done | `f521489e378e7cd021715e0a41c257af5eaa70a2..17e607f7f625fcb792370d6bde46303d87c615b2` |
| 2.5 | done / done | `17e607f7f625fcb792370d6bde46303d87c615b2..99cfb4baa610452103f77bfd2770b761c05cf8a1` |
| 2.6 | done / done | `99cfb4baa610452103f77bfd2770b761c05cf8a1..a423b2372d52907ccaf6eee5d0435380aa9e9f57` |
| 2.7 | done / done | `a423b2372d52907ccaf6eee5d0435380aa9e9f57..736e43365efa1318ee07b7b044f1201846b5f903` |
| 2.8 | done / done | `736e43365efa1318ee07b7b044f1201846b5f903..ced59c77c9fdb8c06e7137ad1711d0b4bf1055b8` |

Chaque baseline est présente et ancêtre de HEAD ; leur ordre d’ascendance correspond à l’ordre des tickets. Dernière borne inférée : HEAD, commit `ced59c7`, clôture documentaire de 2.8. Aucun travail ultérieur étranger n’est inclus après cette clôture. `git_evidence.py` exécuté une fois par plage : 41 commits distincts, 12 merges dont 8 mesurés sur les spines de premier parent. Les quatre merges non mesurés sont dans la plage 2.1 ; la volumétrie est donc limitée, pas exhaustive. Aucun churn binaire signalé dans les fichiers classés. Les sommes `files` ne contiennent que les commits non-merge ; `merge_files` a été lu séparément, sans addition ni double comptage.

La plage 2.1 comprend aussi des documents de l’enquête et la correction transversale de gouvernance (`205f47c`, `9985ffa`, `b1d065d`). Leur présence ne les attribue pas au calculateur. Le diff `app/` sur cette plage est vide : la décision de méthode précède bien le code de calcul de 2.2. Le diff applicatif global a été préparé dans `/tmp/macrova-retro-calculateur.diff` ; les extractions Git temporaires ne sont pas des dépendances durables de ce rapport.

### Inventaire et limites des preuves

- Lus : épic, initiative, huit entrées de tickets et huit plans ; leurs sections intent, matrice, triage et vérification ; dossier [méthode v1](methode-estimative-v1/methode-estimative-v1.md), décision, validation et vecteurs ; spécification et ses compagnons ; architecture, DESIGN et EXPERIENCE ; code et tests des frontières calculateur/SSR/collecte.
- Preuves de livraison : [recette isolée](../../../app/docs/recette-calculateur-livraison.md#preuves-datées--9-octobre-2026), révision `c232f4fd3f16ab325d8ee9f70dc8b3f9db600d17`, déploiement `dep-db4g3bbl550s73bkth7g`, recette HTTPS 10/10, bilan 0→2 et dix assets HTTP200, consignés le 9 octobre. Ces résultats historiques sont lus, sans prétendre avoir réinterrogé Render ou relancé la recette cloud pendant cette rétrospective.
- Reproductibilité locale : sources et suites disponibles ; les nouveaux résultats sont dans Behavior verification. Les documents de recette fournissent commandes et limites. `git diff c232f4f HEAD -- app/src app/convex app/playwright.config.ts` est vide : les commits après publication n’altèrent pas ces surfaces applicatives.
- Journaux complets de conversation non disponibles. Les plans et walkthroughs sont des comptes rendus, pas des journaux complets ; analyse de causes de processus et d’intentions abandonnées non effectuée. Les enseignements ci-dessous se limitent aux échecs et décisions explicitement consignés.
- Pas de PRD supplémentaire identifiée dans l’initiative ; la spécification est le contrat. Le navigateur T3 a déclaré explicitement aucun host à `preview_status` puis `preview_open` ; repli Chromium local utilisé.

## Findings

### Vues agrégées

**Architecture — frontières conservées (accept as-is).** Analyse déterministe des imports directs du domaine actuel : tous les imports sont locaux, aucun React/Convex/réseau, aucun cycle dans ce sous-graphe. Nouveau moteur `calculator.ts` dépend seulement de `decimal.ts` ; le router crée la session par instance, pas de store serveur global. La collecte est un adaptateur facultatif distinct, invoqué seulement après succès explicite. Sources : `app/src/domain/calculator.ts:1`, `app/src/router.tsx:6`, `app/src/lib/calculator-measurement.ts:5`, `app/src/routes/calculateur.tsx:110`, AD-1/AD-2 de l’architecture. Le graphe des dépendances tierces n’est pas analysé exhaustivement.

**Taille et duplication — extraction utile, aucune god-class établie (accept as-is).** Classement non-merge : route 442 ajouts/49 suppressions, 393 lignes actuelles ; domaine 440/3, 437 lignes ; éditeur 391/47, 344 lignes. Le domaine regroupe gardes et transitions d’une seule session ; route et éditeur composent deux parties du parcours. Les plus gros ajouts sont des vecteurs et tests : JSON 1225/2, E2E 794/0, tests domaine 584/2. Le nombre de lignes seul ne constitue pas une dette. Le nettoyage `06beb7d` a extrait ordre/libellés/unités vers `calculator-presentation.ts` et mutualisé la synchronisation mémoire ; consommateurs relus, aucun moteur de calcul concurrent identifié. Comparaison ciblée des responsabilités, sans détecteur exhaustif de clones. Sources : plan 2.7, section Intent ; `app/src/lib/calculator-presentation.ts:1`, route et éditeur.

**Conventions — composition cohérente (accept as-is).** Les champs, erreurs, boutons et sélecteurs utilisent `@/components/ui`. Le domaine réutilise normalisation française, rationnels et affichage communs ; les intermédiaires signés sont explicites. L’isolation auth s’appuie sur pathname normalisé et matches rendus, avec tests du vrai router pour slash final et transition suspendue. Sources : route, éditeur ; `app/src/lib/public-auth-boundary.ts:3`, `app/tests/config/public-auth-boundary.test.ts:95`. Aucun écart établi dans ces surfaces ; pas d’audit exhaustif de toutes les primitives du dépôt.

**Réconciliation du contrat — changement de gouvernance explicite (accept as-is).** L’exigence historique de signature externe a été remplacée, sous mandat, par adoption produit sourcée le 8 octobre. Ce remplacement est visible dans les contrats parents, le début de validation.md et le plan 2.1 ; les paragraphes contradictoires anciens sont explicitement historiques. Aucune signature ni validation clinique inventée. Sources : commit `b1d065d`, `methode-estimative-v1/decision-responsable.md:1`, `validation.md:1`, plan 2.1 section Contrat courant renégocié.

**Écart de recette accepté — méthode indisponible vérifiée localement (accept as-is, avec F1).** Le verify initial de 2.8 mentionne ce cas sur HTTPS ; le plan approuvé et la recette explicitent que l’injection de méthode reste locale, sans fixture de production. Le domaine refuse absence/retrait/version différente et la route masque les résultats dans ces états. Cette portée locale est une déviation documentée acceptable pour la livraison isolée, pas une preuve cloud de retrait. Sources : plan 2.8, Boundaries et matrice ; recette livraison, Validation locale ; F1 ci-dessous identifie la preuve UI manquante.

### Revues du diff et constats consolidés

`bmad-review` appliqué au diff applicatif de l’épic : trois lentilles indépendantes déléguées, puis chaque rapport vérifié contre les sources primaires. Edge-case-hunter : `[]`, aucun chemin manquant établi dans son périmètre. Adversarial : deux constats candidats ; l’un exige une correction de son exemple avant confirmation. Verification-gap : une lacune confirmée. Aucune liste artificielle de dix défauts n’est fabriquée pour remplir le quota adversarial. Les trois constats suivants conservent leur provenance ; ils sont non bloquants pour les parcours actuellement livrés.

**F1 — Le rendu de méthode indisponible n’a pas de test consommateur (verification-gap).**

- Source : `app/src/routes/calculateur.tsx:118` sélectionne le refus plutôt que `session.outcome` ; `:124` et `:382` conditionnent résultat et éditeur. Tests domaine `calculator.test.ts:49` et `:506` protègent calcul et transitions, pas le rendu React.
- Vérification : recherches `calculatorMethod`, `isCalculatorMethodAvailable`, `METHODE_INDISPONIBLE`, imports de `routes/calculateur` dans tests et domaine ; lecture de calculator.spec.ts, calculator-failure.spec.ts, calculator-remote.spec.ts et public-auth-boundary.test.ts. Aucun scénario trouvé rendant une méthode indisponible avec une session portant un ancien résultat.
- Démonstration de lacune : remplacer la sélection conditionnelle du rendu par `session.outcome` pourrait afficher estimation et éditeur malgré un retrait, tandis que les tests purs continueraient de réussir. Ce n’est pas un défaut actuel du rendu : sa garde est présente.
- Instance : **fix now**, action R1 de vérification proposée. Prévention : vérifier le refus à la frontière consommateur, pas seulement dans les fonctions du domaine.

**F2 — eventId public accepte du texte métier (adversarial, durcissement).**

- Sources : `app/convex/http.ts:54`, `calculatorMeasurements.ts:26` puis insertion ; `app/src/domain/events.ts:36`, `app/src/domain/commands.ts:27` autorisent un identifiant de 1–256 caractères alphanumériques et `_.:-`. Test `calculatorMeasurements.test.ts:66` refuse notamment les champs de profil et un e-mail, mais pas un texte métier autorisé par cet alphabet.
- Reproduction locale pure : `validatePublicEvent({version:1,eventId:"age:30.taille:175.poids:70",occurredAt:Date.now(),type:"calculator_completed"}).ok` retourne true. Par lecture de collect, une enveloppe récente ainsi validée peut être insérée ; aucun profil synthétique n’a été envoyé au cloud pour reproduire cela.
- Portée : le client livré utilise `crypto.randomUUID()` et ne construit aucun identifiant depuis le profil (`calculator-measurement.ts:13`). Le contrat partagé existant autorise un identifiant générique ; aucun format UUID obligatoire n’est déclaré. Pas de fuite de profil observée depuis l’application. Un format UUID réduit la surface de saisie accidentelle, sans prouver l’absence de canaux détournés ou l’honnêteté d’un client hostile.
- Instance : **defer**, action R2 avant ouverture publique : proposer le durcissement du seul collecteur calculateur, compatible avec les UUID déjà émis ; préserver les identifiants privés déterministes. Prévention : définir ensemble la sémantique et la grammaire des champs anonymes.

**F3 — Le validateur de cible ne vérifie pas la somme énergétique (adversarial, contrat du domaine).**

- Source : `app/src/domain/calculator.ts:241`, `validateCalculatorTarget` vérifie positivité, ratios et minimum protéique, sans comparer `4P+4G+9L` à E.
- Rapport candidat corrigé : E=2000/P=75/G=200/L=90 est refusé, lipides à 40,5 %. Cet exemple n’est donc pas une preuve. Reproduction indépendante valide : E=2000/P=75/G=200/L=80, poids=70 retourne null ; énergie des macros=1820 et ratios=15/40/36 %, tous admis séparément.
- Portée : les appels du calcul et des modifications construisent la somme exacte par leurs formules ; aucun chemin UI actuel produisant cette incohérence n’a été identifié. Les vecteurs et tests des transitions vérifient déjà leurs résultats. Le défaut concerne la force du validateur exporté pour un futur consommateur, pas une cible incorrecte observée dans le parcours livré.
- Instance : **defer**, action R3 avant réutilisation du validateur avec une cible externe. Prévention : rendre explicites les invariants garantis par un constructeur et ceux garantis par un validateur.

### Limites et enseignements sourcés

**F4 — Recette audio et clavier virtuel réel non réalisée (defer).** Les preuves DOM/clavier, reflow 320 px, texte ×2 et zoom réel sont consignées, mais lecteur d’écran avec restitution audio et clavier mobile réel restent absents. Source : `app/docs/recette-calculateur-accessibilite.md:73`. R4 ferme cette limite ; aucune certification WCAG déduite des tests ou d’axe.

**F5 — Vérifications sensibles aux serveurs/caches partagés (fix now pour le processus).** Plans 2.5, Verification finale, 2.6 Implementation Notes, 2.7 Vérifications intermédiaires et 2.8 Implementation Notes consignent plusieurs échecs de chargement Vite puis relances réussies ; 2.8 mentionne encore un build concurrent des E2E malgré la prévention déjà écrite en 2.7. Les échecs consignés ne prouvent pas un bug produit ni une cause générale ; ils justifient R5, isolation reproductible des processus de vérification. Pendant l’exploration présente, le serveur local 3018 est devenu indisponible, constaté par curl=000 ; cause non déterminée, redémarrage réussi. Aucun échec produit n’en est déduit.

## Behavior verification

### Exécuté pendant cette rétrospective

Depuis `app/` le 9 octobre 2026 :

- `bun run test` : **412/412**, 23 fichiers, sortie 0.
- `bun run test:e2e` : **25/25**, sortie 0. Vrai Chromium sur application locale : références FR, six invalidations, refus/correction, édition exacte, retour historique, clavier, reflow/texte ×2, panne SSR configurée, collecte simulée, timeout et hors ligne. Ce mode neutralise Convex réel ; aucune preuve d’auth cloud ne lui est attribuée.
- `bun run check` : **162 fichiers, zéro erreur/avertissement**, sortie 0. Aucun code applicatif modifié ; typecheck et build réussis dans 2.8 restent des preuves historiques, non relancés ici.
- Exploration complémentaire `agent-browser`, session dédiée, Vite local port 3018 sans URL Convex : profil synthétique 30/175/70/+5/PAL1,6/oui → **2638,00 / 98,93 / 296,78 / 117,24** ; prévisualisation protéines 110 puis confirmation → **2638,00 / 110,00 / 285,70 / 117,24**, état « Cible modifiée ». Après redémarrage du serveur et nouveau chargement, éligibilité non → « Aucune estimation », saisies conservées et aucun résultat.

L’exploration ne revendique pas une preuve supplémentaire du retour : le clic Accueil a rencontré le serveur arrêté ; le retour est protégé par les E2E réussis. Chromium a d’abord refusé le lancement faute de sandbox utilisable dans l’environnement ; relancé avec l’option proposée `--no-sandbox`. Aucun secret, compte réel, événement distant ni capture auth utilisé. Navigateur et serveur temporaires fermés à la fin.

### Preuves historiques distinctes

La recette HTTPS 2.8 consigne 10/10 scénarios, dont quatre calculateur et six socle/auth réelle, sur la révision c232f4f ; backend dev avant frontend, replay dédupliqué, conflit409, refus des opérations privées et du bilan public, 0→2 événements. Panne503 interceptée dans le navigateur et méthode indisponible locale restent explicitement simulées. Source : recette livraison, Preuves datées. Aucune recette cloud nouvelle, purge réelle à 30 jours, lecteur d’écran audio ou clavier virtuel réel annoncé par cette rétrospective.

## Previous-retro follow-through

L’ordre `status initiative-macrova` est socle, enquête, calculateur. L’épic immédiatement précédent est donc **epic-enquete**, dont aucune rétrospective n’existe ; aucun suivi de fichier précédent possible. L’enquête n’est pas finie : elle n’est pas assimilée à un épic accepté. Pour conserver les engagements utiles du socle partagé, la rétrospective du socle a aussi été lue ; ses actions courantes sont suivies ci-dessous, sans les compter comme nouvelles actions du calculateur.

| Action antérieure, propriétaire proposé | État constaté et preuve |
| --- | --- |
| A1 — sanitiser HTTP5xx auth ; agent socle auth/SSR | Réalisée : `auth-server.ts:64`, `:73` et tests auth-server ; commit historique `6aaa299`, recette de publication dans rétro socle. |
| A2 — refuser JWT vide/blanc ; agent socle auth/SSR | Réalisée : `auth-server.ts:35`, tests consommateur. |
| A3 — vérifier vrai consommateur query rejetée ; agent socle auth/SSR | Réalisée : `tests/config/auth-consumer.test.ts:75` et `:106`, exécutés parmi les 412 tests. |
| A6 — réconcilier supervision et test livré ; agent exploitation/architecture | Réalisée documentairement : `docs/exploitation-socle.md`, rétro socle Réexamen, commit `6aaa299` ; réception humaine séparée en A6b. Cron actuel non réinterrogé. |
| A4 — borner attente JWT transport/corps ; agent socle auth/SSR | Pas de réalisation trouvée : `auth-server.ts:26` et `:31` n’ont toujours pas de borne explicite. Maintenir le report ; calcul public désormais indépendant de cette attente. |
| A5 — prédicat UTC partagé pour capturedAt/density ; agent domaine/catalogue | Pas de réalisation trouvée : `food.ts:19`, `:33`, `:58` conservent le prédicat numérique local ; `access.ts` a le prédicat UTC. À traiter avant catalogue. |
| A7 — clarifier version de fermeture ; agent architecture/données | Pas de clarification nouvelle trouvée : `access.ts:9` reste `{closedAt:number}` ; report conservé dans deferred-work. |
| A6b — preuve de réception notification ; utilisateur/exploitation | **Aucune preuve trouvée**, pas preuve d’absence de réception. `deferred-work.md`, Réconciliation supervision, garde le suivi. Aucun canal externe contacté. |
| A8 — compter query et delta logs par abandon ; agent vérification SSR | Pas de réalisation trouvée : `tests/integration/start-abort.mjs:185` puis `:218` conservent statut500 et total global de logs. |
| A9 — libérer corps5xx rejeté ; agent socle auth/SSR | Pas de réalisation trouvée : `auth-server.ts:64` jette la réponse sans annulation explicite. |

Les responsabilités techniques sont attribuées à l’agent dans le binôme par `deferred-work.md`, Résolution de gouvernance du 8 octobre. Les six reports du socle restent ouverts et ne sont pas transformés en régressions de cet épic.

## Action items

**Cinq actions nouvelles proposées, aucune appliquée.** Responsabilités dans le binôme utilisateur/agent ; les preuves nécessitant un appareil ou une perception humaine restent à observer réellement. Les actions de remédiation et de réconciliation attendent leur exécution dans le workflow normal.

| ID | Nature / disposition | Action et preuve de clôture attendue | Responsable proposé |
| --- | --- | --- | --- |
| R1 | Vérification, fix now — F1 | Tester le rendu de `/calculateur` avec ancien résultat et méthodes absente/non adoptée/retirée/autre version : refus visible, résultat et éditeur absents, saisies conservées. Vérifier que supprimer la garde de rendu ferait échouer le test. | Agent développement/QA |
| R2 | Durcissement et réconciliation du contrat, defer — F2 | Avant ouverture publique, proposer puis appliquer une grammaire UUIDv4 au collecteur calculateur ; HTTP et mutation refusent identifiant textuel, UUID livré accepté et replay toujours dédupliqué. Préserver les événements privés. | Agent backend/contrats |
| R3 | Renforcement du domaine, defer — F3 | Avant consommation de cibles externes, vérifier exactement 4P+4G+9L=E dans le validateur ; tester 2000/75/200/80 refusé et vecteurs valides inchangés. | Agent domaine partagé |
| R4 | Recette complémentaire, defer — F4 | Avant affirmation d’accessibilité vérifiée, exercer lecteur d’écran audio et appareil mobile avec clavier virtuel : labels, erreurs, annonces, édition/confirmation, visibilité des actions et conservation des saisies. Consigner appareil/outils et observations. | Utilisateur pour observations réelles ; agent préparation et consignation |
| R5 | Processus, fix now — F5 | Formaliser l’exécution E2E puis build sans chevauchement, ports et caches propres, arrêt ciblé des seuls processus de recette. Contrôler une exécution complète sans serveur préexistant ; conserver l’échec initial si relance et sa justification, sans assouplir les assertions. | Agent vérification/exploitation |

Pas de délai estimé ni d’engagement humain inventé. R2 et R3 sont des renforcements proposés ; R1 ferme une lacune de vérification du consommateur. Les six actions du socle conservent leur propre trace, hors de ce compte de cinq.

## Acceptance verdict

**`accepted-with-open-items` — critères déclarés, verdict machine fondé sur les preuves.** Aucune acceptation humaine distincte n’est fabriquée ; la délégation permet le jugement, pas l’invention d’une preuve.

| Done when | Évaluation |
| --- | --- |
| 1 — dossier adopté avant code | Satisfait : dossier v1 et décision du 8 octobre, commit b1d065d avant baseline de 2.2 ; aucune modification app dans 2.1. |
| 2 — quatre valeurs, hypothèses, modification | Satisfait : vecteurs exacts, 412 tests, E2E et exploration référence/édition ; recette HTTPS identifiée. |
| 3 — refus et absence de résultat obsolète | Satisfait sur code et suites ; refus méthode au domaine et garde de rendu présentes. Lacune du test consommateur suivie par R1 ; pas de bug actuel établi. |
| 4 — mobile/clavier, mémoire et confidentialité | Satisfait dans le périmètre vérifié : E2E 320px/texte×2, clavier/retour, composants et contrat numérique, confidentialité ; limites audio/appareil réel explicites R4. |
| 5 — mesure minimale, retries, disponibilité | Satisfait pour client livré : UUID aléatoire sans profil, succès explicite uniquement, déduplication/retry et collecte facultative testés, preuves HTTPS. R2 durcit le client hostile/générique ; aucun transfert de profil produit observé. |
| 6 — livraison isolée et préparation conditionnelle | Satisfait par preuves datées de c232f4f/dep-db4g3bbl550s73bkth7g, backend avant frontend, recette 10/10 et procédure rollback/production conditionnelle. |

Aucun ticket incomplet ni constat bloquant actuel. Les actions ouvertes sont nommées et possédées ; les limites ne deviennent pas une acceptation de production. Le lancement public demeure dans epic-validation-lancement, conformément aux Boundaries. Les preuves cloud sont datées ; ce verdict ne promet pas que la cible restera inchangée sans nouvelle vérification après déploiement.

## Open questions

Aucune réponse utilisateur requise pour achever cette rétrospective. Arbitrages retenus : accepter la portée locale du retrait de méthode, protéger son rendu par R1 ; traiter R2 avant ouverture ; R3 avant réutilisation du validateur ; maintenir R4 sans revendiquer certification ; poursuivre les six reports du socle dans leurs zones propriétaires. Notifications humaines, observations d’accessibilité sur appareil et décisions de lancement restent des faits à établir, pas des réponses simulées.

## Assumptions

- Le dossier fourni résout explicitement epic-calculateur ; mode headless retenu puisque l’utilisateur délègue toutes les questions et décisions. Aucun tour de confirmation ni discussion collective opt-in.
- `status` sans dossier a échoué faute d’initiative active ; sortie : `no active initiative: set core.active_initiative in _bmad/custom/config.user.toml, or pass a folder`. Repli sur dossier explicite de l’initiative, sans modifier configuration ; status épic et les huit find ont réussi. `python` absent : scripts temporaires lancés avec python3.
- pending_tickets vide confirmé ; verdict machine `accepted-with-open-items`, aucune dérogation humaine inventée. Les critères sont ceux de l’épic, pas des critères profilés.
- Chaque proposition R1–R5 est décidée sous mandat de l’utilisateur : R1 ferme le rendu non vérifié, R2 réduit le texte accepté, R3 explicite la somme énergétique, R4 conserve la limite d’observation réelle, R5 répond aux échecs de vérification consignés. Elles ne sont pas exécutées par la rétrospective.
- Les anciens textes de validation externe sont historiques, pas des blocages courants ; production, terrain et conformité restent hors verdict.
- Scope des vues : imports directs du domaine et responsabilités des fichiers modifiés ; duplication ciblée ; graphe tiers et clones exhaustifs non analysés. Absence de journaux de conversation interdit toute cause organisationnelle inventée.
- Épic immédiatement précédent enquête sans rétrospective ; suivi socle ajouté explicitement pour les engagements partagés, sans confondre ordre du board et épic précédent terminé.

Phases 1, 2, 4 et 5 terminées ; phase 3 non demandée. Seul ce document est écrit dans l’arbre versionnable ; aucun statut, épic, plan, story, code ou configuration modifié. Aucun commit, push, déploiement ou activation publique effectué. Rapports de tests et preuves intermédiaires restent temporaires ou ignorés.
