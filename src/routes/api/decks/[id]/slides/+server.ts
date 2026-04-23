import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks, slides } from '$lib/server/db/index.ts';
import { eq, and, asc, sql } from 'drizzle-orm';

async function requireDeckAccess(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, event.params.id!), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) throw error(404, 'Deck not found');
  return deck;
}

export async function GET(event: RequestEvent) {
  await requireDeckAccess(event);
  const rows = await db
    .select()
    .from(slides)
    .where(eq(slides.deckId, event.params.id!))
    .orderBy(asc(slides.orderIndex));
  return json(rows);
}

export async function POST(event: RequestEvent) {
  const deck = await requireDeckAccess(event);
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.typeId !== 'string') throw error(400, 'typeId required');
  const data = body.data ?? {};
  const orderIndex = deck.slideOrder.length;
  const [slide] = await db
    .insert(slides)
    .values({ deckId: deck.id, typeId: body.typeId, data, orderIndex })
    .returning();
  const [updatedDeck] = await db
    .update(decks)
    .set({
      slideOrder: sql`array_append(${decks.slideOrder}, ${slide!.id}::uuid)`,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, deck.id))
    .returning();
  return json({ slide, deck: updatedDeck }, { status: 201 });
}
