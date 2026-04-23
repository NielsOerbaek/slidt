#!/usr/bin/env bash
# Print the header of the first Task that has any unchecked checkbox.
set -euo pipefail
PLAN="docs/superpowers/plans/2026-04-23-01-core-renderer.md"
awk '/^### Task/{t=$0} /^- \[ \]/{print t; exit}' "$PLAN"
