#!/usr/bin/env bash
# Return the path of the first numbered plan file that has unchecked tasks.
# Searches in plan-number order (01, 02, ...). Prints nothing if all are done.
set -euo pipefail

for plan in docs/superpowers/plans/20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*.md; do
  [[ -f "$plan" ]] || continue
  if grep -q '^- \[ \]' "$plan" 2>/dev/null; then
    echo "$plan"
    exit 0
  fi
done
# No plan with unchecked tasks found
exit 0
