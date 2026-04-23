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

**Stack:** TypeScript, SvelteKit, Postgres + Drizzle, Handlebars, Playwright, Claude API (Sonnet 4.6 + Opus 4.7), Docker Compose.

## Roadmap

Six independent subsystems, each shipping on its own:

1. **Core renderer + template system** — pure-TS `render(deck, theme, templates) → HTML`, Handlebars helpers, field validation, scoped CSS, 13 seeded SlideTypes. *(in progress)*
2. **Data model + API + auth** — Postgres schema, CRUD endpoints, email/password with argon2id, asset uploads.
3. **Editor UI** — form editor, live preview, slide list with drag-reorder, agent chat shell.
4. **PDF export** — Playwright rendering, appendix stitching, font preloading, visual regression.
5. **Agent** — Claude integration, structured tool use, Handlebars-AST guardrails, per-call undo.
6. **Migration + deployment** — `import-deck` CLI, Docker Compose stack, backups, `/healthz`.

See [`docs/superpowers/plans/2026-04-23-roadmap.md`](docs/superpowers/plans/2026-04-23-roadmap.md) for the full breakdown.

## Status

Early. The repo currently contains the design spec, the roadmap, and Plan 1 (core renderer) — the renderer itself is being built task-by-task in an autonomous loop (see `RALPH.md`). Once Plan 1 lands, subsequent plans will be written and executed in sequence.

## Docs

- **Design spec:** [`docs/superpowers/specs/2026-04-23-slide-webservice-design.md`](docs/superpowers/specs/2026-04-23-slide-webservice-design.md) — scope, data model, agent design, deferred items.
- **Roadmap:** [`docs/superpowers/plans/2026-04-23-roadmap.md`](docs/superpowers/plans/2026-04-23-roadmap.md) — subsystem breakdown and sequencing.
- **Plan 1:** [`docs/superpowers/plans/2026-04-23-01-core-renderer.md`](docs/superpowers/plans/2026-04-23-01-core-renderer.md) — executable task-by-task plan for the renderer.

## Development

Requires Node 20+ and pnpm (via corepack). Once Task 1 of Plan 1 scaffolds `package.json`:

```sh
pnpm install
pnpm test
pnpm typecheck
```

## Naming

"slidt" is Danish for *worn out*. It's also a slide tool. Make of that what you will.
