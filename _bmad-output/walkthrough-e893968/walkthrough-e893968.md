# Walkthrough du commit e893968

Cible : `e893968caf1d5f89198ffa1a41d75bbf7790ba88`.

Initiative : non définie.

Parcours clos · six blocs acceptés.

## Bloc 1 — Intention

- [x] Accepté par délégation · inchangé pendant la revue

L’intention ci-dessous est reproduite verbatim depuis la section [Intent du plan](../initiative-macrova/epic-calculateur/story-finaliser-le-parcours-mobile-clavier-et-navigation-plan.md#intent).

**Problem:** Le parcours instrumenté de 2.5 doit être finalisé pour le mobile et le clavier, sans perdre les saisies ni rendre l'estimation dépendante du réseau. Les sélecteurs possèdent des choix très longs, les boutons ont une hauteur fixe shadcn et les focus sont partiellement translucides.

**Approach:** Corriger la composition shadcn et les styles publics, vérifier les annonces et erreurs, puis établir des preuves reproductibles à 320 px, en agrandissement et pour le retour de navigation. Réutiliser le calcul et la session mémoire existants.

## Bloc 2 — Vue d’ensemble

- [x] Accepté par délégation · inchangé pendant la revue

L’entrée du parcours est [calculateur.tsx](../../app/src/routes/calculateur.tsx#L211), qui compose le formulaire et présente l’estimation. L’édition des cibles est portée par [calculator-target-editor.tsx](../../app/src/components/calculator-target-editor.tsx), qui organise la saisie, la prévisualisation et la confirmation. Les règles visuelles publiques sont regroupées dans [styles.css](../../app/src/styles.css#L180). Les parcours reproductibles sont décrits dans [calculator.spec.ts](../../app/tests/e2e/calculator.spec.ts#L576).

## Bloc 3 — Saisie et édition au clavier

- [x] Accepté par délégation · inchangé pendant la revue

Le formulaire et l’éditeur composent les primitives [FieldSet et FieldLegend](../../app/src/components/ui/field.tsx). Dans [l’éditeur](../../app/src/components/calculator-target-editor.tsx#L106), les associations `edit-field-error` et `edit-value-error` distinguent le choix du champ et sa valeur ; les liens du résumé mènent au contrôle concerné. Le [gestionnaire Échap](../../app/src/components/calculator-target-editor.tsx#L68) appartient à la section entière d’édition. La [fermeture](../../app/src/components/calculator-target-editor.tsx#L55) capture l’état de prévisualisation avant `update` pour restaurer le focus du déclencheur, et la notice live accompagne les changements d’état.

## Bloc 4 — Mobile et focus

- [x] Accepté par délégation · inchangé pendant la revue

Les choix compacts de [calculateur.tsx](../../app/src/routes/calculateur.tsx#L211) gardent leurs descriptions complètes à proximité, associées par `aria-describedby`. Les règles de [styles.css](../../app/src/styles.css#L180) donnent aux boutons publics une hauteur adaptative et une cible minimale de 44 px ; le focus public repose sur un indicateur opaque. Ces éléments relient lisibilité des choix, réagencement des actions et repérage du contrôle actif.

## Bloc 5 — Navigation et autonomie

- [x] Accepté par délégation · inchangé pendant la revue

[index.tsx](../../app/src/routes/index.tsx) place le focus sur le titre à l’arrivée sur l’accueil. La session du calculateur reste en mémoire dans [router.tsx](../../app/src/router.tsx). Les scénarios de [retour historique](../../app/tests/e2e/calculator.spec.ts#L752) et de [réagencement](../../app/tests/e2e/calculator.spec.ts#L671) complètent les parcours de [calculator.spec.ts](../../app/tests/e2e/calculator.spec.ts), dont le fonctionnement hors ligne ; [calculator-failure.spec.ts](../../app/tests/e2e/calculator-failure.spec.ts) décrit l’indisponibilité 503 et les enveloppes minimales de mesure.

## Bloc 6 — Périphérie

- [x] Accepté par délégation · inchangé pendant la revue

Le [README](../../app/README.md) donne les commandes et les conditions des parcours de vérification. La [recette d’accessibilité du calculateur](../../app/docs/recette-calculateur-accessibilite.md) détaille les manipulations et leurs limites. Le [plan de la story](../initiative-macrova/epic-calculateur/story-finaliser-le-parcours-mobile-clavier-et-navigation-plan.md) relie intention, contraintes et critères d’acceptation.
