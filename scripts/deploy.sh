#!/usr/bin/env bash
# Deploy the current main of slidt to ig-sub.
#
# Runs locally; SSHes into ig-sub, pulls /opt/slidt, rebuilds the app
# container, and verifies the health endpoint.
#
# Usage:
#   ./scripts/deploy.sh                 # deploy main
#   REMOTE=ig-sub ./scripts/deploy.sh   # override host
#   REMOTE_DIR=/opt/slidt ./scripts/deploy.sh

set -euo pipefail

REMOTE="${REMOTE:-ig-sub}"
REMOTE_DIR="${REMOTE_DIR:-/opt/slidt}"
HEALTH_PATH="${HEALTH_PATH:-/healthz}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3000${HEALTH_PATH}}"

echo "→ Deploying to ${REMOTE}:${REMOTE_DIR}"

ssh "${REMOTE}" bash -se <<EOF
set -euo pipefail
cd "${REMOTE_DIR}"

echo "→ git pull"
# Stash any local edits so a pull never aborts; restoring is a manual choice.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "  · stashing local changes"
  git stash push -u -m "deploy.sh autostash \$(date -Iseconds)"
fi
git pull --ff-only

echo "→ docker compose up -d --build app"
sudo docker compose up -d --build app

echo "→ waiting for healthz"
for i in \$(seq 1 30); do
  if curl -fsS "${HEALTH_URL}" > /dev/null 2>&1; then
    echo "  · healthy after \${i}s"
    exit 0
  fi
  sleep 1
done

echo "  · health check timed out — recent logs:"
sudo docker compose logs --tail=40 app
exit 1
EOF

echo "✓ Deploy complete"
