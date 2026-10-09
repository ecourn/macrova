---
title: '2.6 — Finaliser le parcours mobile clavier et navigation'
type: feature
ticket: 6
created: '2026-10-09'
status: built
baseline_revision: '99cfb4baa610452103f77bfd2770b761c05cf8a1'
route: full
route_source: auto
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-6971e7cd/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-6971e7cd/app/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-6971e7cd/_bmad-output/ux-macrova/DESIGN.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-6971e7cd/_bmad-output/ux-macrova/EXPERIENCE.md
---

<frozen-after-approval reason="arbitrages et poursuite délégués explicitement par l'utilisateur">

## Intent

**Problem:** Le parcours instrumenté de 2.5 doit être finalisé pour le mobile et le clavier, sans perdre les saisies ni rendre l'estimation dépendante du réseau. Les sélecteurs possèdent des choix très longs, les boutons ont une hauteur fixe shadcn et les focus sont partiellement translucides.

**Approach:** Corriger la composition shadcn et les styles publics, vérifier les annonces et erreurs, puis établir des preuves reproductibles à 320 px, en agrandissement et pour le retour de navigation. Réutiliser le calcul et la session mémoire existants.

## Boundaries & Constraints

**Always:** Conserver les six entrées et les seules règles de methode-estimative-v1, les décimales françaises, les unités et le calcul rationnel exact. Composer les primitives locales via @/components/ui ; vérifier FieldSet/FieldLegend et remplacer les équivalents personnalisés si cela préserve l'accessibilité. Appliquer les tokens DESIGN aux actions, bordures, surfaces, actif et focus ; contrôles tactiles au moins 44 × 44 px. Libellés et choix lisibles sans défilement horizontal à 320 px ; si NativeSelect tronque une longue option, utiliser un libellé compact fidèle et afficher sa description complète près du contrôle, liée par aria-describedby. Résumé d'erreurs annoncé une fois et lié aux champs ; aucune alerte concurrente. Résultat, modification et refus annoncés sans déplacement arbitraire du focus ; sortie d'une prévisualisation restaure le déclencheur. Navigation publique place le focus sur le titre de destination et conserve profil, édition, prévisualisation et erreurs dans la session active. Le retour n'abandonne pas une édition conservée : aucune confirmation de perte fictive. Maintenir la protection POST avant hydratation et l'absence de noms transmis. Tests significatifs du comportement et de la géométrie, sans certification WCAG revendiquée.

**Never:** Nouveau calcul serveur, nouveau stockage, profil dans URL/cookies/logs/localStorage/sessionStorage/collecte, modification du collecteur ou du domaine nutritionnel, transfert au compte, activation publique ou déploiement distant. Ne pas masquer le débordement avec overflow-x:hidden ni réduire la taille du texte pour le cacher. Ne pas prétendre qu'un simple zoom CSS est un zoom navigateur réel, ou qu'un arbre accessible prouve une lecture audio effective.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Comportement attendu | Erreur |
|---|---|---|---|
| Clavier | Profil valide ou invalide, refus puis correction | Ordre logique, unités/noms accessibles, résumé lié au champ, calcul explicite | Saisies intactes, aucun résultat obsolète |
| Édition | Champ absent, valeur invalide puis prévisualisation/confirmation/annulation | Erreur liée au bon contrôle, état annoncé, cible changée seulement à confirmation | Cible précédente intacte |
| Mobile / agrandissement | 320 px, texte augmenté et équivalent réagencement zoom 200 % | Aucun débordement ni bouton coupé, choix complets consultables, cibles 44 px, focus visible | Aucune information supprimée |
| Navigation | Calcul puis édition/refus, accueil et retour par historique | Focus du titre, brouillon et état retrouvés sans nouvel événement | Rechargement efface la mémoire |
| Panne | Convex configuré en 503 ou réseau coupé après chargement | Calcul et modification locaux disponibles, signal hors ligne, enveloppes minimales seulement | Pas de perte des saisies |

</frozen-after-approval>

## Code Map

