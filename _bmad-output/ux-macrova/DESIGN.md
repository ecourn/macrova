---
name: Macrova
description: Identité visuelle sobre pour ajuster et retrouver ses repas habituels.
status: final
updated: 2026-10-02
sources:
  - ../spec-macrova/spec-macrova.md
  - ../spec-macrova/regles-repas.md
  - ../spec-macrova/decisions-lancement.md
  - ../brief-macrova/brief-macrova.md
  - ../brief-macrova/addendum.md
colors:
  background: '#FAF8F3'
  surface: '#FFFFFF'
  surface-muted: '#F0EEE7'
  text: '#202923'
  text-secondary: '#526057'
  primary: '#24543D'
  on-primary: '#FFFFFF'
  border: '#747E75'
  divider: '#DADDD5'
  focus: '#24543D'
  error: '#A12B28'
  warning: '#765012'
typography:
  title:
    fontFamily: 'system-ui, sans-serif'
    fontSize: 28px
    fontWeight: '650'
    lineHeight: '1.2'
  body:
    fontFamily: 'system-ui, sans-serif'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'system-ui, sans-serif'
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.4'
  meta:
    fontFamily: 'system-ui, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  number:
    fontFamily: 'system-ui, sans-serif'
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.25'
rounded:
  sm: 6px
  md: 12px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  gutter: 16px
  page-max: 1120px
components:
  Navigation:
    foreground: '{colors.text}'
    active: '{colors.primary}'
  Action:
    background: '{colors.primary}'
    foreground: '{colors.on-primary}'
    radius: '{rounded.sm}'
  Champ:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.sm}'
  Aliment:
    background: '{colors.surface}'
    radius: '{rounded.md}'
  Portion:
    border: '{colors.border}'
    radius: '{rounded.sm}'
  Bilan:
    background: '{colors.surface-muted}'
    foreground: '{colors.text}'
  Repas:
    background: '{colors.surface}'
    radius: '{rounded.md}'
  Message:
    foreground: '{colors.text-secondary}'
    error: '{colors.error}'
  Confirmation:
    background: '{colors.surface}'
    radius: '{rounded.md}'
  Offre:
    background: '{colors.surface}'
    foreground: '{colors.text}'
  Paramètre:
    foreground: '{colors.text}'
    border: '{colors.divider}'
---

## Brand & Style

[ASSUMPTION] Identité calme, chaleureuse et utilitaire, retenue par délégation. Fond crème, vert profond, chiffres lisibles et langage factuel rendent la composition compréhensible. Ces choix restent révisables après observation. Les primitives UI utilisent les composants shadcn locaux de `app/src/components/ui`, par composition et variantes adaptées aux tokens de ce document ; les composants ci-dessous forment le vocabulaire métier partagé avec [EXPERIENCE.md](EXPERIENCE.md).

Les contrats UX sont finalisés ; leur statut ne certifie pas la préparation au lancement. Les décisions produit des sources priment. Les deux contrats priment sur toute future maquette en cas de conflit.

## Colors

| Token | Usage |
|---|---|
| `{colors.background}` | Fond de page crème |
| `{colors.surface}` | Surfaces de saisie et repas |
| `{colors.surface-muted}` | Regroupement de résultats |
| `{colors.text}` | Texte principal et valeurs |
| `{colors.text-secondary}` | Provenance, unités, indications secondaires |
| `{colors.primary}`, `{colors.on-primary}` | Action principale et texte associé |
| `{colors.border}` | Limites des champs et contrôles |
| `{colors.divider}` | Séparation décorative sans information exclusive |
| `{colors.focus}` | Contour de focus |
| `{colors.error}`, `{colors.warning}` | Erreur et point à vérifier, toujours accompagnés de texte |

