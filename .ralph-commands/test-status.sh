#!/usr/bin/env bash
# Tail of current test output, or a placeholder if the project isn't scaffolded yet.
set -euo pipefail
if [[ -f package.json ]]; then
  # Ensure pnpm is available (corepack-activated pnpm lives via node)
  if command -v pnpm >/dev/null 2>&1; then
    pnpm test 2>&1 | tail -20 || true
  else
    echo "(pnpm not yet on PATH)"
  fi
else
  echo "(project not scaffolded yet — Task 1 will scaffold it)"
fi
