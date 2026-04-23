# Slide webservice — design

**Date:** 2026-04-23
**Author:** Niels (niels@ogtal.dk) with Claude
**Status:** Design — awaiting implementation plan

## Context

The current slide-generation tool (in `møde_bilag/antal-diskussion-april-2026/slides/`) is a CLI:
`slides.json` → `generate.py` (13 Python template functions) → `index.html` + `styles.css` → headless Chromium → PDF, with `pdfunite` stitching appendix PDFs on the end. It works, but:

- Only Niels can run it (local shell, Python, Chromium, custom fonts).
- Adding a new slide type means editing Python, CSS, and JSON by hand.
- Non-technical Os & Data colleagues can't edit decks without a developer involved.
- There is no safe place for an LLM to help with drafting or theming.

This spec describes a web-based replacement: a browser editor with live preview and PDF export, plus a Claude-powered agent that can tweak themes, help with content, and invent new slide types.

## Key decisions (locked in during brainstorming)

| # | Question | Decision |
|---|---|---|
| 1 | Who is this for? | Os & Data internal team (7 users) |
| 2 | What should the agent do? | Theme tweaking + content help + new slide-type generation |
| 3 | How are slide types defined? | Declarative JSON fields + Handlebars HTML template + scoped CSS (no executable code) |
| 4 | How does editing feel? | Form-driven editor (fields per slide type) + live preview + side-panel agent chat |
| 5 | Where do decks live? | Service-owned database (not Git / not filesystem) |
| 6 | Theme scope? | Os & Data brand variants + 2–3 neutral presets for client-facing decks |
| 7 | Architecture? | TypeScript full-stack — SvelteKit + Postgres, renderer runs in both browser (preview) and Node (PDF) |
| 8 | Auth (v1)? | Email + password, seeded via CLI (7 users provided by admin). Google SSO deferred to v2 |

## Architecture

```
┌─────────────────────────┐
│ Browser                 │
│  • Form editor          │
│  • TS renderer (preview)│
│  • Agent chat           │
└────────────┬────────────┘
             │ HTTPS
┌────────────▼────────────┐
│ SvelteKit app (Node)    │
│  • API + auth           │
│  • TS renderer (PDF)    │
│  • Playwright           │
│  • Claude API (streaming)│
└─────┬───────────────┬───┘
      │               │
┌─────▼─────┐    ┌────▼───┐
│ Postgres  │    │ MinIO  │
│ (Drizzle) │    │ (S3)   │
└───────────┘    └────────┘
```

Single `docker-compose.yml` with `app`, `postgres`, `minio`, and `caddy` (TLS reverse proxy). All five services run on one VPS.

The renderer is a **pure TypeScript function** `render(deck, theme, templates) → HTML`. The exact same function runs in the browser (instant preview) and in the Node server inside Playwright (PDF export). No code duplication — one source of truth.

## Data model (Postgres via Drizzle)

```
User          id, email, passwordHash, name, lastSeenAt
Deck          id, title, lang, ownerId, themeId, updatedAt, slideOrder: uuid[]
Slide         id, deckId, typeId, data: jsonb, orderIndex
SlideType     id, name, label, fields: jsonb, htmlTemplate, css, scope, deckId?
Theme         id, name, tokens: jsonb, scope, deckId?, isPreset
Asset         id, deckId, kind, s3Key, filename, uploadedById
AgentMessage  id, deckId, role, content, toolCalls: jsonb, createdAt
ShareLink     id, deckId, token, createdAt, expiresAt?
Session       id, userId, expiresAt (for cookie-based auth)
```

Key design calls:

- **`SlideType` lives in the DB, not in files.** The 13 existing types are seeded at migration. Agent-invented types live alongside them.
- **`scope: 'global' | 'deck'`** on both `SlideType` and `Theme`. Agent-invented types start deck-scoped; an explicit human action promotes them to global.
- **`Slide.data` is free-form JSONB**, validated at write time against the referenced `SlideType.fields`. Lets slide-type schemas evolve without DB migrations.
- **Agent conversation is per deck**, with tool calls persisted in `AgentMessage.toolCalls` so every agent edit is auditable and undoable.

## Template + rendering spec

**SlideType shape:**

```ts
type SlideType = {
  id: string
  name: string          // "quote-with-photo"
  label: string         // "Quote with photo"
  fields: Field[]       // schema → drives form UI + validation
  htmlTemplate: string  // Handlebars
  css: string           // auto-scoped to .st-<name>
  scope: 'global' | 'deck'
}

type Field =
  | { name, type: 'text' | 'richtext' | 'markdown' | 'bool' | 'select', ... }
  | { name, type: 'image', accept: 'image/*' }
  | { name, type: 'list', items: Field }
  | { name, type: 'group', fields: Field[] }
```

