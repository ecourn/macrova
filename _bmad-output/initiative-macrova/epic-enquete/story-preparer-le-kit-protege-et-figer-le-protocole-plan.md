---
title: '10.1 — Préparer le kit protégé et figer le protocole'
type: 'chore'
ticket: 1
created: '2026-10-07'
status: done
acceptance: 'accepted-documentary-kit'
recruitment_authorized: false
baseline_revision: '9985ffa44bd0a5c7cda6e325ae503756fb1ed98f'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-c1aef171/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-c1aef171/_bmad-output/initiative-macrova/epic-enquete/epic-enquete.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-c1aef171/_bmad-output/spec-macrova/protocole-validation.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-c1aef171/_bmad-output/spec-macrova/decisions-lancement.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-c1aef171/_bmad-output/initiative-macrova/architecture-app/architecture-app.md
---

> Historique remplacé pour le MVP par [la décision du 10 octobre 2026](../change-mvp-sans-enquete/change-mvp-sans-enquete.md). Aucune reprise terrain obligatoire ; les constats et preuves absentes ci-dessous restent historiques.

## Contrat courant renégocié — 8 octobre 2026

Intent : clôturer la préparation documentaire et adopter le protocole par décision de l’agent mandaté, dans le fonctionnement à deux demandé par l’utilisateur. 10.1 est terminée ; son acceptation ne prétend pas vérifier un support privé ni autoriser une collecte immédiate.

- [x] Six pièces du kit, modèles vierges et simulation explicitement fictive préparés.
- [x] Critères bêta, fenêtres, remboursements et correspondance AD-11 adoptés et versionnés.
- [x] Cadre de minimisation et responsabilités du binôme arrêté, sans données personnelles dans Git.
- [x] Essais autorisé/refusé/révocation/suppression, choix effectif du support, information/contact et canaux affectés à 10.2 avant toute collecte.
- [x] Signature externe et checkpoints d’approbation documentaire retirés du ticket.

Critères : kit cohérent avec les sources et procédure testable en 10.2 ; simulation exclue de tous les comptes. Recrutement non exécuté et non autorisé par cette clôture seule ; aucun support ni consentement déclaré vérifié. Le développement isolé de 2.2 est indépendant de l’enquête.

## Historique de réalisation — 7 octobre 2026, conditions remplacées

Les contrats et constats suivants sont conservés pour traçabilité ; les anciennes conditions de clôture sont remplacées par le contrat courant ci-dessus.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** L'enquête préalable ne dispose pas du guide, des fiches ni d'un protocole bêta versionné. Responsable, support privé et accord sur la collecte ne sont pas établis.

**Approach:** Produire un kit documentaire v1 daté, des modèles vierges, une proposition de cadre minimal et une recette simulée complète. L'utilisateur délègue les arbitrages et l'approbation du plan ; la délégation ne constitue pas un accord attribuable d'un responsable sur des pièces encore inconnues ou une preuve d'accès privé.

## Boundaries & Constraints

**Always:** Français ; sources canoniques ; séparer enquête et bêta ; champs minimaux ; guides et modèles seulement dans Git. Données terrain, coordonnées, notes, repas individuels et correspondances même pseudonymisées restent dans le support privé. Toute simulation porte son étiquette et est exclue des comptes réels. Préparer toutes les décisions et preuves manquantes sans les fabriquer.

**Never:** Modifier app/, tickets.toml, contrats parents ou configuration globale ; créer une application enquête ; contacter un tiers, inviter ou payer ; inventer conformité, responsable, autorisation, durée légale, résultat réel ou disponibilité catalogue. Aucun accès privé ne peut être déclaré vérifié sans essai effectif sur le support choisi.

</frozen-after-approval>

## Code Map

