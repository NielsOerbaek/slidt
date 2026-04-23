import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks, shareLinks } from '$lib/server/db/index.ts';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

function unauthorized() {
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

export async function GET(event: RequestEvent) {
  if (!event.locals.user) return unauthorized();
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, event.params.id!), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) return notFound();
  const links = await db.select().from(shareLinks).where(eq(shareLinks.deckId, deck.id));
  return json(links);
}

export async function POST(event: RequestEvent) {
  if (!event.locals.user) return unauthorized();
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, event.params.id!), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) return notFound();
  const body = await event.request.json().catch(() => ({}));
  const token = crypto.randomBytes(24).toString('base64url');
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  const [link] = await db
    .insert(shareLinks)
    .values({ deckId: deck.id, token, ...(expiresAt ? { expiresAt } : {}) })
    .returning();
  return json(link, { status: 201 });
}
