# slidt 🎞️

> *AI-assisted presentation tooling for Os & Data — because great decks shouldn't require a developer.*

A browser-based slide editor with live preview, one-click PDF export, and a Claude-powered agent that builds, edits, and styles decks on demand. Built by the team, for the team.

---

## What it looks like

<table>
<tr>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/title.png" alt="Title slide" />
  <sub><b>Title</b></sub>
</td>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/content.png" alt="Content slide" />
  <sub><b>Content</b></sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/agenda.png" alt="Agenda slide" />
  <sub><b>Agenda</b></sub>
</td>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/section.png" alt="Section divider" />
  <sub><b>Section divider</b></sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/principles.png" alt="Principles slide" />
  <sub><b>Principles</b></sub>
</td>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/values.png" alt="Values slide" />
  <sub><b>Values</b></sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/closing.png" alt="Closing slide" />
  <sub><b>Closing</b></sub>
</td>
<td align="center" width="50%">
  <img src="tests/visual/snapshots/friction.png" alt="Friction slide" />
  <sub><b>Friction</b></sub>
</td>
</tr>
</table>

13 built-in slide types · custom templates on demand · antal-theta Swiss-terminal palette

---

## Features

- **Live preview** — see your deck render as you type, same renderer in browser and PDF export
- **AI agent** — chat with Claude to build entire decks, rewrite content, invent new slide types, and tweak themes — all reversible via the undo stack
- **Collaborators** — invite colleagues by email with editor or viewer roles
- **Deck duplication** — deep-copy a deck with all slides, theme, and custom templates
- **API-first** — everything the UI can do, the CLI can do too (`pnpm slidt ...`)
- **Theme system** — design token–based palettes with per-theme agent system prompts
- **PDF export** — Playwright-rendered at 1920×1080, pixel-perfect

---

## What it is

slidt replaces an existing CLI-based slide generator (Python + Handlebars-ish templates + headless Chromium) with a browser app that non-developers can actually use. You edit decks through a form-driven UI, see live preview as you type, and export to PDF. A side-panel agent handles theme tweaks, content rewrites, and can even invent new slide types on demand.

Same renderer runs in the browser (preview) and in Node (PDF export) — one pure TypeScript function, no duplication.

## Why

The current tool works, but only one person can run it. Adding a slide type means editing Python, CSS, and JSON by hand. Colleagues can't draft decks without pulling in a developer. slidt fixes that while keeping the output quality we already have.

---

## Architecture

```
┌─────────────────────────┐
│ Browser                 │
│  • Form editor          │
│  • TS renderer (preview)│
│  • Agent chat           │
└────────────┬────────────┘
             │ HTTPS
┌────────────▼─────────────┐
│ SvelteKit app (Node)     │
│  • API + auth            │
│  • TS renderer (PDF)     │
│  • Playwright            │
│  • Claude API (streaming)│
└────────────┬─────────────┘
             │
       ┌─────▼─────┐
       │ Postgres  │
       │ (Drizzle) │
       └───────────┘
```

Single `docker-compose.yml` on one VPS: `app`, `postgres`, `caddy` (TLS). Assets live on a mounted volume.

**Stack:** TypeScript, SvelteKit, Postgres + Drizzle, Handlebars, Playwright, Claude API (Sonnet 4.6), Docker Compose.

---

## Docs

Full documentation lives in [`docs/`](docs/README.md):

| | |
|---|---|
| [Getting Started](docs/guide/getting-started.md) | First login, first deck, first agent prompt |
| [Decks](docs/guide/decks.md) | Duplicate, share, collaborate, export |
| [Agent](docs/guide/agent.md) | Chat, undo history, cross-session memory |
| [CLI Setup](docs/cli/README.md) | `SLIDT_API_KEY`, all commands |
| [Collaborator Roles](docs/reference/collaborators.md) | owner / editor / viewer matrix |
| [SSE Events](docs/reference/sse-events.md) | Agent streaming event schema |

---

## Deploy

### Prerequisites

- A Linux VPS with Docker + Docker Compose v2 installed.
- A domain name pointed at the VPS (for TLS via Let's Encrypt).
- `rclone` configured with an `onedrive` remote (for backups).
- An `ANTHROPIC_API_KEY` for the agent feature.

### First deploy

```sh
# 1. Clone the repo
git clone https://github.com/your-org/slidt.git /opt/slidt
cd /opt/slidt

# 2. Copy the env template and fill in your values
cp .env.example .env
$EDITOR .env          # set SESSION_SECRET, POSTGRES_PASSWORD, ANTHROPIC_API_KEY, APP_HOST/APP_URL

# 3. Create data directories
mkdir -p data/pg data/assets data/backups

# 4. Build + start (first run also runs migrations and seeds slide types)
docker compose up -d --build

# 5. Create the first admin user
docker compose exec app pnpm tsx scripts/create-user.ts admin@example.com "Admin" "s3cr3t" --admin

# 6. Verify the stack
curl https://YOUR_DOMAIN/healthz
# → {"status":"ok","db":"ok"}
```

### Importing an existing deck

If you have a `slides.json` that matches the renderer `Deck` shape:

```sh
docker compose exec app pnpm import-deck /path/to/slides.json --owner admin@example.com
```

The JSON format:
```json
{
  "title": "My Deck",
  "lang": "da",
  "slides": [
    { "typeName": "title",   "data": { "title": "Hello" } },
    { "typeName": "content", "data": { "bullets": ["Point A", "Point B"] } }
  ]
}
```

Available `typeName` values (seeded on first start): `title`, `agenda`, `content`, `principles`, `values`, `reserve`, `purposes`, `section`, `ownership`, `friction`, `discussion`, `closing`, `appendix-list`.

### Updating

```sh
git pull
docker compose up -d --build
# Migrations and seed run automatically on container start.
```

### Backups

Set up a daily cron job on the host:

```sh
crontab -e
# Add:
0 2 * * * cd /opt/slidt && ./scripts/backup.sh >> /var/log/slidt-backup.log 2>&1
```

Each backup creates a `data/backups/slidt-YYYYMMDD-HHMMSS.tar.gz` containing a Postgres dump + all uploaded assets. The script then uploads it to `onedrive:slidt-backups` and keeps the 7 most recent archives locally.

### Health check

`GET /healthz` returns:

```json
{ "status": "ok", "db": "ok" }
```

If `db` is anything other than `"ok"` the database is unreachable. The HTTP status is always 200 so uptime monitors still get a valid response.

### Reset a password

```sh
docker compose exec app pnpm tsx scripts/reset-password.ts user@example.com newpassword
```

---

## Development

Requires Node 20+ and pnpm (via corepack).

```sh
pnpm install
docker compose --profile test up -d   # start postgres-test only
pnpm test
pnpm typecheck
pnpm dev
```

The `postgres-test` service runs on port 5433. Set `DATABASE_URL=postgresql://slidt:slidt@localhost:5433/slidt_test` in a `.env.test` for integration tests.

---

## Naming

"slidt" is Danish for *worn out*. It's also a slide tool. Make of that what you will.
