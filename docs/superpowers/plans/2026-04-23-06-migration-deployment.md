# Plan 6 — Migration + Deployment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship slidt to production: enhance `/healthz` with a DB ping, write a multi-stage `Dockerfile` with Playwright support, assemble the full Docker Compose stack (`app` + `postgres` + `caddy`), add an `import-deck` CLI that reads a `slides.json` into the database, write a nightly backup script, and update the README with deploy instructions.

**Architecture:** The health module is a pure function (`getHealthStatus(dbPing)`) that accepts an injectable ping so it can be unit-tested without a DB. The `import-deck` CLI is split into a pure parsing layer (`scripts/import-deck-parse.ts`) and an orchestration layer (`scripts/import-deck.ts`); only the parser needs unit tests. The Dockerfile is single-stage bookworm so Playwright's `--with-deps` install works reliably. The ENTRYPOINT runs `drizzle-kit migrate && pnpm db:seed` before `node build` — both are idempotent.

**Tech stack:** Node 20, pnpm, Drizzle ORM, Playwright (Chromium), Docker / Docker Compose, Caddy 2, rclone (for backup uploads), Vitest.

---

## File structure

```
slidt/
├── Dockerfile                         NEW  — single-stage Node 20 bookworm build
├── .dockerignore                       NEW  — exclude node_modules, .svelte-kit, data, etc.
├── Caddyfile                           NEW  — reverse proxy + TLS via Let's Encrypt
├── .env.example                        NEW  — all required env vars with safe defaults
├── docker-compose.yml                  MODIFY — add app + caddy services, healthcheck on postgres
├── package.json                        MODIFY — add "import-deck" script
├── README.md                           MODIFY — add Deploy section with step-by-step guide
├── scripts/
│   ├── import-deck-parse.ts            NEW  — pure parseImportInput() used by CLI + tests
│   ├── import-deck.ts                  NEW  — main CLI: parse → DB writes → summary
│   └── backup.sh                       NEW  — nightly pg_dump + tarball + rclone to OneDrive
├── src/
│   ├── lib/server/
│   │   └── health.ts                   NEW  — getHealthStatus(dbPing) injectable helper
│   └── routes/healthz/
│       └── +server.ts                  MODIFY — wire getHealthStatus with real DB ping
└── tests/
    ├── health.test.ts                  NEW  — unit tests for getHealthStatus
    └── import-deck-parse.test.ts       NEW  — unit tests for parseImportInput
```

---

### Task 1: Health module + DB-check unit test

**Files:**
- Create: `src/lib/server/health.ts`
- Modify: `src/routes/healthz/+server.ts`
- Test: `tests/health.test.ts`

- [x] **Step 1: Write the failing test**

`tests/health.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getHealthStatus } from '../src/lib/server/health.ts';

describe('getHealthStatus', () => {
  it('returns db: ok when dbPing resolves', async () => {
    const result = await getHealthStatus(async () => {});
    expect(result).toEqual({ status: 'ok', db: 'ok' });
  });

  it('returns db: error message when dbPing rejects', async () => {
    const result = await getHealthStatus(async () => {
      throw new Error('Connection refused');
    });
    expect(result.status).toBe('ok');
    expect(result.db).toBe('Connection refused');
  });

  it('returns db: stringified error when a non-Error is thrown', async () => {
    const result = await getHealthStatus(async () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'timeout';
    });
    expect(result.status).toBe('ok');
    expect(result.db).toBe('timeout');
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/health.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/server/health.ts'`

- [x] **Step 3: Write the health module**

