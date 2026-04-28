import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks, slides } from '$lib/server/db/index.ts';
import { eq, and, sql } from 'drizzle-orm';
import { requireDeckRole } from '$lib/server/deck-access.ts';
import { recordEdit, fieldCoalesceKey, changedTopLevelFields } from '$lib/server/edit-history.ts';

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

  if (updates.data !== undefined && updated) {
    const before = slide.data as Record<string, unknown>;
    const after = updated.data as Record<string, unknown>;
    const changed = changedTopLevelFields(before, after);
    if (changed.length > 0) {
      const summary = changed.length === 1
        ? `Edit ${changed[0]}`
        : `Edit ${changed.slice(0, 3).join(', ')}${changed.length > 3 ? '…' : ''}`;
      const coalesceKey = changed.length === 1
        ? fieldCoalesceKey(slide.id, changed[0])
        : null;
      await recordEdit({
        deckId: slide.deckId,
        slideId: slide.id,
        userId: event.locals.user?.id,
        kind: 'edit_field',
        before: { data: before },
        after: { data: after },
        coalesceKey,
        summary,
      });
    }
  }

  return json(updated);
}

export async function DELETE(event: RequestEvent) {
  const slide = await loadSlide(event, 'editor');
  const [deck] = await db.select().from(decks).where(eq(decks.id, slide.deckId)).limit(1);
  const position = deck?.slideOrder.indexOf(slide.id) ?? -1;

  await db.delete(slides).where(eq(slides.id, slide.id));
  await db
    .update(decks)
    .set({
      slideOrder: sql`array_remove(${decks.slideOrder}, ${slide.id}::uuid)`,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, slide.deckId));

  await recordEdit({
    deckId: slide.deckId,
    slideId: null,
    userId: event.locals.user?.id,
    kind: 'delete_slide',
    before: {
      slide: { id: slide.id, typeId: slide.typeId, data: slide.data, orderIndex: slide.orderIndex },
      position,
    },
    after: null,
    summary: `Delete slide ${position >= 0 ? String(position + 1).padStart(2, '0') : '??'}`,
  });

  return json({ ok: true });
}
