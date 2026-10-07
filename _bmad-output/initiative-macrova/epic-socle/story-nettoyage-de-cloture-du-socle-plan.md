---
title: 'Nettoyage de clôture du socle'
type: 'chore'
ticket: 6
created: '2026-10-07'
status: done
baseline_revision: 'ef544fba0e211a47b3d497428ccfc807ca9cb6d1'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['AGENTS.md', '_bmad/README.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** La revue de 1.1 a différé la portabilité des snapshots BMad : 45 fichiers générés suivis contiennent des chemins propres au checkout. Le registre des reports de 1.7 conserve les étapes historiques sans résolution finale de la livraison HTTPS prouvée par 1.5.

**Approach:** Traiter ces deux dettes de clôture tracées : ignorer `_bmad/render/`, retirer ses générations et sauvegardes du suivi Git en conservant les fichiers locaux et documenter la régénération depuis les skills installés. Ajouter au registre une résolution finale sourcée, en préservant toutes les entrées historiques. Les plans de 1.2/1.3/1.4/1.5/1.8 ne conservent aucun défaut applicatif établi : aucun refactoring arbitraire ne sera ajouté.

**Contraintes :** Garder scripts, configuration, personnalisations et preuves versionnés. Ne pas éditer les snapshots immuables, les tickets, les contrats produit ni le code applicatif. Aucun déploiement ou push. L’utilisateur délègue les choix et la poursuite ; approbation et choix final sont pris à sa place.

**Acceptation :** Étant donné un nouveau checkout, lorsqu’un skill BMad est invoqué avec ses chemins locaux, alors son snapshot est généré pour ce checkout et reste ignoré par Git. Étant donné le registre historique, lorsqu’il est consulté après clôture, alors chaque report du socle a une résolution traçable vers sa preuve, sans perte d’historique ni déclaration de validation produit.

</frozen-after-approval>

## Implementation Notes

Investigation indépendante des plans et du code terminée. Route oneshot : nettoyage mécanique de générations et documentation, moins de 100 lignes nouvelles. `.gitignore` racine absent ; créer une règle ciblée. Le générateur incorpore volontairement la racine canonique au namespace et au manifeste ; changer son moteur serait inutile. Les anciens liens des plans restent des traces historiques ; la documentation expliquera leur usage. Plan retenu selon la délégation explicite.

## Plan Change Log

## Review Triage Log

Revue quick indépendante du diff intégral, incluant les nouveaux fichiers et les 45 retraits du suivi : aucun constat (high=0, medium=0, low=0, false=0, maybe-false=0). Aucun élément différé. Les revues approfondies sont omises sur cette route documentaire oneshot.

## Verification

- Vérifier zéro fichier suivi sous `_bmad/render/`, règle Git effective et présence inchangée du workflow local actif.
- Exercer le rendu via son API Python dans deux racines temporaires avec le skill installé : namespace, manifeste et liens locaux propres à chaque racine ; nettoyer ces copies ensuite.
- Depuis `app/` : `bun run test`, `bun run typecheck`, `bun run check` (zéro erreur/avertissement), `bun run build`.
- `git diff --check` et revue quick indépendante de tout le diff, nouveaux fichiers inclus.

Résultats : 173/173 tests, typecheck sortie 0, check sur 144 fichiers sans diagnostic, build client/SSR/Nitro sortie 0. Les avertissements du bundler sur les directives des dépendances sont préexistants, aucun fichier applicatif modifié. Rendu exercé dans deux checkouts temporaires : namespaces distincts, réutilisation immuable, empreintes et références opérationnelles valides, générations ignorées. Le premier contrôle de liens était trop large (il traitait aussi un glob de plans comme un fichier) ; contrôle corrigé pour les références exécutables du snapshot, puis réussi. Tous les liens ajoutés au registre sont valides. Zéro snapshot suivi ; workflow actif toujours présent.

Contrôle final : les 45 fichiers retirés du suivi restent présents localement et identiques octet pour octet à HEAD. Aucun script ne dépend d’une génération versionnée. `git diff HEAD --check` réussit. Nettoyage entièrement livré et revu ; statut Build `built`, sans modification du ticket tree selon les instructions du workflow.
