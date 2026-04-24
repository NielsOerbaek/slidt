# slidt 🎞️

> *AI-assisted presentation tooling for Os & Data — because great decks shouldn't require a developer.*

A browser-based slide editor with live preview, one-click PDF export, and a Claude-powered agent that builds, edits, and styles decks on demand. Built by the team, for the team.

---

## The platform

### Deck editor with live preview

<img src="docs/screenshots/deck-editor.png" alt="Deck editor" width="100%" />

Form-driven slide editing on the left, live rendered preview on the right. Same TypeScript renderer runs in the browser and in Node for PDF export — zero duplication.

---

### AI agent drawer

<img src="docs/screenshots/agent-open.png" alt="Agent chat drawer open" width="100%" />

Press **Ctrl+K** to open the agent. Describe what you need — *"Add a title slide and three content slides about cooperative governance"* — and watch it build the deck in real time. Every tool call is listed in the undo stack above the compose box, so you can reverse anything.

---

### Decks list

<img src="docs/screenshots/decks-list.png" alt="Decks list" width="100%" />

All your decks at a glance. **DUP** deep-copies a deck (slides, theme, and custom templates). Decks shared with you appear in a separate "Shared with me" section.

---

### Theme editor

<img src="docs/screenshots/theme-editor.png" alt="Theme editor" width="100%" />

Themes are collections of CSS design tokens — colors, typography, borders — that control every slide. Each theme also carries an **agent system prompt** that shapes how Claude talks and writes when that theme is active.

---

<table>
<tr>
<td align="center" width="50%">
  <img src="docs/screenshots/login.png" alt="Login screen" width="100%" />
  <sub>Log ind</sub>
</td>
<td align="center" width="50%">
  <img src="docs/screenshots/admin.png" alt="Admin panel" width="100%" />
  <sub>Admin — user management</sub>
</td>
</tr>
</table>

---

## Features

- **Live preview** — browser renderer and PDF renderer share one pure-TS function
- **AI agent** — Claude builds decks, rewrites content, invents slide templates, and tweaks themes; all reversible via the session undo stack
- **Collaborators** — invite colleagues by email with editor or viewer access
- **Deck duplication** — deep-copy with slides, theme, and deck-scoped templates
- **API-first** — everything the UI does, the CLI does too (`pnpm slidt ...`)
- **Theme system** — design-token palettes with per-theme agent system prompts
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
