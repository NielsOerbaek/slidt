# Agent

> **CLI equivalent:** See [cli/agent.md](../cli/agent.md)

## Opening the agent

Press **Cmd+K** (or **Ctrl+K**) to toggle the agent drawer. It sits at the bottom of the deck editor.

## Sending a message

Type in the compose box and press **Cmd+Enter** to send.

## What the agent can do

The agent uses tools to manipulate the deck:
- Add, edit, delete, and reorder slides
- Create custom slide templates
- Update theme tokens
- Inspect rendered templates via screenshots
- Fetch URLs for context

See [SSE Events Reference](../reference/sse-events.md) for the full event stream.

## Undo history

Every tool action in the current session appears in the undo panel above the compose box. Click **UNDO** next to any action to reverse it. Actions above the undone entry are also removed from the stack.

Undo resets on page reload.

## Cross-session memory

The agent remembers tool calls and their results across page reloads on the same deck. This allows multi-session workflows where you continue a conversation from where you left off.

## Prompting tips

- Be specific about slide content and order
- Reference existing slides by title
- Ask the agent to validate its own output: "Check the current slide renders correctly"
- Use themes to guide tone: "In a professional Danish style, add..."

See also: [SSE Events Reference](../reference/sse-events.md)
