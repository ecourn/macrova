---
title: '2.1 — Documenter et valider la méthode estimative'
type: 'feature'
ticket: 1
created: '2026-10-07'
status: 'built'
baseline_revision: 'b44758a9b3dcc4c60a3fe73b85e63568b8b4d057'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
acceptance: 'awaiting-real-validation'
implementation_authorized: false
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-c1aef171/_bmad-output/initiative-macrova/epic-calculateur/methode-estimative-v1/sources-verifiees.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-c1aef171/_bmad-output/initiative-macrova/epic-calculateur/epic-calculateur.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La story 2.1 exige un dossier sourcé avant l'implémentation du calculateur. Aucune méthode et aucun responsable de validation ne sont actuellement approuvés.

**Approach:** Livrer une proposition v1 entièrement définie, des exemples exacts reproductibles et un registre de validation prêt à signer. L'utilisateur délègue les arbitrages et l'approbation du plan ; cette délégation ne fournit pas un accord nutritionnel réel sur une méthode encore inconnue.

## Boundaries & Constraints

**Always:** Français, références primaires vérifiées et datées, distinction faits scientifiques/choix de produit, version unique, critères de refus déterministes. Accord explicite daté d'un responsable réel nécessaire à l'acceptation finale ; les tâches documentaires sont achevables sans cet accord.

**Never:** Modifier app/, les tickets ou le contrat parent ; implémenter un estimateur dans l'application ou dans un script ; déclarer une validation réelle obtenue sans preuve ; inventer une prescription, inférer des calories alimentaires ou transférer le profil vers un compte.

## Décisions proposées pour examen

- Mifflin simplifié : R=10W+6,25H−5A+c, c=5 ou −161 selon le groupe de l'étude ; E0=R×PAL. Maintien uniquement. PAL 1,4/1,6/1,8/2,0 et descriptions qualitatives couvrant toute la journée ; pas de correspondance automatique séances/PAL, pas d'ajout d'exercice.
- Défaut P/G/L=15/45/40 % d'E0 ; conversions 4/4/9 seulement pour la cible théorique. Refuser si P<0,83W ; ne jamais corriger silencieusement. Répartition admise : P10–20 %, G40–55 %, L35–40 %, bornes inclusives proposées.
- Domaine produit volontairement réduit : âge entier19–64 inclus, taille120–220 cm inclus, poids30–200 kg inclus, IMC calculé exact18,5≤IMC<30. Ce sont des choix de couverture, pas le domaine validé de l'étude ni des garanties de santé. Entrées décimales françaises selon AD-12 ; aucun IMC saisi ni date de naissance, objectif pondéral ou masse grasse.
- Exclusions : grossesse/allaitement, trouble alimentaire actuel ou antérieur, pathologie/traitement influençant besoins ou poids, prescription nutritionnelle, sport intensif/compétition, coefficient de l'étude non applicable ou incertain (notamment contexte hormonal non couvert). Une déclaration globale d'éligibilité oui/non/incertain suffit ; aucune collecte détaillée de diagnostic. Non ou incertain refuse. Coefficient non choisi refuse, sans déduction de l'identité de genre.
- Modification explicite d'un champ à la fois, sans changer le profil : E entre0,9E0 et1,1E0 (référence originale, sans cumul), conserve les proportions exactes actuelles ; modifier P conserve E et L, recalcule G=(E−4P−9L)/4 ; modifier L conserve E et P, recalcule G ; modifier G conserve E et P, recalcule L=(E−4P−4G)/9. Prévisualiser les changements avant validation explicite. Refuser tout négatif, fractions hors intervalles ou P<0,83W, sans clamp. Plusieurs champs envoyés ensemble refusés. Changement de profil invalide toutes les cibles, nouveau calcul explicite remet au défaut. Réinitialisation explicite revient à E0 et défaut.
- AD-12 : exact rationnel jusqu'à affichage centième demi supérieur, aucune réinjection d'arrondi ; expliquer les fractions périodiques et les intermédiaires signés, non gérés aujourd'hui par rational(). État méthode indisponible distinct d'entrée invalide/exclusion ; aucun ancien résultat actuel après changement.

</frozen-after-approval>

## Code Map