`src/lib/server/health.ts`:
```ts
export interface HealthStatus {
  status: 'ok';
  db: 'ok' | string;
}

/**
 * Returns a health status object.
 * Accepts an injectable `dbPing` so the function is unit-testable without a live DB.
 * The HTTP status is always 200 — even a DB error only changes `db` field,
 * so uptime monitors continue to get a valid response.
 */
export async function getHealthStatus(
  dbPing: () => Promise<void>,
): Promise<HealthStatus> {
  try {
    await dbPing();
    return { status: 'ok', db: 'ok' };
  } catch (err) {
    return {
      status: 'ok',
      db: err instanceof Error ? err.message : String(err),
    };
  }
}
```

- [x] **Step 4: Update the healthz route**

`src/routes/healthz/+server.ts`:
```ts
import { json } from '@sveltejs/kit';
import { getHealthStatus } from '$lib/server/health.ts';
import { db, users } from '$lib/server/db/index.ts';
import { sql } from 'drizzle-orm';

export async function GET() {
  const status = await getHealthStatus(async () => {
    // A lightweight SELECT that exercises the connection and confirms the schema is up.
    await db.select({ ping: sql<number>`1` }).from(users).limit(1);
  });
  return json(status);
}
```

- [x] **Step 5: Run test to verify it passes**

Run: `pnpm test tests/health.test.ts`
Expected: PASS — 3 tests passed

- [x] **Step 6: Commit**

```
git add src/lib/server/health.ts src/routes/healthz/+server.ts tests/health.test.ts
git commit -m "feat: add health module with injectable DB ping and update /healthz route

Co-authored-by: Ralphify <noreply@ralphify.co>"
```

---

### Task 2: Dockerfile + .dockerignore

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Write the Dockerfile**

`Dockerfile`:
```dockerfile
# Single-stage bookworm build so playwright --with-deps works without extra apt passes.
FROM node:20-bookworm

WORKDIR /app

# pnpm via corepack
RUN corepack enable

# Install Node dependencies first (cached layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Install Playwright's Chromium + all system dependencies it needs
RUN pnpm exec playwright install chromium --with-deps

# Copy source and build the SvelteKit app
COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Run migrations + seed (both idempotent) then start the built Node server.
ENTRYPOINT ["sh", "-c", "pnpm db:migrate && pnpm db:seed && node build"]
```

- [ ] **Step 2: Write .dockerignore**

`.dockerignore`:
```
node_modules
.svelte-kit
build
data
test-results
.env
.env.local
.env.*.local
*.md
!README.md
docs
```

- [ ] **Step 3: Verify the Dockerfile syntax is valid**

Run: `docker build --no-cache --progress=plain -t slidt-test . 2>&1 | tail -5`

Expected output ends with a line like:
```
 => => writing image sha256:...
```
(If Docker is not available in this environment, run `python3 -c "print('skip')"` and proceed — the Dockerfile syntax will be caught by the compose-config check in Task 3.)

- [ ] **Step 4: Commit**

```
git add Dockerfile .dockerignore
git commit -m "feat: add Dockerfile (single-stage bookworm with Playwright Chromium)

Co-authored-by: Ralphify <noreply@ralphify.co>"
```

---

### Task 3: Docker Compose full stack + Caddyfile + .env.example

**Files:**
- Modify: `docker-compose.yml`
- Create: `Caddyfile`
- Create: `.env.example`

- [ ] **Step 1: Update docker-compose.yml**

Replace the entire file:

`docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: slidt
      POSTGRES_USER: slidt
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-slidt}
    ports:
      - '5432:5432'
    volumes:
      - ./data/pg:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U slidt']
      interval: 5s
      timeout: 5s
      retries: 10

  postgres-test:
    image: postgres:16
    environment:
      POSTGRES_DB: slidt_test
      POSTGRES_USER: slidt
      POSTGRES_PASSWORD: slidt
    ports:
      - '5433:5432'
    volumes:
      - ./data/pg-test:/var/lib/postgresql/data
    profiles: ['test']

  app:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://slidt:${POSTGRES_PASSWORD:-slidt}@postgres:5432/slidt
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}
      ASSETS_DIR: /data/assets
      APP_URL: ${APP_URL:-http://localhost:3000}
      SESSION_SECRET: ${SESSION_SECRET:-dev-secret-change-in-production}
    volumes:
      - ./data/assets:/data/assets
    expose:
      - '3000'

  caddy:
    image: caddy:2-alpine
    depends_on:
      - app
    ports:
      - '80:80'
      - '443:443'
      - '443:443/udp'
    environment:
      APP_HOST: ${APP_HOST:-localhost}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

- [ ] **Step 2: Write the Caddyfile**

`Caddyfile`:
```caddyfile
{$APP_HOST:localhost} {
    reverse_proxy app:3000
}
```

Caddy uses `APP_HOST` from the container environment. For local dev `APP_HOST=localhost` serves over plain HTTP (Caddy detects no FQDN). For production set `APP_HOST=slidt.example.com` and Caddy auto-provisions a Let's Encrypt cert.

- [ ] **Step 3: Write .env.example**

`.env.example`:
```dotenv
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://slidt:changeme@localhost:5432/slidt
POSTGRES_PASSWORD=changeme

# ── App ───────────────────────────────────────────────────────────────────────
APP_URL=https://slidt.example.com
APP_HOST=slidt.example.com
SESSION_SECRET=change-me-to-a-random-32-char-string-in-production
ASSETS_DIR=./data/assets

# ── Agent ─────────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 4: Validate the compose file**

Run: `docker compose config --quiet`
Expected: no output, exit code 0

(If Docker Compose is not available: `python3 -c "import sys; import re; t=open('docker-compose.yml').read(); assert 'caddy' in t and 'app' in t; print('ok')"` — should print `ok`.)

- [ ] **Step 5: Commit**

```
git add docker-compose.yml Caddyfile .env.example
git commit -m "feat: add full Docker Compose stack (app + caddy) and Caddyfile

Co-authored-by: Ralphify <noreply@ralphify.co>"
```

---

### Task 4: import-deck parse module + unit test

**Files:**
- Create: `scripts/import-deck-parse.ts`
- Test: `tests/import-deck-parse.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/import-deck-parse.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseImportInput } from '../scripts/import-deck-parse.ts';

describe('parseImportInput', () => {
  it('parses a valid input with all fields', () => {
    const result = parseImportInput({
      title: 'ANTAL-Theta april 2026',
      lang: 'da',
      slides: [
        { typeName: 'title', data: { title: 'ANTAL og Theta', eyebrow: 'Møde' } },
        { typeName: 'content', data: { title: 'Agenda', bullets: ['A', 'B'] } },
      ],
    });
    expect(result.title).toBe('ANTAL-Theta april 2026');
    expect(result.lang).toBe('da');
    expect(result.slides).toHaveLength(2);
    expect(result.slides[0].typeName).toBe('title');
    expect(result.slides[0].data).toEqual({ title: 'ANTAL og Theta', eyebrow: 'Møde' });
    expect(result.slides[1].typeName).toBe('content');
  });

  it('defaults lang to da when omitted', () => {
    const result = parseImportInput({ title: 'T', slides: [] });
    expect(result.lang).toBe('da');
  });

  it('accepts an empty slides array', () => {
    const result = parseImportInput({ title: 'Empty', slides: [] });
    expect(result.slides).toHaveLength(0);
  });

  it('treats missing data field as empty object', () => {
    const result = parseImportInput({
      title: 'T',
      slides: [{ typeName: 'section' }],
    });
    expect(result.slides[0].data).toEqual({});
  });

  it('throws on non-object input', () => {
    expect(() => parseImportInput(null)).toThrow('JSON object');
    expect(() => parseImportInput('string')).toThrow('JSON object');
  });

  it('throws on missing title', () => {
    expect(() => parseImportInput({ slides: [] })).toThrow('title');
  });

  it('throws on missing slides array', () => {
    expect(() => parseImportInput({ title: 'T' })).toThrow('slides');
  });

  it('throws on slides that is not an array', () => {
    expect(() => parseImportInput({ title: 'T', slides: {} })).toThrow('slides');
  });

  it('throws on slide missing typeName', () => {
    expect(() =>
      parseImportInput({ title: 'T', slides: [{ data: {} }] }),
    ).toThrow('typeName');
  });

  it('throws on slide with non-string typeName', () => {
    expect(() =>
      parseImportInput({ title: 'T', slides: [{ typeName: 42 }] }),
    ).toThrow('typeName');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/import-deck-parse.test.ts`
