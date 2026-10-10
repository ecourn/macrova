---
title: '10.2 — Éprouver le guide sur un entretien pilote réel'
type: 'chore'
ticket: 2
created: '2026-10-09'
status: 'in-progress'
baseline_revision: '34bd74a5317e944807e002084898bf497985d319'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - _bmad-output/initiative-macrova/epic-enquete/epic-enquete.md
  - _bmad-output/initiative-macrova/epic-enquete/kit-enquete-v1/cadre-protection.md
  - _bmad-output/spec-macrova/protocole-validation.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le kit adopté en 10.1 n’a pas encore été éprouvé sur un support effectif et un entretien réel. Le pilote ne peut compter parmi les quinze sans les preuves ENQ-1/2/3/6.

**Approach:** Réutiliser le kit v1 et fournir une feuille de conduite 10.2 reliant essais du support, information/contact, canal autorisé, accord volontaire, observation et extraction privée. L’utilisateur conduit les actions terrain ; l’agent contrôle les éléments accessibles et versionne les corrections justifiées par le pilote. Les arbitrages et l’approbation documentaire sont délégués ; les faits externes ne le sont pas.

Décisions : privilégier l’espace privé existant maîtrisé par l’utilisateur, puis le repli local protégé prévu par le cadre si les essais échouent ; ne retenir un canal qu’après autorisation effective. Préserver les critères bêta figés. Aucune donnée de participant, repas individuel ou correspondance dans Git ; aucune invitation externe par l’agent sans instruction explicite. Une simulation ou un contrôle sur la machine de l’agent ne prouve pas la maîtrise du support utilisateur.

Acceptation : Given un support effectivement testé, when les essais autorisé/refusé/révocation/suppression/copies et l’information finale sont vérifiés, then la collecte peut commencer avec accord volontaire. Given un adulte de la cible, distinct des autres participants, et un repas réel récent, when sa méthode habituelle est observée et canal/durée/erreurs/corrections/difficultés consignés avec leurs limites, then l’admissibilité ENQ-2 est décidée sans remplacer l’observation par une déclaration. Given une ligne alimentaire réelle, when l’extraction C → D → E est vérifiée privément, then nom/marque/état/unité sont traçables sans identifiant dans le corpus. Given le retour réel du pilote, when le guide est corrigé ou conservé avec justification, then la version et la décision de comptage sont consignées sans changer les critères bêta.

</frozen-after-approval>

## Implementation Notes

- 2026-10-09 — Résolution du ticket avec dossier explicite : aucune initiative active configurée, configuration globale conservée. Prérequis 10.1 done ; branche dédiée propre. Route oneshot : une feuille de conduite documentaire, moins de 100 lignes ; aucun changement applicatif.
- 2026-10-09 — Sources inspectées : epic, plan 10.1 et kit, spécification et compagnons, architecture AD-3/8/11, destinataires et UX. Aucun support effectif, compte de test, contact opérationnel, canal autorisé ou entretien réel établi dans ces pièces. Les capacités disponibles n’établissent aucun accès à un support utilisateur désigné. Créer un espace dans le conteneur ne résout ni sa maîtrise par l’utilisateur ni la disponibilité d’un participant.
- 2026-10-09 — Feuille de conduite créée et liée au README : ordre des essais, information, entretien, extraction, versionnement du guide et preuves de reprise. Les modèles existants sont réutilisés ; aucun guide corrigé sur la base d’un retour fictif.

## Plan Change Log

## Review Triage Log

- 2026-10-09 — Quick indépendante : high=0, medium=1, low=0, false=0, maybe-false=0. Constat medium, route patch : « adulte distinct de la cible » contredisait ENQ-2 ; correction de rédaction en « adulte de la cible, distinct des autres participants » dans l’acceptation et la liste de preuves. Aucun changement de périmètre ni travail différé.

- 2026-10-10 — Quick, `high` : essais réels du support, information/contact et canal autorisé absents. Vérifié contre la première preuve restante et le bilan de reprise ; critère préalable ENQ-1 non satisfait. Cause externe préexistante, conservée dans le travail restant de 10.2.
- 2026-10-10 — Quick, `high` : accord volontaire et entretien réel avec méthode observée absents. Vérifié contre les preuves participant/entretien et le bilan ; ENQ-2 non satisfait. Cause externe préexistante, conservée dans le travail restant de 10.2.
- 2026-10-10 — Quick, `high` : extraction réelle et contrôle privé de l'anonymisation/traçabilité absents. Vérifié contre la preuve extraction et le bilan ; ENQ-3 non satisfait. Cause externe préexistante, conservée dans le travail restant de 10.2.
- 2026-10-10 — Quick, `high` : retour réel du pilote et décision de comptage absents. Vérifié contre la dernière preuve restante et la nature documentaire de la correction ; quatrième critère non satisfait. Cause externe préexistante, conservée dans le travail restant de 10.2.

