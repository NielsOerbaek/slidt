import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, slideTypes } from '$lib/server/db/index.ts';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const rows = await db.select().from(slideTypes);
  return json(rows);
}

export async function POST(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.name !== 'string') throw error(400, 'name required');
  if (typeof body.label !== 'string') throw error(400, 'label required');
  if (!Array.isArray(body.fields)) throw error(400, 'fields must be array');
  if (typeof body.htmlTemplate !== 'string') throw error(400, 'htmlTemplate required');
  const [st] = await db
    .insert(slideTypes)
    .values({
      name: body.name,
      label: body.label,
      fields: body.fields,
      htmlTemplate: body.htmlTemplate,
      css: body.css ?? '',
      scope: body.scope === 'deck' ? 'deck' : 'global',
      deckId: body.deckId ?? null,
    })
    .returning();
  return json(st, { status: 201 });
}
