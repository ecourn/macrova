

> Historique : les obligations d’enquête, de recrutement, de bêta et de résultats commerciaux préalables sont remplacées par [la décision du 10 octobre 2026](change-mvp-sans-enquete/change-mvp-sans-enquete.md). Audit alimentaire et contrôles techniques conservés ; aucune validation utilisateur inventée. Les autres exigences restent applicables.

# Validation du découpage — 2026-10-05

## Périmètre

Initiative Macrova, dix enveloppes d’epics et huit stories du socle. Source : spec-macrova.md, ses compagnons, architecture-app.md, DESIGN.md, EXPERIENCE.md et socle existant décrit dans app/README.md.

## Résultat

Deux validations indépendantes ont contrôlé l’arbre et le socle selon workflow.checks.tree, ticket, set et dependencies. CAP-1 à CAP-8 ont un propriétaire explicite ; les exigences transversales sont attribuées au socle, à l’enquête et à la validation finale. Les epics futurs restent des enveloppes sans stories.

Corrections intégrées : séparer enquête préalable et bêta finale, attendre des capacités techniques plutôt que des résultats observés, phaser autorisation d’ouverture puis collecte et bilan, expliciter le droit de test catalogue et les composants de portions communs, préciser les vérifications intercomptes et fermeture transactionnelle, découper exploitation et publication, fixer le protocole bêta avant invitations. Les remarques formelles finales ont été corrigées.

`tickets.py status` lit dix epics et huit stories planned ; aucun unpinned_after, undeclared_after ou order_conflict. `tickets.py next` désigne 1.1 comme première story prête à démarrer. Aucun ticket n’est déclaré construit ou terminé.

## Hypothèses et limites

La délégation autorise les arbitrages de découpage. Les inconnues scientifiques, réglementaires, fournisseurs et terrain restent documentées avec propriétaires et conditions de reprise. Les accès fournisseurs et observations humaines restent signalés, sans résultat inventé. Le travail porte sur les tickets ; aucun code applicatif n’a été modifié ni testé.

Les fichiers sont enregistrés localement. Aucun commit de publication, envoi à un tracker ou démarrage de construction n’a été effectué ; l’invocation porte sur la préparation des tickets.
