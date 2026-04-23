import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, themes } from '$lib/server/db/index.ts';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const rows = await db.select().from(themes);
  return json(rows);
}

export async function POST(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.name !== 'string') throw error(400, 'name required');
  if (!body.tokens || typeof body.tokens !== 'object') throw error(400, 'tokens required');
  const [theme] = await db
    .insert(themes)
    .values({
      name: body.name,
      tokens: body.tokens,
      scope: body.scope === 'deck' ? 'deck' : 'global',
      deckId: body.deckId ?? null,
      isPreset: body.isPreset === true,
    })
    .returning();
  return json(theme, { status: 201 });
}
