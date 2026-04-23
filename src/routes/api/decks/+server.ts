import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks } from '$lib/server/db/index.ts';
import { eq, desc } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) {
    return new Response(JSON.stringify({ message: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const rows = await db
    .select()
    .from(decks)
    .where(eq(decks.ownerId, event.locals.user.id))
    .orderBy(desc(decks.updatedAt));
  return json(rows);
}

export async function POST(event: RequestEvent) {
  if (!event.locals.user) {
    return new Response(JSON.stringify({ message: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.title !== 'string') {
    return new Response(JSON.stringify({ message: 'title required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const lang = typeof body.lang === 'string' ? body.lang : 'da';
  const [deck] = await db
    .insert(decks)
    .values({ title: body.title, lang, ownerId: event.locals.user.id })
    .returning();
  return json(deck, { status: 201 });
}
