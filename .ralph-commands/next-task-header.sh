#!/usr/bin/env bash
# Print the header of the first Task that has any unchecked checkbox in the current active plan.
set -euo pipefail
PLAN="$(.ralph-commands/get-current-plan.sh)"
[[ -z "$PLAN" ]] && exit 0
awk '/^### Task/{t=$0} /^- \[ \]/{print t; exit}' "$PLAN"
