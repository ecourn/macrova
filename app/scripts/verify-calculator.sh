#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
app_root=$PWD
for dependency in bun flock setsid tar cp ps; do
  command -v "$dependency" >/dev/null || { echo "Commande requise : $dependency" >&2; exit 1; }
done
[[ -d node_modules ]] || { echo 'Installer les dépendances avant la recette.' >&2; exit 1; }
# Inode conservé ; les enfants héritent du verrou jusqu'à leur arrêt.
exec 9>node_modules/.calculator-verification.lock
run_root=$(mktemp -d "${TMPDIR:-/tmp}/macrova-calculator.XXXXXXXX")
chmod 700 "$run_root"
echo "Journaux privés : $run_root"
exec > >(tee -a "$run_root/recipe.log") 2>&1
flock -n 9 || { echo 'Une recette calculateur est déjà active.'; exit 1; }
phase_pid=''
child_groups() {
  local parent=$1 child group
  while read -r child group; do
    [[ -n "$child" ]] || continue
    child_groups "$child"
    [[ "$child" == "$group" ]] && echo "$group"
  done < <(ps -o pid=,pgid= --ppid "$parent")
  return 0
}
stop_phase() {
  if [[ -n "$phase_pid" ]]; then
    # Playwright peut créer des sessions distinctes pour ses webServer.
    # Capturer exclusivement les groupes descendants avant d'arrêter le parent.
    local groups group
    groups=$(child_groups "$phase_pid")
    for group in $groups "$phase_pid"; do
      kill -TERM -- "-$group" 2>/dev/null || true
    done
    for attempt in {1..20}; do
      kill -0 -- "-$phase_pid" 2>/dev/null || break
      sleep 0.1
    done
    for group in $groups "$phase_pid"; do
      kill -KILL -- "-$group" 2>/dev/null || true
    done
    wait "$phase_pid" 2>/dev/null || true
    phase_pid=''
  fi
}
cleanup() {
  local recipe_status=$?
  stop_phase
  # Retirer seulement les copies volumineuses des dépendances ; garder preuves,
  # sources, caches privés, rapports et build, même après échec.
  rm -rf -- "$run_root/app/node_modules" "$run_root/app-failure/node_modules"
  echo "Fin recette : code $recipe_status"
}
trap cleanup EXIT
trap 'echo "Arrêt demandé : INT"; exit 130' INT
trap 'echo "Arrêt demandé : TERM"; exit 143' TERM
# Un bind double pile refuse aussi les listeners IPv4, sans les arrêter.
bun -e '
const { createServer } = require("node:net");
for (const port of [3001, 3002, 3999]) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", () => reject(new Error(`Port réservé indisponible : ${port}`)));
    server.listen({ port, host: "::", exclusive: true }, () => server.close(resolve));
  });
}
'
mkdir "$run_root/app"
tar --exclude='./node_modules' --exclude='./.env*' --exclude='*/.env*' \
  --exclude='./.output' --exclude='./.tanstack' --exclude='./.nitro' \
  --exclude='./dist' --exclude='./build' --exclude='./coverage' \
  --exclude='./test-results' --exclude='./playwright-report' \
  --exclude='./.convex-tmp' --exclude='./.git' \
  -cf - . | tar -xf - -C "$run_root/app"
# Copie des dépendances installées : reflinks si disponibles, sinon copie réelle.
# Les répertoires et écritures Vite/Nitro restent privés, sans lien hors du root.
cp -a --reflink=auto "$app_root/node_modules" "$run_root/app/node_modules"
for cache in .vite .vite-temp .vite-public-failure .cache; do
  rm -rf -- "$run_root/app/node_modules/$cache"
done
rm -f -- "$run_root/app/node_modules/.calculator-verification.lock"
# Chaque Vite a aussi ses propres artefacts TanStack/Nitro et dépendances.
cp -a --reflink=auto "$run_root/app" "$run_root/app-failure"
cd "$run_root/app"
run_phase() {
  local phase=$1 command=$2 status=0
  echo "Début $phase : $(date -u +%FT%TZ)"
  # Environnement fermé : aucun .env, URL Convex, compte auth ou mode distant.
  setsid env -i PATH="$PATH" HOME="$HOME" CI= \
    E2E_CALCULATOR_ISOLATED=1 \
    E2E_VITE_CACHE_DIR="$run_root/cache-$phase" \
    E2E_FAILURE_VITE_CACHE_DIR="$run_root/cache-failure" \
    E2E_FAILURE_APP_DIR="$run_root/app-failure" \
    bash -c 'set -o pipefail; bun run "$1" 2>&1 | tee "$2"' \
    recipe "$command" "$run_root/$phase.log" &
  phase_pid=$!
  wait "$phase_pid" || status=$?
  stop_phase
  echo "Fin $phase : code $status, $(date -u +%FT%TZ)"
  return "$status"
}
run_phase e2e test:e2e
# Le build ne commence qu'après arrêt complet de la phase E2E.
run_phase build build
echo "Recette réussie. Artefacts et journaux conservés dans $run_root"