- `methode-estimative-v1/sources-verifiees.md` — preuves de lecture S1–S5 déjà contrôlées, à conserver.
- `../../spec-macrova/spec-macrova.md` et compagnons — CAP-1 et validation préalable ; aucune formule adoptée.
- `../architecture-app/architecture-app.md`, AD-2/AD-12 ; `../../ux-macrova/EXPERIENCE.md` — frontières numériques, états et accès public.
- `../../../app/src/domain/decimal.ts` — normalisation française et rationnels non négatifs ; ne pas modifier en 2.1.
- `tickets.toml` entrée1 — hitl/done_checkpoint réel ; ne pas modifier.

## Tasks & Acceptance

**Execution:**
- [x] `methode-estimative-v1/methode-estimative-v1.md` — écrire méthode, unités, ordre des gardes, hypothèses, messages, exclusions et recalcul déterministes ; lier les compagnons et les sources.
- [x] `methode-estimative-v1/exemples-reference.json` et `exemples-reference.md` — fournir au moins trois profils synthétiques avec résultats rationnels et affichages vérifiés, modifications des quatre champs, reset et matrice complète des bornes/refus. Vecteurs pour futures stories, pas de moteur applicatif.
- [x] `methode-estimative-v1/validation.md` — preuve de vérification documentaire/numerique séparée du consentement réel, statut en attente, conditions précises de signature, responsable/date/preuve non inventés, couverture CAL-1/3/4 et suite 2.2 toujours fermée.
- [x] `methode-estimative-v1/verification.md` — consigner reproduction arithmétique exacte et intégrité des liens/JSON/versions ; calculs via Python Fraction dans une commande temporaire, sans livrer un second moteur.

**Acceptance Criteria:**
- Given les sources vérifiées, when le dossier est relu, then chaque formule et coefficient a une référence, et chaque choix produit est identifié comme proposé.
- Given un profil synthétique éligible, when ses équations et conversions sont reproduites indépendamment en Fraction, then résultats exacts et arrondis correspondent aux vecteurs et 4P+4G+9L=E.
- Given chacune des bornes et exclusions, when la matrice est lue, then son résultat attendu et son message sont déterministes, sans estimation pour un refus.
- Given une modification de chaque champ, when le recalcul est reproduit, then les valeurs conservées/recalculées, bornes et absence d'arrondi intermédiaire sont vérifiables.
- Given aucun accord réel du responsable, when le registre est lu, then aucune validation ni autorisation d'implémentation automatique n'est annoncée ; l'acceptation finale demeure ouverte.
- Given un responsable identifié et un accord daté couvrant la version et tous les éléments, when sa preuve est effectivement reçue et consignée, then la clôture de 2.1 peut être décidée. Critère externe impossible à remplacer par l'agent.

## Verification

Reproduire les exemples avec fractions exactes, vérifier JSON et liens relatifs, contrôler la matrice de refus, puis revue indépendante quick. Aucun changement dans app/ : contrôles applicatifs sans pertinence ici.

## Implementation Notes

- 2026-10-07 — ticket résolu en passant explicitement le dossier initiative-macrova, faute de sélection locale. Arbre initial propre ; branche dédiée cohérente. Plan approuvé par délégation explicite de l'utilisateur ; accord nutritionnel final non présumé.

- 2026-10-07 — dossier réalisé et vérifié : 3 profils synthétiques, 7 modifications, 112 gardes, 5 transitions et 3 arrondis. Audit indépendant de tous les vecteurs, JSON, liens, commande publiée et SHA-256 réussi. Aucun fichier applicatif modifié.
- 2026-10-07 — acceptation finale externe non acquise : responsable, rôle et décision réelle manquants ; registre validation.md prêt à recevoir la preuve. Le statut built décrit le dossier préparé/revu, jamais une méthode approuvée ni une autorisation de 2.2.

## Plan Change Log

## Review Triage Log

- 2026-10-07 — quick : 0 constat (high=0, medium=0, low=0, false=0, maybe-false=0), aucune déférence. La validation externe demeure une condition d’acceptation explicitement ouverte, pas une preuve inventée.
- Audit de clôture : low / patch — la fraction d’exemple d’arrondi 98925/1000 était équivalente mais non réduite, contrairement à la convention documentaire ; remplacée par 3957/40 sans changement numérique, puis empreinte JSON recalculée.
