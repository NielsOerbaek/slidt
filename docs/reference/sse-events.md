# SSE Events Reference

The agent endpoint `POST /api/decks/:id/agent` returns `text/event-stream`. Each event is:

```
data: <JSON>\n\n
```

## Event types

### `text`
Streaming text delta from the assistant.
```json
{"type": "text", "delta": "Hello, "}
```

### `tool_start`
Agent is calling a tool.
```json
{"type": "tool_start", "tool": "patch_slide", "toolUseId": "toolu_abc123"}
```

### `tool_done`
Tool call completed.
```json
{
  "type": "tool_done",
  "tool": "patch_slide",
  "toolUseId": "toolu_abc123",
  "result": "ok",
  "undoPatch": { "slideId": "...", "before": {} }
}
```

The `undoPatch` field is present for reversible operations. If the result starts with `"error"`, the operation failed.

### `done`
Stream finished. No payload.
```json
{"type": "done"}
```

### `error`
Agent-level error.
```json
{"type": "error", "message": "Rate limit exceeded"}
```

## Consuming via CLI

```bash
# Default streaming
pnpm slidt agent chat <deckId> --message "..."

# NDJSON (one event per line on stdout)
pnpm slidt agent chat <deckId> --message "..." --json | jq .

# Quiet (text only, no tool noise)
pnpm slidt agent chat <deckId> --message "..." --quiet
```

See also: [CLI: agent](../cli/agent.md)
