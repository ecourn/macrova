---
title: "Dossier et validation réelle de la méthode estimative v1"
type: chore
ticket: 1
created: 2026-10-07
status: in-progress
baseline_revision: b44758a9b3dcc4c60a3fe73b85e63568b8b4d057
route: oneshot
route_source: auto
review: quick
review_source: pinned
lenses_ran: []
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problème :** La story 2.1 exige un dossier sourcé et une validation réelle avant implémentation. Le dépôt contient seulement l’inception, qui affirme explicitement que cette validation n’a pas eu lieu.

**Approche :** Produire un dossier candidat versionné comprenant sources primaires vérifiées, formule, entrées, exclusions, répartition et modifications explicites ; reproduire ses exemples indépendamment et consigner dans un registre la preuve effectivement disponible. L’utilisateur délègue les arbitrages courants et demande de poursuivre sans questionnaire. Cette délégation autorise la préparation, mais ne fournit ni identité de validateur ni accord sur un dossier qui n’existait pas encore. Ne pas fabriquer cet accord, ne pas clôturer 2.1 et ne pas autoriser 2.2 en son absence.

Décision déléguée du 2026-10-07 : route documentaire directe, sans modification applicative ni changement des contrats parents. Les choix nutritionnels restent candidats à examiner par le responsable ; la validation arithmétique par agents ne vaut pas validation nutritionnelle humaine.

</frozen-after-approval>

## Implementation Notes

- Route oneshot : zéro ligne applicative modifiée ; dossier documentaire et preuves uniquement. Lecture de l’epic, de CAP-1 et de tous ses compagnons, des contrats architecture/UX et du contrat décimal existant.
- Recherche indépendante du dépôt : aucune validation préalable identifiée. L’inception et le ticket distinguent explicitement la validation scientifique réelle des arbitrages délégués.
- Livrables : `methode-estimative-v1.md`, `verification-methode-estimative-v1.md`, `validation-methode-estimative-v1.md` dans ce dossier. Le registre est la porte d’entrée pour la reprise ; aucune édition du ticket TOML ni du parent.

## Vérification et acceptation

- Étant donné les sources primaires accessibles, lorsque le dossier est lu, alors chaque formule et référence possède date, lien et localisation ; chaque adaptation Macrova est explicitement distinguée.
- Étant donné les cas de référence, lorsque les calculs exacts sont reproduits indépendamment, alors les résultats, arrondis, bornes et règles de modification concordent, avec preuves consignées.
- Étant donné une entrée invalide, exclue, incertaine ou une méthode non approuvée, lorsque l’estimation est envisagée, alors le dossier exige un refus sans résultat actuel et conserve les saisies.
- Étant donné le dossier final identifié par empreinte, lorsque le responsable donne son accord réel daté couvrant méthode, répartition, entrées, exclusions et modifications, alors le registre conserve identité, rôle, décision et preuve originale. **Ce critère demeure non satisfait sans cet accord ; les contrôles documentaires ne peuvent le remplacer.**
- Contrôles : reproduction Python avec fractions exactes ; revue indépendante du dossier ; intégrité des références locales et empreinte SHA-256 ; `git diff --check` ; `tickets.py status` pour constater que 2.1 n’est pas clôturée. Aucun test applicatif : aucun changement dans `app/`.

## Plan Change Log

## Review Triage Log
