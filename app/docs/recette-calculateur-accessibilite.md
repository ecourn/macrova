# Recette locale du calculateur — 9 octobre 2026

Cette recette couvre le parcours public construit, sans activation publique ni
validation de l'authentification réelle. Elle ne constitue pas un audit complet
WCAG ni une validation clinique de la méthode.

Depuis `app/`, lancer `bun run check`, `bun run typecheck`, `bun run test`,
`bun run test:e2e` puis `bun run build`. Playwright démarre les serveurs locaux
3001/3002 et un backend synthétique 503 sur 3999. Aucun backend distant requis.
Les tests significatifs restent dans `tests/e2e/calculator.spec.ts` et
`tests/e2e/calculator-failure.spec.ts`.

## Parcours reproductibles et preuves

| Cas | Vérification |
| --- | --- |
| Clavier | Focus sur le titre à l'entrée, Tab parcourt âge, taille, poids, coefficient, PAL, éligibilité puis calcul. Entrée active calcul, prévisualisation et confirmation. Les erreurs ont un seul résumé live poli, sans alerte concurrente ; les liens ciblent le contrôle correspondant sans fragment d'URL. |
| Édition | Champ absent : erreur près du sélecteur et description liée à celui-ci ; valeur invalide : erreur liée à la valeur. La cible précédente reste affichée. Confirmation, annulation et Échap depuis la prévisualisation restaurent son déclencheur. Réinitialisation et annulation sont annoncées. |
| Mobile | Viewport 320 × 740, états initial, erreur de profil, résultat, erreur d'édition, prévisualisation et confirmation. `scrollWidth <= 320`, contrôles et actions dans le viewport, surfaces tactiles ≥ 44 × 44 px, hauteur de contenu des boutons égale à leur hauteur disponible. |
| Agrandissement | Même parcours à 320 px avec taille racine 32 px (texte ×2), dont mesure canvas de chaque option fermée pour vérifier sa largeur utile ; les actions reviennent à la ligne et grandissent. Les sélecteurs gardent des libellés compacts ; toutes les descriptions complètes sont consultables à proximité et liées par `aria-describedby`, y compris le PAL très actif. |
| Navigation | Accueil puis retour historique à chaque état brouillon, prévisualisation, refus : focus au titre, saisies et état retrouvés, aucune confirmation fictive de perte. Retour par liens couvert aussi. Rechargement efface la mémoire. |
| Panne et confidentialité | SSR public avec backend 503 ; calcul/confirmation locaux. Hors ligne après chargement : signal affiché, calcul et édition utilisables. Seules les intentions réussies émettent une enveloppe minimale ; navigation/historique n'en émettent pas. Pas de profil dans cookies, URL ou stockages navigateur, ni de cookie/referrer dans le transport facultatif. |

Recette complémentaire navigateur local (port 3016) : axe-core 4.12.1 limité à
`.public-page`, états initial, résultat et prévisualisation, zéro violation et
zéro cas incomplet détectés. À 320 px, taille racine 200 % et candidat P=110 :
largeur de document 320 px, aucun descendant hors viewport, six boutons sans
texte coupé. Capture temporaire inspectée :
`/tmp/macrova-2-6-preview-320-text200.png` (preuve de session, non versionnée).

Le focus inspecté par Playwright utilise un contour opaque `#24543D`, 2 px et
4 px de décalage, sans ombre translucide, sur les liens, boutons, saisies,
sélecteurs, titres focalisables et summaries. La navigation active est soulignée
et verte ; les surfaces secondaires sont blanches avec bordure permanente.

## Zoom navigateur réel à 200 %

Recette complémentaire exécutée avec Chrome for Testing 154.0.8037.92 et
agent-browser 0.38.2. Une extension locale temporaire Manifest v3, permission
`tabs`, appelle `chrome.tabs.setZoom(tabId, 2)` après chargement des seules pages
`http://127.0.0.1:3016/`. Lancement avec `--extension <dossier>` et
`--args "--no-sandbox,--headless=new"` ; serveur Vite avec cache isolé
`E2E_VITE_CACHE_DIR=node_modules/.vite-recipe-2-6`.

Viewport navigateur 640 × 1480 : `innerWidth=320`, `innerHeight=740`,
`devicePixelRatio=2`, taille racine inchangée `16px`, CSS `zoom=1`.
Ces observations distinguent le véritable zoom de l'augmentation de texte CSS.
Calcul de référence 30 ans / 175 cm / 70 kg / +5 / PAL 1,6 / éligible :
2638,00 kcal/jour. Refus d'édition sans champ, correction vers protéines 110 g,
prévisualisation puis confirmation activés au clavier. À la prévisualisation,
`scrollWidth=312 <= 320`, aucun descendant public hors viewport, tous les
contrôles, liens et summaries au moins 44 × 44 pixels CSS, aucun contenu de
bouton coupé. Captures temporaires de session inspectées :
`/tmp/macrova-2-6-zoom200-preview.png` et
`/tmp/macrova-2-6-zoom200-viewport.png` ; aucune capture versionnée.

## Contraste des tokens rendus

Rapports calculés selon la luminance relative sRGB, arrondis à deux décimales.
Le test lit également la couleur CSS effectivement appliquée au focus.

| Premier plan / fond | Rapport |
| --- | ---: |
| Texte `#202923` / crème `#FAF8F3` | 14,10:1 |
| Secondaire `#526057` / crème | 6,24:1 |
| Secondaire / blanc `#FFFFFF` | 6,63:1 |
| Erreur `#A12B28` / crème | 6,84:1 |
| Blanc / action `#24543D` | 8,71:1 |
| Bordure `#747E75` / crème | 3,97:1 |
| Focus `#24543D` / crème | 8,21:1 |
| Focus / résultat `#F0EEE7` | 7,50:1 |

## Limites

Le viewport réduit et l'augmentation des rem des tests E2E prouvent un
équivalent de réagencement ; la recette navigateur ci-dessus vérifie séparément
le zoom réel. Un parcours avec lecteur d'écran et restitution audio reste à réaliser.
Les associations accessibles et régions live vérifiées ne prouvent pas une
lecture audio effective. Les menus natifs dépendent du navigateur et du système ;
les descriptions visibles évitent de dépendre de leur capacité à afficher des
options longues. Aucun simulateur ne prouve le comportement d'un clavier
virtuel réel. Axe complète ces preuves sans certifier la conformité.
