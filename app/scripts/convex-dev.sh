#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
tmp_root="$PWD/.convex-tmp"
mkdir -p "$tmp_root"

if ! command -v flock >/dev/null 2>&1; then
  echo 'convex:dev nécessite flock (util-linux) pour protéger les sessions actives.' >&2
  exit 1
fi

# Keep this lock file: removing it would let concurrent sessions lock different inodes.
exec 9>"$tmp_root/.sessions.lock"

clean_sessions() {
  # Only directories owned by this wrapper are eligible for removal.
  local session
  for session in "$tmp_root"/session.*; do
    if [[ -d "$session" && ! -L "$session" ]]; then
      rm -rf -- "$session"
    fi
  done
}

# An exclusive lock means no managed Convex process is using these directories.
if flock -n -x 9; then
  clean_sessions
fi
flock -s 9

cleanup() {
  # Close rather than unlock: surviving children must retain their shared lock.
  exec 9>&-
  exec 8>"$tmp_root/.sessions.lock"
  if flock -n -x 8; then
    clean_sessions
  fi
  exec 8>&-
}
trap cleanup EXIT

export CONVEX_TMPDIR
CONVEX_TMPDIR=$(mktemp -d "$tmp_root/session.XXXXXXXXXX")

convex dev "$@" &
convex_pid=$!

stop_convex() {
  local signal=$1 status=$2
  trap '' INT TERM
  kill -s "$signal" "$convex_pid" 2>/dev/null || true
  wait "$convex_pid" 2>/dev/null || true
  exit "$status"
}
trap 'stop_convex INT 130' INT
trap 'stop_convex TERM 143' TERM

status=0
wait "$convex_pid" || status=$?
exit "$status"
