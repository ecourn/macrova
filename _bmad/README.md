# Runtime BMad du projet

Les scripts, la configuration et les personnalisations de ce répertoire sont
versionnés. Les sources des skills sont installées dans l’environnement de
l’agent ; elles ne sont pas fournies par `_bmad/render/`.

## Générations locales

`render/` contient des snapshots immuables et leurs éventuelles sauvegardes.
Leurs chemins absolus et leur namespace sont liés au checkout et aux skills
installés. Ce répertoire est donc ignoré par Git. Le retrait du suivi réalisé
par la story 1.6 conserve les fichiers locaux utilisés par les sessions en cours.

Dans un nouveau checkout, installer les skills BMad nécessaires selon leur
procédure d’installation, puis invoquer le skill souhaité. Son `SKILL.md`
déclenche le générateur du projet avec les chemins absolus locaux :

```bash
uv run --no-cache "{project-root}/_bmad/scripts/render_skill.py" --project-root "{project-root}" --skill "{skill-root}"
```

Remplacer les deux paramètres par la racine de ce checkout et le répertoire
du skill installé. Lire le `workflow.md` indiqué par la sortie. Ne pas réutiliser
un snapshot provenant d’une autre machine, ni modifier les fichiers générés ;
les changements de comportement passent par les personnalisations BMad.

Les plans et journaux de `_bmad-output/` restent versionnés comme preuves.
Les chemins d’anciens snapshots cités dans ces documents sont des références
historiques, pas des points d’entrée exécutables dans un nouveau checkout.
Un nouveau rendu fournit les instructions actuelles ; il ne restitue pas à
l’identique les instructions d’une ancienne version du skill.
