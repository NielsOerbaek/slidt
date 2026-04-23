#!/usr/bin/env bash
# Start the autonomous ralph loop for slidt Plan 1.
# Runs under tmux so it survives SSH disconnection.
#
# Usage (from /opt/slidt):
#   ./start-ralph.sh          # attach to the session if already running
#   ./start-ralph.sh --fresh  # kill existing session and start over
#
# Stop: tmux kill-session -t slidt-ralph
# Monitor in-app: via happy (session shows up automatically)
# Inspect iteration logs: ls /opt/slidt/.ralph-logs

set -euo pipefail

SESSION="slidt-ralph"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$REPO_DIR/.ralph-logs"

if [[ "${1:-}" == "--fresh" ]]; then
  tmux kill-session -t "$SESSION" 2>/dev/null || true
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session '$SESSION' already exists. Attaching (Ctrl-b d to detach)."
  exec tmux attach -t "$SESSION"
fi

mkdir -p "$LOG_DIR"

# IS_SANDBOX=1 lets claude CLI run in --yolo mode under root
# -d 5      : 5s pause between iterations (don't hammer API on transient errors)
# -t 1800   : 30-minute timeout per iteration (a task should finish well under)
# -l …      : per-iteration stream-json logs for after-the-fact debugging
tmux new-session -d -s "$SESSION" -c "$REPO_DIR" \
  "IS_SANDBOX=1 ralph run . -d 5 -t 1800 -l '$LOG_DIR' 2>&1 | tee -a '$LOG_DIR/loop.log'"

echo "Started ralph loop in tmux session '$SESSION'."
echo "  Attach:   tmux attach -t $SESSION"
echo "  Detach:   Ctrl-b d (while attached)"
echo "  Kill:     tmux kill-session -t $SESSION"
echo "  Logs:     tail -f $LOG_DIR/loop.log"
echo "  Mobile:   open the happy app — sessions show up automatically"
