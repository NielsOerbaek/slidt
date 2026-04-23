# slidt

A web-based slide editor with live preview, PDF export, and a Claude-powered agent — built for the Os & Data internal team.

## What it is

slidt replaces an existing CLI-based slide generator (Python + Handlebars-ish templates + headless Chromium) with a browser app that non-developers can actually use. You edit decks through a form-driven UI, see live preview as you type, and export to PDF. A side-panel agent handles theme tweaks, content rewrites, and can even invent new slide types on demand.

Same renderer runs in the browser (preview) and in Node (PDF export) — one pure TypeScript function, no duplication.

## Why

The current tool works, but only one person can run it. Adding a slide type means editing Python, CSS, and JSON by hand. Colleagues can't draft decks without pulling in a developer. slidt fixes that while keeping the output quality we already have.

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

## Roadmap

Six independent subsystems:

1. **Core renderer + template system** — pure-TS `render(deck, theme, templates) → HTML`, Handlebars helpers, field validation, scoped CSS, 13 seeded SlideTypes.
2. **Data model + API + auth** — Postgres schema, CRUD endpoints, email/password with argon2id, asset uploads.
3. **Editor UI** — form editor, live preview, slide list with drag-reorder, agent chat shell.
4. **PDF export** — Playwright rendering, appendix stitching, font preloading, visual regression.
5. **Agent** — Claude integration, structured tool use, Handlebars-AST guardrails, per-call undo.
6. **Migration + deployment** — `import-deck` CLI, Docker Compose stack, backups, `/healthz`.

See [`docs/superpowers/plans/2026-04-23-roadmap.md`](docs/superpowers/plans/2026-04-23-roadmap.md) for the full breakdown.

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
docker compose exec app pnpm tsx scripts/create-user.ts admin@example.com "Admin" "s3cr3t"

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

## Naming

"slidt" is Danish for *worn out*. It's also a slide tool. Make of that what you will.