**Template language: Handlebars** (TS + Python implementations exist; sandboxable; no JS execution). Helpers: `{{fmt field}}` runs the existing inline markup (`**bold** → <strong>`, `*em* → <em>`, `\n → <br>`); plus `{{#each}}`, `{{#if}}`, `{{default field "x"}}`, `{{eq a b}}`. No partials.

**Render function pseudocode:**

```ts
function render(deck, theme, templates): string {
  const css = buildStylesheet(theme.tokens, templates)
  const body = deck.slideOrder.map((id, i) => {
    const slide = deck.slides[id]
    const template = templates[slide.typeId]
    validate(slide.data, template.fields)
    const content = handlebars(template.htmlTemplate, slide.data)
    return wrapSlide(content, { pageNum: i+1, total: deck.slideOrder.length })
  }).join('\n')
  return pageShell(deck.lang, deck.title, css, body)
}
```

**Page chrome** (corner logo, `03 / 17` page counter) is added by `wrapSlide` around template output — templates stay focused on slide content only.

**CSS scoping:** each template's CSS is auto-prefixed with `.st-<name>`, so templates can use generic selectors without collisions. Theme tokens are exposed as `:root` custom properties.

**Example — the current `content` slide type as a declarative SlideType:**

```json
{
  "name": "content",
  "label": "Bullet list with title",
  "fields": [
    {"name": "eyebrow", "type": "text"},
    {"name": "title",   "type": "richtext"},
    {"name": "bullets", "type": "list", "items": {"type": "richtext"}, "required": true}
  ],
  "htmlTemplate": "<div class=\"content\">{{#if eyebrow}}<div class=\"eyebrow\">{{fmt eyebrow}}</div>{{/if}}{{#if title}}<h2>{{fmt title}}</h2>{{/if}}<ul>{{#each bullets}}<li>{{fmt this}}</li>{{/each}}</ul></div>",
  "css": "& .content ul { ... }"
}
```

## Agent design

**Model:** Claude Sonnet 4.6 for content rewrites and theme tweaks (fast, cheap). Claude Opus 4.7 for new-slide-type generation (harder reasoning). System prompt + SlideType catalog + theme tokens + brand guide cached with prompt caching.

**Tool surface (structured tool use):**

| Tool | What it does |
|---|---|
| `list_slides` / `get_slide` | Read deck state |
| `patch_slide(id, patch)` | Merge-patch a slide's `data` |
| `add_slide` / `delete_slide` / `reorder_slides` | Structure edits |
| `update_theme(tokens)` | Patch theme custom properties |
| `create_slide_type(spec)` | Create a new `SlideType` (deck-scoped) |
| `list_slide_types` | See what's available |

**Three capability flows:**

1. **Theme tweak.** "More muted." → Agent reads current tokens, proposes new values, calls `update_theme`. Preview updates live via the TS renderer.
2. **Content helper.** "Rewrite bullets on slide 3 tighter." → Agent reads slide, generates new text, calls `patch_slide`. Form updates. User can undo via the action log.
3. **New slide type.** "Make a quote-with-photo layout." → Agent designs fields schema + Handlebars template + CSS referencing theme variables, calls `create_slide_type`. System validates (see guardrails) before saving. Agent optionally inserts a demo slide.

**Guardrails on agent-emitted templates:**
- Parse Handlebars AST; reject any helper not in the allowlist (`fmt`, `each`, `if`, `default`, `eq`).
- CSS parsed; reject `@import`, `url()` pointing off-host, `expression(...)`, `behavior:`. No JavaScript anywhere in the pipeline.
- Dry-run interpolate the template with a dummy data object at creation time to catch syntax errors early.

**Undo:** every tool call logged in `AgentMessage.toolCalls`. Editor shows "Agent did X" entries with a `revert` button that applies the inverse patch. V1: undo last N. Full history browsing deferred.

**Rate limiting:** per-user token/cost budget (e.g. $5/day default), configurable per user. Overages show a banner asking admin for a raise.

## Editor UX detail

