#!/usr/bin/env bash
# Count unchecked checkboxes in the current active plan. Prints the count.
set -euo pipefail
PLAN="$(.ralph-commands/get-current-plan.sh)"
if [[ -n "$PLAN" && -f "$PLAN" ]]; then
  count=$(grep -c '^- \[ \]' "$PLAN" 2>/dev/null) || count=0
  echo "$count"
else
  echo 0
fi
