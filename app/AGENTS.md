## Vérification obligatoire

Avant de terminer une modification dans `app/`, exécuter `bun run check`
depuis ce répertoire et corriger tous les diagnostics jusqu’à obtenir zéro
erreur et zéro avertissement, avec un code de sortie égal à 0.
Ne pas désactiver de règle, ajouter de suppression ou exclure un fichier pour
contourner un diagnostic. Le script `check` doit conserver l’option
`--error-on-warnings` pour rendre les avertissements bloquants.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
