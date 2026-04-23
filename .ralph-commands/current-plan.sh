#!/usr/bin/env bash
# Show which plan is currently active (has unchecked tasks).
set -euo pipefail
PLAN="$(.ralph-commands/get-current-plan.sh)"
if [[ -n "$PLAN" ]]; then
  echo "$PLAN"
else
  echo "(none — all existing plans complete)"
fi
