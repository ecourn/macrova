---
title: '2.3 — Vérifier exclusions limites et reprise après erreur'
type: feature
ticket: 3
created: '2026-10-08'
status: built
baseline_revision: '6bbca37f9dd24818f6b1ee45a558decee8a8651b'
route: full
route_source: auto
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context:
  - /home/ubuntu/.t3/worktrees/macrova/t3-cb77cc7a/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-cb77cc7a/app/AGENTS.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-cb77cc7a/_bmad-output/initiative-macrova/epic-calculateur/methode-estimative-v1/methode-estimative-v1.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-cb77cc7a/_bmad-output/ux-macrova/EXPERIENCE.md
  - /home/ubuntu/.t3/worktrees/macrova/t3-cb77cc7a/_bmad-output/ux-macrova/DESIGN.md
---

<frozen-after-approval reason="intent approuvé sous délégation explicite de l'utilisateur">

## Intent

**Problem:** La story 2.2 fournit les gardes et un premier refus, mais la correction accessible et la couverture transversale des entrées/refus restent partielles. Le résumé ne guide pas explicitement la reprise et ses liens ajoutent un fragment à l'URL.

**Approach:** Compléter le parcours de refus/correction et sa couverture, à méthode inchangée. Rendre les erreurs françaises utilisables au clavier, conserver toutes les saisies et exiger un nouveau calcul après chaque changement.

## Boundaries & Constraints

**Always:** Réutiliser les messages, exclusions, bornes et ordre des gardes de methode-estimative-v1. Contrat AD-12 inchangé, rationnels exacts ; virgule/point, six décimales avant normalisation. Conserver les six saisies brutes en mémoire de parcours, aucune normalisation destructive du brouillon. Les erreurs numériques d'une même étape restent ordonnées âge/taille/poids ; les choix gardent leur priorité coefficient/PAL/éligibilité. Invalidation immédiate du résultat pour chaque entrée. Réutiliser Alert, Button, Field, Input et NativeSelect shadcn. Résumé annoncé par un canal cohérent, erreurs liées aux champs par aria-describedby/aria-invalid, liens de correction activables au clavier et focus explicite seulement à leur activation ; aucun déplacement automatique à la soumission. Reprise neutre, sans inventer conseil médical ou recommander de changer une déclaration pour obtenir une estimation. Les erreurs globales IMC/protéines ne sont pas attribuées artificiellement à un champ.

**Never:** Nouvelle formule, borne scientifique ou population exclue ; détails médicaux collectés ; profil transmis ou persisté dans URL, réseau, cookie ou stockage ; correction silencieuse ; édition de cible (2.4), collecte (2.5), refonte générale (2.6), modification auth/Convex ou déploiement.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Erreur |
|---|---|---|---|
| Syntaxe FR | Chacun des trois champs numériques : vide/signe/exposant/milliers/sept décimales/plafond dépassé ; entrées FR valides | Refus sans perte de texte ou normalisation conforme, sans arrondi | ENTREE_INVALIDE avant domaines/exclusion |
| Domaines et IMC | Matrice adoptée des bornes âge/taille/poids et IMC 18,5 inclus/30 exclu ± un millionième | Tous les vecteurs du profil couverts ; garde passée ne signifie pas succès global | Codes exacts du dossier |
| Choix et exclusion | Choix absents/inconnus/incertains, quatre PAL, deux coefficients ; déclaration non/incertain pour tous motifs documentaires | Priorité déterministe ; aucun détail de motif collecté | Messages français adoptés |
| Priorité et cible | Méthode indisponible + syntaxe ; syntaxe + exclusion ; exclusion + IMC ; matrice cible ratios/minimum | Première étape échouée prioritaire ; aucune estimation alternative | Codes de la méthode |
| Reprise accessible | Soumission invalide puis activation du lien de correction et saisie corrigée | Résumé accessible, focus au champ choisi sans hash URL, saisies conservées ; succès seulement au nouveau calcul | Erreur liée au champ et message neutre |
| Obsolescence et retour | Succès puis modification de chacune des six entrées, dont valeur invalide/exclue ; navigation accueil/retour | Aucun ancien résultat actuel, refus corrigeable, brouillon conservé, recalcul explicite retrouve référence | Aucun calcul automatique |

</frozen-after-approval>

## Code Map

- `app/src/domain/calculator.ts` — calculateProfile possède toutes les gardes ; changeCalculatorProfile invalide outcome et conserve le brouillon. Préserver formules et règles ; modification seulement si un test démontre un défaut.
- `app/src/domain/calculator.test.ts` — consomme exemples-reference.json ; les cas NORMALISE ne passent que par le normaliseur et syntaxe vise surtout âge. Renforcer transversalement, priorités et invariance des entrées ; garder les oracles indépendants.
- `app/src/routes/calculateur.tsx` — erreurs inline et résumé Alert après formulaire ; ajouter reprise explicite et liens de focus ; corriger canaux imbriqués d'annonce. Garder protections avant hydratation/POST et rendu résultat.
- `app/tests/e2e/calculator.spec.ts` — helper profile et tests mémoire/confidentialité/mobile existants ; étendre refus, correction clavier, erreurs simultanées, invalidation des six champs et retours après refus.
- `app/playwright.config.ts` — calculator.spec.ts déjà enregistré dans E2E standard ; ne pas utiliser auth réelle.
- `methode-estimative-v1/exemples-reference.json` — références, matrice et codes canoniques, ne pas modifier ; éditions/reset appartiennent à 2.4.

## Tasks & Acceptance

