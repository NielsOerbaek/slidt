import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks } from '$lib/server/db/index.ts';
import { eq, and } from 'drizzle-orm';

function unauth() {
  return new Response(JSON.stringify({ message: 'Not authenticated' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function notFound() {
  return new Response(JSON.stringify({ message: 'Deck not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function requireOwnedDeck(event: RequestEvent) {
  if (!event.locals.user) return { error: unauth(), deck: null };
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, event.params.id!), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) return { error: notFound(), deck: null };
  return { error: null, deck };
}

export async function GET(event: RequestEvent) {
  const { error, deck } = await requireOwnedDeck(event);
  if (error) return error;
  return json(deck);
}

export async function PATCH(event: RequestEvent) {
  const { error, deck } = await requireOwnedDeck(event);
  if (error) return error;
  const body = await event.request.json().catch(() => ({}));
  const updates: Partial<typeof decks.$inferInsert> = {};
  if (typeof body.title === 'string') updates.title = body.title;
  if (typeof body.lang === 'string') updates.lang = body.lang;
  if (typeof body.themeId === 'string' || body.themeId === null) updates.themeId = body.themeId;
  if (Array.isArray(body.slideOrder)) updates.slideOrder = body.slideOrder;
  updates.updatedAt = new Date();
  const [updated] = await db.update(decks).set(updates).where(eq(decks.id, deck!.id)).returning();
  return json(updated);
}

export async function DELETE(event: RequestEvent) {
  const { error, deck } = await requireOwnedDeck(event);
  if (error) return error;
  await db.delete(decks).where(eq(decks.id, deck!.id));
  return json({ ok: true });
}