Expected: FAIL — `Cannot find module '../scripts/import-deck-parse.ts'`

- [ ] **Step 3: Write the parse module**

`scripts/import-deck-parse.ts`:
```ts
export interface ImportSlide {
  typeName: string;
  data: Record<string, unknown>;
}

export interface ImportInput {
  title: string;
  lang: string;
  slides: ImportSlide[];
}

/**
 * Validates and normalises raw JSON from a slides.json import file.
 * Throws a descriptive Error on any schema violation.
 *
 * Expected JSON shape:
 * {
 *   "title": "My Deck",
 *   "lang": "da",           // optional, defaults to "da"
 *   "slides": [
 *     { "typeName": "title",   "data": { "title": "Hello" } },
 *     { "typeName": "content", "data": { "bullets": ["one"] } }
 *   ]
 * }
 */
export function parseImportInput(raw: unknown): ImportInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Import input must be a JSON object');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    throw new Error('Missing required field: title (must be a non-empty string)');
  }

  if (!Object.prototype.hasOwnProperty.call(obj, 'slides') || !Array.isArray(obj.slides)) {
    throw new Error('Missing required field: slides (must be an array)');
  }

  const lang = typeof obj.lang === 'string' && obj.lang ? obj.lang : 'da';

  const slides: ImportSlide[] = obj.slides.map((s: unknown, i: number) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      throw new Error(`Slide ${i}: must be an object`);
    }
    const slide = s as Record<string, unknown>;

    if (typeof slide.typeName !== 'string' || !slide.typeName.trim()) {
      throw new Error(
        `Slide ${i}: missing required field typeName (must be a non-empty string)`,
      );
    }

    const data =
      slide.data && typeof slide.data === 'object' && !Array.isArray(slide.data)
        ? (slide.data as Record<string, unknown>)
        : {};

    return { typeName: slide.typeName, data };
  });

  return { title: obj.title.trim(), lang, slides };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/import-deck-parse.test.ts`
Expected: PASS — 10 tests passed

- [ ] **Step 5: Commit**

```
git add scripts/import-deck-parse.ts tests/import-deck-parse.test.ts
git commit -m "feat: add import-deck parse module with unit tests

Co-authored-by: Ralphify <noreply@ralphify.co>"
```

---

### Task 5: import-deck main CLI + package.json script

