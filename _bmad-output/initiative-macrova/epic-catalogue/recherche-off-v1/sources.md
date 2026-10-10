# Recherche OFF — sources recontrôlées le 10 octobre 2026

Story 3.2, base de travail `5957dbc7fba582638f7bc7060620ca540bbaddcd`.
Consultation primaire en lecture seule ; aucune contribution ni communication externe.

- [Référence Search-a-licious](https://openfoodfacts.github.io/search-a-licious/users/ref-openapi/) : API 0.1.0, `/search` GET ou POST, texte `q`, langues `langs`, taille et projection `fields`. Retenir exclusivement ce service texte, sans fallback legacy ; champs en CSV pour GET, suivant la correction de projection de l’audit 3.1.
- [Documentation OFF](https://openfoodfacts.github.io/openfoodfacts-server/api/) : v2 concerne la recherche structurée, pas le texte libre. User-Agent identifiant l’application requis. Les quotas publiés pour Product Opener sont 10 recherches et 15 lectures produit par minute/IP ; ce document ne garantit pas un quota spécifique Search-a-licious. Le plafond déploiement Macrova reste plus conservateur (8/12), avec suspension 429/503. Les sorties cloud peuvent partager une IP : le plafond déploiement ne prouve aucun quota IP.
- La documentation recommande staging pour les essais applicatifs ; les tests répétables de cette story utilisent des fixtures sans OFF. Le contrôle réel est une observation ponctuelle explicite de la source publique, séparée des simulations ; aucune disponibilité permanente déduite.
- [Licences OFF](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side/) : attribution à Open Food Facts, base [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/), contenus [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/). Aucune image utilisée. Les conditions d’ouverture publique restent à vérifier dans l’epic 9 selon les limites du dossier [audit 3.1](../audit-off-v1/sources.md).

## Observation de démarrage

`observation-demarrage.json` conserve URL/paramètres, date UTC, statut,
User-Agent et SHA-256 du corps dans `observation-demarrage.body.json`.
Le 10 octobre à 09:41:07 UTC, `flocons avoine` a reçu HTTP 200 et trois hits
(3560071006587, 3250391896554, 8710398169594). Cette observation est distincte
du futur appel applicatif Convex ; aucune nutrition, base ou fraîcheur d’index
n’est déduite du seul statut 200. La date d’index peut être ancienne.

La cible de recette est un backend cloud **dev** propre à cette story,
`dev/catalogue-story-3-2` (`dashing-opossum-58`), avec origine frontend locale
`http://localhost:3000`. Elle préserve le backend du socle Render et n’active
aucun frontend public. Les secrets sont exclusivement dans Convex ; les URL
locales figurent dans `.env.local`, ignoré par Git. Droit de test serveur,
comptes synthétiques et observation réelle sont consignés dans la vérification.