- `app/src/routes/calculateur.tsx` — six contrôles shadcn Input/NativeSelect ; formulaire POST sans name, fieldset désactivé avant hydratation ; update conserve le CalculatorSession dans le contexte router. Titre déjà focalisé au montage. Résumé/résultat dans une région live polie ; à conserver.
- `app/src/components/calculator-target-editor.tsx` — erreur de sélection associée à edit-error dans le champ valeur ; lien href pointe toujours edit-value bien que son handler distingue edit-field. Prévisualisation inline, focus restauré après fermeture ; vérifier reset/annulation et annonces.
- `app/src/components/public-navigation.tsx`, `app/src/routes/index.tsx` — liens TanStack ; accueil sans gestion du focus du titre. Actif souligné sans couleur primary explicite.
- `app/src/styles.css` — tokens publics existants ; tailles saisies à 44 px, navigation 44 px, focus explicite seulement pour liens ; Button h-8/shrink-0/nowrap hérité. Adapter dans .public-page pour limiter la portée.
- `app/src/components/ui/{field,button,native-select,input}.tsx` — composants existants à composer, sans refonte générale des primitives.
- `app/src/router.tsx`, `app/src/domain/calculator.ts`, `app/src/lib/calculator-measurement.ts` — session par instance de router, calcul local, mesure facultative ; conserver.
- `app/tests/e2e/calculator.spec.ts` — références, erreurs, retour via liens, mobile/clavier et édition déjà couverts ; compléter avec historique, ordre Tab et géométrie états édition/erreur.
- `app/tests/e2e/calculator-failure.spec.ts`, `app/playwright.config.ts` — projet 503 et tests collecte ; configuration neutre pour auth réelle. Ajouter tout nouveau fichier au testMatch s'il y en a un.
- Continuité 2.5 : événement exclusivement après calcul/confirmation réussis, transport sans cookies/referrer ; aucune collecte sur retour ou saisie, aucune queue persistante. Aucun backend à modifier.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/routes/calculateur.tsx`, `app/src/components/calculator-target-editor.tsx` — corriger choix longs, associations d'erreur et composition FieldSet/FieldLegend ; préserver annonces et gestion du focus.
- [x] `app/src/styles.css`, `app/src/components/public-navigation.tsx`, `app/src/routes/index.tsx` — rendre actions/focus/actif et retour au titre conformes aux tokens et au réagencement.
- [x] `app/tests/e2e/calculator.spec.ts`, `app/tests/e2e/calculator-failure.spec.ts` — couvrir les lignes de matrice manquantes avec assertions comportementales, layout, focus, description et confidentialité.
- [x] `app/docs/recette-calculateur-accessibilite.md`, `app/README.md` — consigner la recette et ses limites, preuves de contraste, mobile, agrandissement, clavier et panne ; ne pas annoncer audit complet.

**Acceptance Criteria:**
- Given le calculateur instrumenté, when le parcours calcul/refus/correction/modification est activé au clavier, then noms, unités, messages et focus permettent de terminer sans souris.
- Given une largeur de 320 px et un agrandissement de texte, when résultat et édition sont ouverts, then tous les contenus et actions restent lisibles et atteignables sans défilement horizontal.
- Given un brouillon actif, when accueil puis retour historique ou lien, then saisies et état sont conservés et aucun calcul/événement ne se déclenche implicitement.
- Given Convex indisponible ou le navigateur hors ligne, when calcul et modification explicites, then le résultat local reste utilisable sans fuite de profil.

## Implementation Notes

- 2026-10-09 — Composition shadcn FieldSet/FieldLegend, descriptions complètes associées et options courtes mesurées à texte ×2. Boutons adaptatifs, focus opaque sans interpolation, navigation active et focus accueil.
- Erreurs d'édition reliées séparément au sélecteur ou à la valeur ; Échap ferme la prévisualisation, annulation/reset annoncés. Capturer preview avant update évite que la mutation du contexte mémoire perde la condition de restauration du focus après retour.
- Recette Playwright : 25 tests réussis, dont quatre nouveaux (Tab/erreurs, deux tailles de texte, historique). Panne503, offline, préhydratation et confidentialité passent. Matrice couverte par ces nouveaux tests et les parcours existants calcul/refus/correction/édition.
- Vérifications : check160 fichiers zéro diagnostic, typecheck code0, 412 tests unitaires sur23 fichiers, build code0. Le build signale104 MODULE_LEVEL_DIRECTIVE issus des dépendances BaseUI/lucide, déjà présents ; aucun diagnostic du check.
- Recette agent-browser/axe4.12.1 : états initial/résultat/prévisualisation/erreur sans violation ni incomplete. Vrai zoom Chrome154 à200 % via chrome.tabs.setZoom : viewport640×1480 donne320×740 CSS, DPR2, racine16px et CSSzoom1. Calcul2638, refus édition, correctionP110 puis confirmation clavier ; aucun débordement, contrôles44px minimum.
- Le serveur de recette partageait initialement le cache Vite avec3001, provoquant un timeout de démarrage ; isolation du cache et passage E2E complet réussi. Les limites lecteur d'écran audio/clavier virtuel réel sont consignées, sans certification revendiquée.

## Plan Change Log

## Review Triage Log

### Passage quick — 9 octobre 2026

Verdicts : high 0, medium 1, low 0, false 0, maybe-false 0.

| Constat | Verdict | Route | Preuve et action |
|---|---|---|---|
| Échap ne ferme pas depuis le déclencheur après ouverture clavier | medium | patch | Le gestionnaire est dans la section preview tandis que submit conserve le focus sur previewButton hors de celle-ci ; aucun ancêtre ne reçoit Escape. Corrigé : gestionnaire sur la section d'édition, actif seulement quand preview est ouverte ; test Enter puis Escape depuis le déclencheur passé. Focus et annonce conservés. |

## Verification

Depuis `app/` : `bun run check` (zéro erreur/avertissement), `bun run typecheck`, `bun run test`, `bun run test:e2e`, `bun run build`. Vérifier que chaque ligne de matrice est effectivement exécutée. Recette navigateur des états initiaux/erreurs/résultat/édition à 320 px, contraste calculé sur les tokens rendus et focus inspecté ; équivalent zoom par viewport réduit accompagné d'augmentation de texte, limites explicitement documentées. L'hôte T3 preview est indisponible après status/open : navigateur local autorisé en repli ; les tests Playwright du dépôt restent l'outil de preuve reproductible.

### Vérification finale après patch de revue

Le 9 octobre 2026, depuis app/ : check160 fichiers zéro erreur/avertissement,
typecheck code0, 23 fichiers / 412 tests unitaires réussis, 25 tests E2E réussis
(1,5 minute), build code0. Contrôle git diff --check sans erreur. Logs de session
locaux : /tmp/macrova-2-6-unit-final.log, /tmp/macrova-2-6-e2e-final.log et
/tmp/macrova-2-6-build-final.log. Aucune observation de revue différée.

Matrice exécutée : clavier/refus/correction → résumé unique et ordre Tab ;
édition → édition exacte et sélection absente ; mobile/agrandissement →
réagencement texte ×1/×2 ; navigation → retour historique brouillon/preview/refus ;
panne → édition hors ligne et projet public-backend-unavailable (3 tests).
Le vrai zoom navigateur est documenté dans la recette locale.
