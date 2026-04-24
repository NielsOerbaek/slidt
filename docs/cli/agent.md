# CLI: agent

> **GUI equivalent:** See [guide/agent.md](../guide/agent.md)

## Commands

```bash
# Send a message and stream the response (default)
pnpm slidt agent chat <deckId> --message "Add a title slide"

# Suppress tool noise (text only to stdout)
pnpm slidt agent chat <deckId> --message "..." --quiet

# NDJSON output — one JSON object per event line
pnpm slidt agent chat <deckId> --message "..." --json

# Buffer output — print all text at once when done
pnpm slidt agent chat <deckId> --message "..." --no-stream

# View agent history (use web UI for full history)
pnpm slidt agent history <deckId>
```

## Output modes

| Flag | stdout | stderr |
|---|---|---|
| (default) | streamed text deltas | tool start/done lines |
| `--quiet` | streamed text deltas | silent |
| `--no-stream` | buffered full response | tool start/done lines |
| `--quiet --no-stream` | buffered full response | silent |
| `--json` | NDJSON (one event per line) | silent |

## NDJSON event types

See [SSE Events Reference](../reference/sse-events.md) for the full event schema.

## Agent capabilities

The agent can: add/edit/delete/reorder slides, create templates, update theme tokens, inspect rendered slides, fetch URLs.

**Never ask the agent to put HTML in content fields** — plain text only.