Aucun défaut supplémentaire relevé dans la correction. Aucun travail reporté vers un autre ticket : les actions terrain restent nécessaires dans 10.2. Les constats empêchent sa clôture ; le statut reste `in-progress`, sans passage automatique à `built` ni boucle de réécriture documentaire.

## Verification

Vérifier les liens locaux, relire la feuille contre le cadre et ENQ-1/2/3/6, comparer l’empreinte du protocole bêta avant/après, exécuter `git diff --check`, puis revue quick indépendante. Aucune suite applicative : seuls des documents changent.

- 2026-10-09 — 17 liens locaux contrôlés, toutes les cibles existent ; protocole bêta comparé octet par octet à HEAD, inchangé, SHA-256 `4fb431879632906a68ff9882d9c5281dfccbb0f81c989dd4d7f7ae9ffcafb5f2`. `git diff --check` réussi. Revue indépendante quick lancée sur le diff incluant les fichiers nouveaux. Ces contrôles portent sur les documents, aucun essai réel du support exécuté.

## Exécution et preuves restantes

- [ ] Support choisi et maîtrisé ; essais effectifs avec données jetables, copies et limites documentés privément.
- [ ] Information finale/contact et canal effectivement autorisé établis avant collecte.
- [ ] Adulte réel de la cible, distinct des autres participants, informé et volontaire ; accord privé obtenu.
- [ ] Entretien réel, méthode observée et champs ENQ-2 consignés dans le support privé.
- [ ] Première extraction réelle et anonymisation contrôlées, traçabilité privée vérifiée.
- [ ] Retour du pilote intégré au guide avec version et justification ; admissibilité et comptage décidés.

Le ticket reste in-progress tant que ces faits ne sont pas accessibles et vérifiés. La préparation documentaire ne constitue pas son achèvement ; aucune preuve terrain reçue au 9 octobre 2026, aucun entretien compté sur cette base.

## Bilan de session — 9 octobre 2026

Préparation documentaire réalisée, vérifiée et revue. Le statut in-progress est conservé au lieu du built automatique du workflow : les critères terrain originaux ne sont pas satisfaits, et leur remplacement par une procédure serait une fausse clôture. La reprise nécessite un support utilisateur effectivement accessible et un participant réel volontaire ; le détail des preuves à fournir reste dans la feuille de conduite. Aucun contact externe effectué.

## Reprise — 10 octobre 2026

- Le plan complet et ses trois fichiers `context` ont été relus. La feuille de conduite, le README, le guide et les formats vierges sont déjà présents ; aucune procédure supplémentaire n'est nécessaire.
- Le contrôle de comptage du guide contenait encore « personne distincte de la cible », contrairement à ENQ-2 et à l'acceptation du plan. La formulation est alignée sur « personne adulte de la cible, distincte des autres participants ». C'est une correction de cohérence documentaire ; elle ne constitue pas une révision issue d'un entretien pilote.
- Aucun support utilisateur désigné et accessible, résultat réel d'essai, information finale/contact, canal effectivement autorisé, accord volontaire, observation d'entretien ou extraction réelle n'a été fourni pour cette reprise. Le contrôle des capacités effectué par l'agent coordinateur n'a trouvé aucun outil connecté au support d'enquête ; les outils de prévisualisation ont indiqué l'absence de navigateur. Ces constats ne prouvent ni un accès refusé au support utilisateur ni son indisponibilité pour l'utilisateur.
- Vérification documentaire : 19 liens locaux du README, de la conduite et du guide ont une cible existante. Le protocole canonique et le protocole bêta sont identiques octet par octet à HEAD ; SHA-256 respectifs `69ae0ca4d2a177ae91a6b623634f35578b0af4bdad1814fc9e633e9b46ef0a6d` et `4fb431879632906a68ff9882d9c5281dfccbb0f81c989dd4d7f7ae9ffcafb5f2`. `git diff --check` réussi. Aucun test applicatif ni essai réel du support exécuté.
- Le statut vérifié dans le suivi du ticket reste `in-progress`. Les six preuves restantes ci-dessus restent non satisfaites ; aucun entretien n'est compté et aucun résultat de terrain n'est inventé. La reprise terrain suit la feuille existante avec preuves privées minimisées ; aucun contact externe effectué.
