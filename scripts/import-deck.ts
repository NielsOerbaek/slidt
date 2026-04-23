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