**`/decks/[id]` layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│ [ANTAL og Theta]     theme: violet-mood ▾    [share] [export ▾]  │
├─────────┬──────────────────────────┬────────────────┬────────────┤
│ Slides  │ Slide 3 · content        │ Preview        │ Agent      │
│ 1 title │ Eyebrow [Recap]          │  ┌──────────┐  │ msgs       │
│ 2 agen… │ Title   [Hvad er…]       │  │ rendered │  │            │
│►3 content│ Bullets                 │  │ slide    │  │ tool calls │
│ 4 princ…│ ├─ En forening…        ×│  └──────────┘  │ with undo  │
│ 5 value…│ ├─ F.M.B.A. stiftet…   ×│                 │            │
│ + add   │ [+ add bullet]           │                 │ [input] →  │
└─────────┴──────────────────────────┴────────────────┴────────────┘
```

- **Slide list (left, ~240px):** drag to reorder (dnd-kit), right-click menu. "+ add slide" opens a type picker grid with tiny previews of each `SlideType`.
- **Form (middle):** driven by `SlideType.fields`. Widgets per field type: `text → input`, `richtext → textarea with markdown preview`, `list → stacked rows`, `image → drop zone + asset picker`, `group → collapsible fieldset`.
- **Preview (right):** same TS renderer as PDF. Zoom-to-fit single slide or full-deck scroll. 100ms debounce on form changes.
- **Agent chat (right sidebar, ~320px, collapsible):** per-deck thread. Tool calls render as action blocks. Streaming. `Cmd+K` focuses the input.
- **Autosave:** debounced 500ms after form blur. "Saving…" / "Saved just now" indicator.

**Separate screens:**
- `/themes[/:id]` — token sliders/color pickers + live sample slides.
- `/templates[/:id]` — three Monaco panes (fields JSON, Handlebars, CSS) + live preview with dummy data. Used for editing built-ins and reviewing agent-invented types before promoting to global.
- `/decks/[id]/assets` — upload pool, used/unused filter, "appendix PDF" flag (these get stitched to the final PDF).
- `/share/[token]` — read-only view.

## Migration

One-time CLI: `pnpm run import-deck path/to/slides/`

1. Reads `slides.json`, maps each slide 1:1 to the new model.
2. Uploads assets (SVGs, fonts, appendix PDFs) to MinIO.
3. Extracts `:root` custom properties from `styles.css` → creates an "ANTAL-Theta default" `Theme`.
4. Mechanically ports the 13 `tmpl_*` Python functions to seeded `SlideType` rows (Handlebars template + scoped CSS).
5. Renders a PDF and diffs it visually against the current `ANTAL-Theta-slides.pdf`. Any drift is fixed in the seed data, not the renderer.

The existing `build.sh` pipeline keeps working during and after migration — it's a fallback.

## V1 scope

**In scope:**
- Editor (form-driven), live TS preview, PDF export with appendix stitching, share links.
- Agent: theme + content + new slide-type generation, with undo.
- Email/password auth for 7 seeded users. Argon2id hashes. HTTP-only session cookies, 30-day rolling.
- 13 built-in SlideTypes (ported from current deck).
- OD-brand themes + 2–3 neutral presets.
- Asset uploads (images, appendix PDFs). Inter + Neureal fonts shipped.
- Docker Compose deploy to one VPS.

**Out of scope:**
- Real-time co-editing, comments, review mode.
- Full version history UI (only agent-action log).
- PPTX / per-slide PNG export.
- User-uploaded fonts.
- Slide transitions / animations.
- Passive agent suggestions.
- Public signup, Google SSO, email-based password reset.
- Mobile editing.
- Multi-deck operations (batch export, cross-deck search).

## Testing

- **Renderer** (unit): golden-HTML tests — deck fixtures in, expected HTML out. Runs against the shared TS renderer.
- **API** (integration): CRUD + auth + agent tool calls, real Postgres container, Claude API mocked with recorded fixtures.
- **Visual regression** (per SlideType): render each built-in with dummy data, Playwright screenshots vs baseline PNGs.
- **Agent evals**: curated prompt set ("rewrite slide 3 tighter", "muted theme", "quote-with-photo slide type") → assert expected tool calls + basic output shape.

## Deployment + observability

- `docker-compose.yml`: `app`, `postgres`, `minio`, `caddy` (TLS via Let's Encrypt).
- Env: `ANTHROPIC_API_KEY`, `POSTGRES_URL`, `S3_ENDPOINT`/`KEY`/`SECRET`, `APP_URL`, `SESSION_SECRET`.
- Migrations via `drizzle-kit`.
- Structured JSON logs (Pino).
- Per-agent-message token + cost logging so spend is visible per user and per deck.
- `/healthz` endpoint for uptime monitoring.
- PDF rendering inline in the request for v1. If queue pressure emerges, swap in a BullMQ worker in a sidecar container — no API change needed.

## Known unknowns (to resolve during implementation)

- Exact Handlebars helper implementations for `fmt` — the Python regex is specific enough that it needs a careful TS port (unit tests against corpus of existing slides will pin it).
- Playwright font loading on Alpine Linux may be fussy — Debian base image as fallback if needed.
- MinIO signed-URL TTL vs. long PDF renders: signed URLs may expire mid-render on slow deploys. Mitigation: fetch assets to tmp before invoking Playwright, or use path-style addressing inside the container network.
- Handlebars AST parsing for guardrails: pick a library that exposes AST (`handlebars` npm package does; verify the exact API).

## Deferred to v2+

- Google Workspace SSO as an auth option alongside email/password.
- Version history + diff view.
- PPTX export (python-pptx or similar).
- Real-time co-editing (Y.js on the form state).
- Comments / review workflow.
- Public share links with write access (guest collaborators).
- Template marketplace across decks (promoting SlideTypes across tenants — only relevant if scope ever broadens past Os & Data).
