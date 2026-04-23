#!/usr/bin/env bash
# Show status of all 6 roadmap plans: NOT WRITTEN, IN PROGRESS, or COMPLETE.
set -euo pipefail

declare -a PLANS=(
  "01-core-renderer:Plan 1 — Core renderer + template system"
  "02-data-api-auth:Plan 2 — Data model + API + auth"
  "03-editor-ui:Plan 3 — Editor UI"
  "04-pdf-export:Plan 4 — PDF export"
  "05-agent:Plan 5 — Agent"
  "06-migration-deployment:Plan 6 — Migration + deployment"
)

for entry in "${PLANS[@]}"; do
  slug="${entry%%:*}"
  name="${entry#*:}"
  # Find any file matching *-<slug>.md in the plans dir
  file=$(ls docs/superpowers/plans/*-"${slug}".md 2>/dev/null | head -1 || true)
  if [[ -z "$file" ]]; then
    echo "[ NOT WRITTEN  ] $name"
  else
    count=$(grep -c '^- \[ \]' "$file" 2>/dev/null) || count=0
    if [[ "$count" -gt 0 ]]; then
      echo "[ IN PROGRESS  ] $name  ($count unchecked steps in $file)"
    else
      echo "[   COMPLETE   ] $name"
    fi
  fi
done
