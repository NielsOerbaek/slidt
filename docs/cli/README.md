# CLI Setup

> **GUI equivalent:** See [guide/getting-started.md](../guide/getting-started.md)

## Installation

The CLI is bundled with the slidt project. Run via:
```bash
pnpm slidt <command>
# or
tsx scripts/slidt.ts <command>
```

## Authentication

Set your API key (create one at `/settings` or via `slidt key create`):

```bash
export SLIDT_API_KEY=slidt_<your-key>
```

Or pass per-command:
```bash
pnpm slidt deck list --api-key slidt_<key>
```

## Base URL

```bash
export SLIDT_URL=https://your-slidt-instance.example.com
# default: http://localhost:3000
```

## Global flags

| Flag | Description |
|---|---|
| `--api-key <key>` | Override SLIDT_API_KEY |
| `--url <url>` | Override SLIDT_URL |

## Commands

| Command | Description |
|---|---|
| [deck](deck.md) | Deck CRUD + duplicate + collaborators |
| [slide](slide.md) | Slide CRUD + reorder |
| [theme](theme.md) | Theme CRUD + validate |
| [template](template.md) | Template CRUD + validate |
| [agent](agent.md) | Chat with streaming output modes |
| [key](key.md) | API key management |
| [export](export.md) | PDF export |
| health | Check server status |
