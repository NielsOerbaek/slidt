import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks, slides } from '$lib/server/db/index.ts';
import { eq, and, sql } from 'drizzle-orm';

async function requireSlideAccess(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, event.params.id!), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) throw error(404, 'Deck not found');
  const [slide] = await db
    .select()
    .from(slides)
    .where(and(eq(slides.id, event.params.slideId!), eq(slides.deckId, deck.id)))
    .limit(1);
  if (!slide) throw error(404, 'Slide not found');
  return { deck, slide };
}

export async function GET(event: RequestEvent) {
  const { slide } = await requireSlideAccess(event);
  return json(slide);
}

export async function PATCH(event: RequestEvent) {
  const { slide } = await requireSlideAccess(event);
  const body = await event.request.json().catch(() => ({}));
  const updates: Partial<typeof slides.$inferInsert> = {};
  if (body.data !== undefined) updates.data = { ...slide.data as object, ...body.data };
  if (typeof body.typeId === 'string') updates.typeId = body.typeId;
  if (typeof body.orderIndex === 'number') updates.orderIndex = body.orderIndex;
  const [updated] = await db
    .update(slides)
    .set(updates)
    .where(eq(slides.id, slide.id))
    .returning();
  await db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, slide.deckId));
  return json(updated);
}

export async function DELETE(event: RequestEvent) {
  const { deck, slide } = await requireSlideAccess(event);
  await db.delete(slides).where(eq(slides.id, slide.id));
  await db
    .update(decks)
    .set({
      slideOrder: sql`array_remove(${decks.slideOrder}, ${slide.id}::uuid)`,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, deck.id));
  return json({ ok: true });
}
