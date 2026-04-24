import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks, slides } from '$lib/server/db/index.ts';
import { eq, and, sql } from 'drizzle-orm';
import { requireDeckRole } from '$lib/server/deck-access.ts';

async function loadSlide(event: RequestEvent, minRole: 'viewer' | 'editor' = 'viewer') {
  await requireDeckRole(event.params.id!, event.locals.user?.id, minRole);
  const [slide] = await db
    .select()
    .from(slides)
    .where(and(eq(slides.id, event.params.slideId!), eq(slides.deckId, event.params.id!)))
    .limit(1);
  if (!slide) throw error(404, 'Slide not found');
  return slide;
}

export async function GET(event: RequestEvent) {
  const slide = await loadSlide(event, 'viewer');
  return json(slide);
}

export async function PATCH(event: RequestEvent) {
  const slide = await loadSlide(event, 'editor');
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
  const slide = await loadSlide(event, 'editor');
  await db.delete(slides).where(eq(slides.id, slide.id));
  await db
    .update(decks)
    .set({
      slideOrder: sql`array_remove(${decks.slideOrder}, ${slide.id}::uuid)`,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, slide.deckId));
  return json({ ok: true });
}