Objectif de contraste : 4,5:1 pour texte courant sur background, surface ou surface-muted ; 3:1 pour grands textes, limites fonctionnelles et focus. L'association on-primary/primary suit 4,5:1. Ces objectifs sont des critères d'implémentation ; aucune certification n'est revendiquée. Les écarts nutritionnels restent en couleur de texte : rouge et vert ne qualifient pas un repas comme bon ou mauvais.

## Typography

Corps en `{typography.body.fontFamily}` ; titres `{typography.title.fontSize}` ; unités et provenance `{typography.meta.fontSize}`. Les résultats utilisent `{typography.number.fontSize}` et des chiffres tabulaires. Chaque chiffre conserve son unité et son intitulé. Éviter les capitales sur les phrases, les labels tronqués et le texte incorporé aux images. Les tailles doivent suivre les réglages du navigateur.

## Layout & Spacing

Une colonne mobile ; largeur maximale `{spacing.page-max}`. Marges `{spacing.gutter}`, espaces internes `{spacing.4}`, regroupements `{spacing.5}`, sections `{spacing.6}`. À partir de 768 px, la composition peut afficher aliments et bilan côte à côte en conservant l'ordre logique. Le bilan vient après les portions dans l'ordre de lecture. Les contrôles tactiles ont une zone de 44 × 44 px minimum. Aucun pied fixe ne masque les actions ou le clavier.

Toutes les surfaces de l'architecture d'information sont décrites dans les contrats uniquement, sans maquette à ce stade. Ce choix autonome est explicite ; aucune référence visuelle externe ne complète les règles.

## Elevation & Depth

La hiérarchie vient des titres et des espacements. Surfaces mates, séparations fines ; ombre légère réservée à Confirmation lorsqu'elle recouvre le contenu. Ne pas multiplier les panneaux emboîtés.

## Shapes

`{rounded.sm}` pour actions et saisie ; `{rounded.md}` pour Aliment, Repas et Confirmation. Les états ne changent pas la géométrie. Icônes simples avec libellés visibles ; aucune mascotte ou illustration nécessaire pour comprendre un résultat.

## Components

| Composant | Règles visuelles |
|---|---|
| Navigation | Liens lisibles, actif souligné et en primary ; libellé visible pour chaque destination. |
| Action | Principale primary/on-primary ; secondaire surface/text avec border ; danger texte error avec intitulé explicite. Focus extérieur visible, état indisponible expliqué. |
| Champ | Label au-dessus, saisie puis aide/unité puis erreur ; border permanent, focus renforcé, erreur textuelle sans déplacement du label. |
| Aliment | Nom puis marque éventuelle, état, base, source et date ; quatre valeurs alignées avec libellés. Absence écrite « Manquant », zéro écrit « 0 ». |
| Portion | Quantité et unité en tête ; verrou visible avec son état ; bornes et pas dans une zone détaillée accessible. |
| Bilan | Protéines, glucides, lipides, calories nommés ; cible, obtenu et écart alignés ; statut écrit avant les valeurs. |
| Repas | Nom, quantités, date choisie et totaux ; actions nommées distinctes de la consultation. |
| Message | Titre factuel, raison et action ; error pour donnée invalide, warning pour information à vérifier ; jamais couleur seule. |
| Confirmation | Titre, conséquence, résumé et deux actions clairement distinctes ; largeur adaptée aux petits écrans. |
| Offre | Prix et périodicité ensemble, périmètre et conditions lisibles avant action ; aucune option précochée ou faux compte à rebours. |
| Paramètre | Intitulé, état ou valeur, action textuelle ; export, suppression et résiliation restent identifiables. |

## Do's and Don'ts

| Faire | Éviter |
|---|---|
| Conserver source, état et unité près de l'aliment | Cacher une donnée manquante derrière un chiffre |
| Montrer les écarts signés en texte neutre | Culpabilisation, score de santé, séries et récompenses |
| Donner de l'espace aux portions et à la confirmation | Réduire les labels pour densifier l'écran |
| Présenter l'abonnement après la démonstration | Recouvrir le résultat gratuit d'une demande de paiement |
