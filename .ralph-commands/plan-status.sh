#!/usr/bin/env bash
# Count unchecked checkboxes in Plan 1. Prints the count.
set -euo pipefail
PLAN="docs/superpowers/plans/2026-04-23-01-core-renderer.md"
if [[ -f "$PLAN" ]]; then
  grep -c '^- \[ \]' "$PLAN" || echo 0
else
  echo 0
fi
