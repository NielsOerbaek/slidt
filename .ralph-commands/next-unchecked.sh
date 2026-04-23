#!/usr/bin/env bash
# Print the next up to 8 unchecked checkbox lines from the current active plan.
set -euo pipefail
PLAN="$(.ralph-commands/get-current-plan.sh)"
[[ -z "$PLAN" ]] && exit 0
grep -n '^- \[ \]' "$PLAN" | head -8 || true