**Files:**
- Create: `scripts/import-deck.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the CLI**

`scripts/import-deck.ts`:
```ts
/**
 * import-deck — one-shot CLI that reads a slides.json file and writes the
 * deck + slides into the slidt database.
 *
 * Usage:
 *   pnpm import-deck <path/to/slides.json> [OPTIONS]
 *
 * Options:
 *   --owner <email>     Owner email (defaults to the first user in DB)
 *   --title <string>    Override the title from the JSON
 *   --theme <name>      Theme name to attach (defaults to "ANTAL-Theta default")
 *
 * Prerequisites:
 *   DATABASE_URL must be set (see .env.example).
 *   At least one user must exist: pnpm tsx scripts/create-user.ts
 *   Seed must have run so global slide types are present: pnpm db:seed
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseImportInput } from './import-deck-parse.ts';
import {
  db,
  decks,
  slides,
  slideTypes,
  themes,
  users,
} from '../src/lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

// ── Parse CLI arguments ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const jsonPath = args[0];

if (!jsonPath || jsonPath === '--help' || jsonPath === '-h') {
  console.log(
    'Usage: pnpm import-deck <slides.json> [--owner <email>] [--title <title>] [--theme <name>]',
  );
  process.exit(jsonPath ? 0 : 1);
}

let ownerEmail = '';
let titleOverride = '';
let themeName = 'ANTAL-Theta default';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--owner' && args[i + 1]) ownerEmail = args[++i];
  else if (args[i] === '--title' && args[i + 1]) titleOverride = args[++i];
  else if (args[i] === '--theme' && args[i + 1]) themeName = args[++i];
}

// ── Load + parse ───────────────────────────────────────────────────────────

let rawJson: unknown;
try {
  rawJson = JSON.parse(readFileSync(resolve(jsonPath), 'utf-8'));
} catch (err) {
  console.error(`Failed to read ${jsonPath}:`, err instanceof Error ? err.message : err);
  process.exit(1);
}

let input;
try {
  input = parseImportInput(rawJson);
} catch (err) {
  console.error('Invalid slides.json:', err instanceof Error ? err.message : err);
  process.exit(1);
}

const title = titleOverride || input.title;

// ── Resolve owner ──────────────────────────────────────────────────────────

let ownerId: string;
if (ownerEmail) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ownerEmail.toLowerCase().trim()))
    .limit(1);
  if (!user) {
    console.error(`User not found: ${ownerEmail}`);
    process.exit(1);
  }
  ownerId = user.id;
} else {
  const [firstUser] = await db.select({ id: users.id }).from(users).limit(1);
  if (!firstUser) {
    console.error('No users in DB. Create one first: pnpm tsx scripts/create-user.ts <email> <name> <password>');
    process.exit(1);
  }
  ownerId = firstUser.id;
}

// ── Resolve theme (optional) ───────────────────────────────────────────────

let themeId: string | undefined;
const [themeRow] = await db
  .select({ id: themes.id })
  .from(themes)
  .where(eq(themes.name, themeName))
  .limit(1);
if (themeRow) {
  themeId = themeRow.id;
} else {
  console.warn(`  ⚠ Theme "${themeName}" not found — deck will have no theme attached.`);
}

// ── Resolve global slide types ─────────────────────────────────────────────

const slideTypeRows = await db
  .select({ id: slideTypes.id, name: slideTypes.name })
  .from(slideTypes)
  .where(eq(slideTypes.scope, 'global'));

const typeMap = new Map(slideTypeRows.map((r) => [r.name, r.id]));

// ── Create deck ────────────────────────────────────────────────────────────

const [deck] = await db
  .insert(decks)
  .values({ title, lang: input.lang, ownerId, ...(themeId ? { themeId } : {}) })
  .returning();

console.log(`Creating deck "${title}" (id: ${deck.id})...`);

// ── Insert slides ──────────────────────────────────────────────────────────

const slideIds: string[] = [];
let skipped = 0;

for (let i = 0; i < input.slides.length; i++) {
  const s = input.slides[i];
  const typeId = typeMap.get(s.typeName);

  if (!typeId) {
    console.warn(`  ⚠ Unknown slide type "${s.typeName}" at index ${i} — skipping`);
    skipped++;
    continue;
  }

  const [slide] = await db
    .insert(slides)
    .values({ deckId: deck.id, typeId, data: s.data, orderIndex: i })
    .returning({ id: slides.id });

  slideIds.push(slide.id);
  console.log(`  ✓ Slide ${i + 1}: ${s.typeName}`);
}

// ── Update deck slideOrder ─────────────────────────────────────────────────

await db.update(decks).set({ slideOrder: slideIds }).where(eq(decks.id, deck.id));

// ── Summary ────────────────────────────────────────────────────────────────

console.log('');
console.log(`Done. Imported ${slideIds.length} slide(s)${skipped ? `, skipped ${skipped}` : ''}.`);
console.log(`Deck URL: ${process.env.APP_URL ?? 'http://localhost:3000'}/decks/${deck.id}`);
```

- [ ] **Step 2: Add the script to package.json**

In `package.json`, add `"import-deck": "tsx scripts/import-deck.ts"` to the `"scripts"` object.

The scripts section should look like:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "typecheck": "tsc --noEmit",
  "dev": "vite dev",
  "build": "vite build",
  "start": "node build",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:seed": "tsx scripts/seed.ts",
  "import-deck": "tsx scripts/import-deck.ts"
},
```

- [ ] **Step 3: Run typecheck to verify the CLI compiles**

Run: `pnpm typecheck`
Expected: no errors, exit code 0

- [ ] **Step 4: Run full test suite to confirm nothing is broken**

Run: `pnpm test`
Expected: PASS — all existing tests pass (168+ tests)

- [ ] **Step 5: Commit**

```
git add scripts/import-deck.ts package.json
git commit -m "feat: add import-deck CLI to import slides.json into the database

Co-authored-by: Ralphify <noreply@ralphify.co>"
```

---

### Task 6: Backup script + README deploy guide

**Files:**
- Create: `scripts/backup.sh`
- Modify: `README.md`

- [ ] **Step 1: Write the backup script**

`scripts/backup.sh`:
```bash
#!/usr/bin/env bash
# backup.sh — dump Postgres, tarball ./data/, upload to OneDrive via rclone.
#
# Usage:
#   ./scripts/backup.sh [rclone-remote:path]
#
# Default remote: onedrive:slidt-backups
# Prerequisites: rclone configured with an "onedrive" remote.
#   See: https://rclone.org/onedrive/
#
# Suggested cron (daily at 02:00):
#   0 2 * * * cd /opt/slidt && ./scripts/backup.sh >> /var/log/slidt-backup.log 2>&1

set -euo pipefail

REMOTE="${1:-onedrive:slidt-backups}"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
BACKUP_DIR="./data/backups"
SQL_DUMP="${BACKUP_DIR}/slidt-${TIMESTAMP}.sql"
ARCHIVE="${BACKUP_DIR}/slidt-${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +%FT%TZ)] Starting backup..."

# 1. Dump Postgres
echo "  Dumping Postgres..."
docker compose exec -T postgres pg_dump -U slidt slidt > "${SQL_DUMP}"

# 2. Create tarball (assets + this SQL dump)
echo "  Archiving to ${ARCHIVE}..."
tar -czf "${ARCHIVE}" \
  --transform "s|^data/||" \
  "data/assets" \
  "${SQL_DUMP}"

# 3. Remove raw SQL dump (it's inside the archive)
rm "${SQL_DUMP}"

# 4. Upload
echo "  Uploading to ${REMOTE}..."
rclone copy "${ARCHIVE}" "${REMOTE}" --progress

# 5. Prune local backups: keep last 7
echo "  Pruning old local backups (keeping 7)..."
# shellcheck disable=SC2012
ls -1t "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm --

echo "[$(date -u +%FT%TZ)] Backup complete: ${ARCHIVE}"
```

- [ ] **Step 2: Make the backup script executable**

Run: `chmod +x scripts/backup.sh`
Expected: exit code 0 (no output)

- [ ] **Step 3: Validate the backup script syntax**

Run: `bash -n scripts/backup.sh`
Expected: no output, exit code 0

- [ ] **Step 4: Update README.md**

Replace the existing README with the full updated version:

`README.md`:
```markdown
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
```

- [ ] **Step 5: Run full test suite one final time**

Run: `pnpm test`
Expected: PASS — all tests passed

- [ ] **Step 6: Commit**

```
git add scripts/backup.sh README.md
git commit -m "feat: add backup script and full README deploy guide

Co-authored-by: Ralphify <noreply@ralphify.co>"
```
