# Vérification story 3.2 — 10 octobre 2026

Révision de départ : `5957dbc7fba582638f7bc7060620ca540bbaddcd`.
Code du diff courant, dépendances installées par `bun install --frozen-lockfile`.
Le dossier [sources](sources.md) conserve le recontrôle documentaire et le corps
de l’observation ponctuelle de démarrage, avec empreinte.

## Recette réelle sur cible isolée

Backend `h-michelpique:macrova:dev/catalogue-story-3-2`, déploiement
`dashing-opossum-58`, créé pour ce travail. `SITE_URL=http://localhost:3000`,
secret propre au backend et variables OFF configurées côté Convex.
Synchronisation `bun run convex:dev --once` réussie à 09:42 UTC,
avant utilisation du frontend local `bun run dev`. Le backend historique Render
n’a pas été modifié. Aucun frontend public publié, aucun push.

Navigateur Chromium 155 via agent-browser (session propre à la story).
Les outils preview T3 status/open ont explicitement déclaré le navigateur
indisponible dans cet environnement headless. Le navigateur local a nécessité
`--no-sandbox` dans le conteneur après diagnostic ; aucun contournement auth.

Un compte exclusivement synthétique a été créé depuis `/login` par le vrai
formulaire Better Auth. Le propriétaire a été lu par administration du composant,
puis un droit v1 enabled avec échéance une heure a été importé dans la table
entitlements de ce backend dédié. Aucun droit accordé par API publique, aucun
JWT d’identité simulée. Adresse/identifiant/mot de passe/cookies exclus des preuves
versionnées ; fichier temporaire des credentials protégé, non versionné.

| Procédure | Attendu | Observé |
|---|---|---|
| Inscription puis lien Aliments depuis dashboard | Session réelle, écran privé | Inscription réussie, `/dashboard` puis `/aliments` |
| Saisir « flocons avoine » sans soumettre ; lire le nombre de travaux côté admin | Aucun appel OFF | Zéro catalogueJobs avant soumission |
| Cliquer Rechercher | Action Convex réelle et résultat OFF | Dix hits à 09:44:08 UTC ; résultat normalisé conservé dans [resultat-convex.json](resultat-convex.json), sans participant/propriétaire |
| Ouvrir premier détail | Référence, valeurs, dates, limites | Produit 3560071006587 Carrefour ; P 12 g, G 59 g, L 6.6 g, 363 kcal ; base ambiguë ; index 16/12/2024, consultation 10/10/2026 ; aucune relecture produit annoncée |
| Mobile 320 × 800 | Aucun débordement horizontal | innerWidth = scrollWidth = 320 ; champ et boutons visibles |
| Analyse axe wcag2a/wcag2aa sur détail | Aucun défaut détecté | axe-core 4.12.1 : 0 violations, 0 incomplet, 25 passes |
| Tab depuis détail | Navigation clavier sans piège | Focus passe au lien produit OFF |
| Hors ligne puis reconnexion | Saisie conservée, soumission bloquée hors ligne | « flocons avoine » conservé ; disabled true puis false ; message hors ligne visible ; aucune reprise automatique |
| Nouveau navigateur anonyme sur `/aliments` | Refus SSR | Redirection `/login` |
| Révoquer session via POST sign-out puis rouvrir `/aliments` | Session refusée | POST 200 ; redirection `/login` |

Limites : observation ponctuelle de disponibilité, sans garantie future ni
complétude nutritionnelle ; dix hits sur une page, index ancien visible. Le
détail est celui du hit Search-a-licious, pas une lecture v3.6. L’axe automatisé
et Tab ne certifient pas WCAG ni un essai lecteur d’écran/appareil réel.
Les changements HMR durant construction ont nécessité de rouvrir la page ;
ils ne sont pas une preuve du serveur compilé. Les tests réseau déterministes
et les refus session expirée/droits/fermeture sont vérifiés séparément par
fixtures, jamais présentés comme requêtes OFF réelles.

Attribution des réponses conservées : données [Open Food Facts](https://world.openfoodfacts.org),
base [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/),
contenus [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/).
Les liens produits sont présents dans les snapshots. Aucune image reprise.

## Vérifications locales finales

- `bun run test` : 28 fichiers, 509 tests réussis, zéro skip.
- `bun run typecheck` : sortie 0.
- `bun run check` : 180 fichiers, zéro erreur/avertissement, sortie 0.
- `bun run build` : client/SSR réussis, sortie 0 ; avertissements dépendances Base UI/Rolldown conservés, aucun diagnostic check.
- Replay recherche et produit : identiques aux classifications 3.1 ; tests audit et contrôle implémenteur réussis.
- `E2E_VITE_CACHE_DIR=node_modules/.vite-catalogue-e2e bun run test:e2e catalogue.spec.ts --project chromium` : trois tests réussis, zéro skip, 21.9 secondes. Vérifie absence d’appel à la frappe, soumissions concurrentes et réponse ancienne ignorée, détail/retour au clavier/mobile avec focus sur le titre puis restauré sur le résultat, hors ligne et reconnexion sans appel automatique. Harness du composant de production sur Vite, aucune route de test livrée ; uniquement en mode Vite, pas dans E2E_COMPILED.
- Premier essai E2E : échec du harness lors de reload d’optimisation et import CJS/cache React incompatible. Correction : attendre hydratation puis importer React depuis la même projection Vite que le composant. Réexécution positive ci-dessus, attentes métier inchangées.
- Synchronisation backend finale à 09:48 UTC : `bun run convex:dev --once`, sortie 0.

## Revue et couverture de la matrice

Revue quick indépendante du diff complet, nouveaux fichiers inclus. Un constat
medium a été vérifié : disparition du contrôle focalisé lors de l’ouverture du
détail et du retour. Patch local : focus sur titre h2 puis restauration sur le
bouton du résultat ; assertions E2E positives. Aucun constat différé. Après ce
patch, les 509 tests, typecheck, check, build et les trois E2E ci-dessus ont été
réexécutés avec succès.

| Ligne du plan | Preuve répétable |
|---|---|
| Recherche sur soumission | E2E catalogue : zéro appel à la frappe, appel explicite ; recette réelle ci-dessus |
| Vide / panne | Domaine catalogue et Convex catalogue : hits vide, erreurs source, HTTP, JSON invalide, timeout borné sans retry |
| Normalisation | Domaine catalogue et replay audit-off : null/zéro, dates, précision, unités/modificateurs, base/état et obsolètes |
| Accès | Convex catalogue : refus session/droit/fermeture avant réseau et remise ; panne backend originale conservée ; recette anonyme/révocation |
| Concurrence | Convex catalogue : deux actions en vol/un fetch, participants isolés, huit appels/neuvième refus, frontière glissante, nouvelle soumission sans cache |
| Suspension | Convex et domaine catalogue : 429/503, global intercomptes, secondes/date/repli, garde avant fetch, aucun retry |
| Réponse tardive / hors ligne | E2E catalogue : ancienne réponse ignorée, saisie conservée, reconnexion sans appel automatique |

Les fixtures déterministes ne constituent pas des appels réels au service OFF.