- [Epic](epic-enquete.md) — ENQ-1/3/4/5/6 ; 10.1 exige aussi accord réel et tests d'accès.
- [Protocole source](../../spec-macrova/protocole-validation.md) — quinze entretiens, cinquante recherches candidates, bêta 20–30 pendant deux semaines ; seuils et décision.
- [Décisions](../../spec-macrova/decisions-lancement.md) — cadre à approuver ; aucune certification juridique.
- [Architecture](../architecture-app/architecture-app.md), AD-11 — événement serveur après mutation, filiation, déduplication et invitation individuelle.
- [Précédent](../epic-calculateur/methode-estimative-v1/decision-responsable.md) — formulaire de décision non rempli et empreintes, séparation préparation/validation réelle.
- [Destinations catalogue](../epic-catalogue/epic-catalogue.md) et [lancement](../epic-validation-lancement/epic-validation-lancement.md) — audit puis bêta, sans transfert prématuré de résultats.

## Tasks & Acceptance

**Execution:**
- [x] `kit-enquete-v1/README.md` — index, ordre d'emploi, statut du gel documentaire, limites et conditions réelles d'ouverture du recrutement.
- [x] `kit-enquete-v1/guide-entretien.md` — filtrage adulte francophone en France suivant déjà ses macros et pesant ses aliments ; introduction neutre ; observation d'un repas récent, méthode habituelle, durée, erreurs, corrections et difficultés ; aucune tâche produit ni collecte de diagnostic.
- [x] `kit-enquete-v1/formats-vierges.md` — modèles copiables uniquement dans le support privé : recrutement séparé, fiche d'entretien, aliments, recherches candidates, traçabilité privée et corpus anonymisé, mesures bêta et transmission. Distinguer observé/déclaré/non observable et inconnu/absent/zéro sans inventer valeurs ou conversions.
- [x] `kit-enquete-v1/cadre-protection.md` — proposition minimale, information participant à finaliser, matrice champs/finalités/accès/durées/suppression ; rôles, support et canaux à établir ; décision explicite vierge, aucune durée ni identité approuvée par défaut.
- [x] `kit-enquete-v1/protocole-beta.md` — v1 datée, critères exacts, correspondance champs/AD-11/collecte ; seuils arrondis supérieurs pour chaque effectif 20–30, comparaison de tâches, remboursements, renouvellements et coûts ; journal de changements sans rétroactivité.
- [x] `kit-enquete-v1/recette-et-validation.md` — exercice fictif étiqueté jusqu'aux deux livrables, cas négatifs et contrôle des liens/calculs/sources ; recette d'accès autorisé/refusé/révocation/suppression et registre des preuves réelles non obtenues.
- [ ] Recevoir l'accord réel du responsable et vérifier le support privé choisi ; enregistrer seulement un bilan sans identifiants dans Git, conserver preuves et personnes hors dépôt.

**Acceptance Criteria:**
- Given le guide vierge, when un enquêteur le parcourt, then cible, information préalable et étapes ENQ-2 sont explicites sans inciter à acheter ni inventer de témoignage.
- Given une simulation explicitement fictive, when on parcourt fiches et extraction, then un corpus anonymisé et un protocole destinataire sont démontrés sans compter quinze entretiens ou cinquante recherches réalisés.
- Given les sources, when les mesures bêta sont comparées, then dénominateurs uniques, activation 60 %, réutilisation J6–J8 30 %, cinq paiements 5,99 € encaissés non remboursés, AD-11, renouvellements et coûts concordent.
- Given le kit, when champs et accès sont relus, then coordonnées, notes et correspondances sont séparées, et chaque conservation/suppression exige une décision attribuable avant collecte.
- Given aucune preuve privée disponible, when la recette est lue, then accord, accès et clôture restent non acquis et 10.2 reste fermée ; aucun statut done n'est annoncé.
- Given un responsable et un support réellement établis, when accord et essais autorisé/refusé sont recevables, then la clôture de 10.1 peut être soumise avec les preuves privées, jamais remplacée par une simulation.

## Implementation Notes

- 2026-10-07 — arbre initial propre ; résolution avec dossier initiative explicite sans modifier la configuration. Plan approuvé par délégation de l'utilisateur ; réalisation documentaire complète autorisée. Environ six fichiers documentaires, route full. Les décisions externes seront préparées et resteront non acquises faute de preuve.