**Execution:**
- [x] `app/src/domain/calculator.test.ts` — compléter tests transversaux des champs/domaines/exclusions/priorités, normalisation complète et invariance des entrées ; domaine inchangé sauf défaut démontré.
- [x] `app/src/routes/calculateur.tsx` — résumé et actions de correction accessibles, annonce cohérente et reprise neutre préservant données/protections.
- [x] `app/tests/e2e/calculator.spec.ts` — vérifier clavier, liens, associations ARIA, erreurs multiples, résultat→refus→correction, tous changements, refus conservé au retour et absence de profil réseau/stockage/URL.

**Acceptance Criteria:**
- Given un profil invalide ou exclu, when le calcul est soumis, then le refus suit exactement les règles adoptées, ne produit aucune estimation et conserve les saisies.
- Given plusieurs champs refusés, when leurs actions de correction sont utilisées au clavier, then chaque champ est accessible et son erreur associée, avec résumé français annoncé sans focus automatique.
- Given un résultat valide, when une des six entrées change puis le parcours est quitté et repris, then le résultat actuel disparaît immédiatement et seule une soumission explicite sur profil valide crée un nouveau résultat.
- Given un refus corrigé, when le profil de référence est soumis à nouveau, then ses quatre résultats exacts sont retrouvés sans aucune persistance ou transmission du profil.

## Implementation Notes

- 2026-10-08 — Plan initial compté à 1 859 tokens (o200k_base) : conservation du plan complet retenue sous délégation utilisateur, objectif unique et contraintes nécessaires à sa vérification.

- 2026-10-08 — Initiative résolue par dossier explicite sans changer configuration ; arbre propre, branche t3/build-story-2-3 cohérente. Utilisateur délègue questions et décisions : approbation et poursuite retenues. Route full, changement estimé supérieur à 100 lignes avec tests. Investigation indépendante : aucune garde manquante, priorité à la reprise et ses preuves.

## Plan Change Log

## Review Triage Log

- 2026-10-08 — Revue quick indépendante : high=0, medium=0, low=0, false=0, maybe-false=0. Aucun constat retourné après lecture du diff, des règles et des critères ; aucune correction ni déférence requise.

## Verification

Depuis `app/` : `bun run check` zéro erreur et avertissement ; `bun run typecheck`, `bun run test`, `bun run test:e2e`, `bun run build` réussis. `git diff --check` propre. Auditer les six lignes de matrice contre les tests exécutés. E2E standard prouve le parcours public, pas l'authentification réelle. Revue indépendante des changements, correction des constats confirmés avant clôture.


### Preuves d’implémentation — 8 octobre 2026

- Domaine conservé : aucune garde, formule, borne, exclusion ni contrat numérique modifié. Tests de calcul renforcés à 157 cas ; les objets d’entrée sont figés dans les contrôles transversaux et les parcours de matrice pour détecter une mutation.
- Résumé annoncé par le canal poli et atomique existant ; `Alert` composé comme groupe nommé et `FieldError` sans canal d’alerte indépendant. Liens de correction composés avec `Button`, rôle lien explicite, activation empêchant la navigation au fragment et plaçant le focus sur le champ demandé. Reprise neutre conditionnelle aux champs concernés et à la disponibilité de la méthode.
- Vérifications finales depuis `app/` : `bun run check` exit 0, zéro erreur/avertissement (154 fichiers) ; `bun run typecheck` exit 0 ; `bun run test` 358 tests sur 21 fichiers réussis ; `bun run test:e2e` 17 scénarios réussis, dont 12 calculateur ; `bun run build` exit 0. `git diff --check` propre.
- Premier lancement E2E interrompu après diagnostic : prébundlage Vite initial échoué sur un import dynamique et rôle bouton de Base UI découvert sur les ancres composées. Rôle corrigé dans le produit ; relance complète réussie. Le serveur secondaire a encore journalisé un import dynamique initial lors de son démarrage, sans échec de son scénario. Build : avertissements de directives `use client` issus de dépendances Base UI/rolldown, sans diagnostics Biome.
- Accessibilité vérifiée dans le DOM et au clavier avec Chromium ; aucune vérification réelle de lecteur d’écran ou certification revendiquée. E2E standard public, aucune validation de l’authentification réelle. Revue indépendante et statut final pris en charge par l’agent parent.

| Ligne de matrice | Preuves exécutées |
|---|---|
| Syntaxe FR | Chaque vecteur AD-12 appliqué aux trois champs ; normalisation du profil complet virgule/point ; erreurs brutes et correction au clavier en E2E. |
| Domaines et IMC | Tous vecteurs canoniques de bornes et IMC ; domaine garde passée distinct du succès global ; IMC global sans champ invalide artificiel en E2E. |
| Choix et exclusion | Tous vecteurs choix/exclusion, motifs uniquement documentaires ; huit couples coefficient/PAL avec oracles énergétiques exacts ; priorité des trois choix et refus non/incertain dans le navigateur. |
| Priorité et cible | Vecteurs disponibilité, syntaxe/exclusion et exclusion/IMC ; domaines avant choix ; cible incohérente avant répartition avant minimum ; matrice canonique ratios/minimum. |
| Reprise accessible | Erreurs numériques simultanées ordonnées, associations ARIA, canal unique, focus maintenu à la soumission puis déplacé à l’activation du lien, URL sans fragment, brouillon brut et quatre résultats de référence retrouvés. |
| Obsolescence et retour | Six scénarios résultat→changement→retour→refus→retour→correction ; invalidation immédiate et calcul explicite, état refusé conservé ; contrôles URL/cookies/stockage/requêtes et protections avant hydratation. |
