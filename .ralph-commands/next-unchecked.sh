#!/usr/bin/env bash
# Print the next up to 8 unchecked checkbox lines from Plan 1.
set -euo pipefail
PLAN="docs/superpowers/plans/2026-04-23-01-core-renderer.md"
grep -n '^- \[ \]' "$PLAN" | head -8 || true