- 2026-10-07 — contrôle parent : diff complet relu, 29 liens locaux et 11 lignes de seuils vérifiés par calcul entier indépendant ; `git diff --check` et `git diff --cached --check` réussis. Aucun changement app/, ticket ou contrat parent. Suppression de deux fragments de liens pour éviter une dépendance au renderer Markdown.
- 2026-10-07 — préparation construite et revue (`built` selon workflow), acceptation réelle ouverte ; ce statut ne clôture pas 10.1 et n’autorise pas 10.2. Aucun support privé ni outil connecté permettant ses essais n’est établi dans les preuves disponibles.

## Plan Change Log

## Review Triage Log

- 2026-10-07 — revue quick indépendante : aucun défaut documentaire (high=0, medium=0, low=0, false=0, maybe-false=0) ; aucun travail différé. Accord réel et essais privés restent une tâche de 10.1 non satisfaite, pas un transfert à une autre story.

## Verification

Contrôler liens relatifs, absence de données terrain, table des seuils avec arithmétique indépendante et correspondance de chaque champ AD-11. Lire le diff complet, exécuter `git diff --check`, faire une revue indépendante. Aucun contrôle applicatif puisque app/ reste inchangé. La simulation démontre les formats, pas les accès privés réels.

- 2026-10-07 — Six pièces documentaires créées et relues entièrement, sans données terrain ; exercice fictif et cas négatifs explicitement exclus des comptes réels. Cibles de tous les liens locaux contrôlées ; liens AD-11 pointent vers le fichier sans ancre dépendant du rendu. Onze lignes de seuils contrôlées par calcul indépendant entier : `(3*N+4)//5` et `(3*N+9)//10`. Correspondance AD-11 relue : serveur après mutation, eventId/déduplication, destinations uniques, filiation, invitation individuelle, dénominateur sans usage, paiements/remboursements/renouvellements et export/delete. `git diff --check` passé. Relecture indépendante initiale effectuée par l’agent parent ; revue finale gérée par le workflow parent. Accord attribuable et recette réelle du support non obtenus : dernière tâche ouverte, 10.1 non clôturée et 10.2 fermée. Aucun contrôle applicatif ni changement de app/, contrats parents ou configuration.

### Pièces historiques du 7 octobre — SHA-256

Empreintes du kit relu, à vérifier lors de la décision privée ; elles ne prouvent aucun accord ni aucun essai terrain.

- `README.md` : `e273a64598281ebcec0395ddfc95333b592d1b9d9c215ad99fb83d57530c2ea1`
- `cadre-protection.md` : `3920dac0d3e309d2e215e2f1993244734a239fb78580bc5c00164f4e245646ba`
- `formats-vierges.md` : `90ae51501f73b9cd2d14e35eaa704a24082bd114cbf3e44275a7bfb60bed3538`
- `guide-entretien.md` : `909ed7cb0e5384849bfba5302f69578228078d5d611a0f56deb6d35352868193`
- `protocole-beta.md` : `2219095ffec05f0a3f3f9496b04088a3a92130828e0dc49998d6b65e340ce274`
- `recette-et-validation.md` : `ce04d82ceafa4ac19b151a01709453d55f458aa1deab022c8e10bc72ad5b3e4e`


## Journal de correction — 8 octobre 2026

Decision: application de la correction de gouvernance sous autorisation explicite de l’utilisateur ; responsabilités et critères courants mis à jour, sans fabriquer de preuve externe ou terrain.

## Pièces courantes acceptées — 8 octobre 2026

- `README.md` : `b4b64f09f8fb3b664da3e89bc8f905415c745bd3b108b4919adb7eb63728ce0c`
- `cadre-protection.md` : `7b507ff9809c9b93c3cfdb1c051545ee6e0ffe92fe536873bb21b36d584c7644`
- `formats-vierges.md` : `90ae51501f73b9cd2d14e35eaa704a24082bd114cbf3e44275a7bfb60bed3538`
- `guide-entretien.md` : `909ed7cb0e5384849bfba5302f69578228078d5d611a0f56deb6d35352868193`
- `protocole-beta.md` : `4fb431879632906a68ff9882d9c5281dfccbb0f81c989dd4d7f7ae9ffcafb5f2`
- `recette-et-validation.md` : `e473921590761204d44ced1493483c59c7f1c512ac129f91ab822fd044707b7b`
