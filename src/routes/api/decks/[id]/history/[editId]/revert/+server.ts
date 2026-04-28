import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, slideEdits, slides, decks } from '$lib/server/db/index.ts';
import { eq, and, sql } from 'drizzle-orm';
import { requireDeckRole } from '$lib/server/deck-access.ts';
import { recordEdit } from '$lib/server/edit-history.ts';
import type { EditKind } from '$lib/server/db/schema.ts';

/**
 * Revert applies the inverse of a previously recorded edit to current state
 * and writes a new "revert" edit so the operation itself is in history.
 *
 * Best-effort — if the slide / deck has diverged in incompatible ways we
 * surface the failure rather than silently producing a wrong state.
 */
export async function POST(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'editor');
  const editId = event.params.editId!;
  const deckId = event.params.id!;

  const [edit] = await db
    .select()
    .from(slideEdits)
    .where(and(eq(slideEdits.id, editId), eq(slideEdits.deckId, deckId)))
    .limit(1);
  if (!edit) throw error(404, 'Edit not found');

  const kind = edit.kind as EditKind;
  const before = edit.before as Record<string, unknown> | null;
  const after = edit.after as Record<string, unknown> | null;

  switch (kind) {
    case 'edit_field': {
      // Restore the slide's data field to its pre-edit value.
      if (!edit.slideId || !before || !('data' in before)) {
        throw error(400, 'Edit row missing slideId / before.data');
      }
      const [existing] = await db
        .select()
        .from(slides)
        .where(and(eq(slides.id, edit.slideId), eq(slides.deckId, deckId)))
        .limit(1);
      if (!existing) throw error(409, 'Slide no longer exists — cannot revert');
      await db
        .update(slides)
        .set({ data: before['data'] as Record<string, unknown> })
        .where(eq(slides.id, edit.slideId));
      await db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, deckId));
      await recordEdit({
        deckId,
        slideId: edit.slideId,
        userId: event.locals.user?.id,
        kind: 'edit_field',
        before: { data: existing.data },
        after: { data: before['data'] },
        summary: `Revert: ${edit.summary}`,
      });
      break;
    }

    case 'add_slide': {
      // Inverse of "added X" is "delete X".
      if (!after || !('slide' in after)) throw error(400, 'Edit row missing after.slide');
      const slideRef = after['slide'] as { id: string };
      const [existing] = await db
        .select()
        .from(slides)
        .where(and(eq(slides.id, slideRef.id), eq(slides.deckId, deckId)))
        .limit(1);
      if (!existing) throw error(409, 'Slide already gone — nothing to revert');
      await db.delete(slides).where(eq(slides.id, slideRef.id));
      await db
        .update(decks)
        .set({
          slideOrder: sql`array_remove(${decks.slideOrder}, ${slideRef.id}::uuid)`,
          updatedAt: new Date(),
        })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId,
        userId: event.locals.user?.id,
        kind: 'delete_slide',
        before: { slide: existing, position: (after as { position: number }).position },
        after: null,
        summary: `Revert: ${edit.summary}`,
      });
      break;
    }

    case 'delete_slide': {
      // Inverse of "deleted X" is "re-create X at its old position".
      if (!before || !('slide' in before)) throw error(400, 'Edit row missing before.slide');
      const stored = before['slide'] as {
        id: string;
        typeId: string;
        data: Record<string, unknown>;
        orderIndex: number;
      };
      const position = (before as { position: number }).position;
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) throw error(404, 'Deck not found');

      // Re-insert with the same content. We don't reuse the original id (it's
      // free in the DB but may already be in slideOrder if a parallel undo
      // raced us). A new uuid is safest.
      const [recreated] = await db
        .insert(slides)
        .values({
          deckId,
          typeId: stored.typeId,
          data: stored.data,
          orderIndex: stored.orderIndex,
        })
        .returning();
      const order = [...deck.slideOrder.filter((id) => id !== recreated!.id)];
      const idx = Math.max(0, Math.min(position, order.length));
      order.splice(idx, 0, recreated!.id);
      await db
        .update(decks)
        .set({ slideOrder: order, updatedAt: new Date() })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId,
        slideId: recreated!.id,
        userId: event.locals.user?.id,
        kind: 'add_slide',
        before: null,
        after: { slide: recreated, position: idx },
        summary: `Revert: ${edit.summary}`,
      });
      break;
    }

    case 'reorder': {
      if (!before || !('slideOrder' in before)) throw error(400, 'Edit row missing before.slideOrder');
      const prevOrder = before['slideOrder'] as string[];
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) throw error(404, 'Deck not found');
      await db
        .update(decks)
        .set({ slideOrder: prevOrder, updatedAt: new Date() })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId,
        userId: event.locals.user?.id,
        kind: 'reorder',
        before: { slideOrder: deck.slideOrder },
        after: { slideOrder: prevOrder },
        summary: `Revert: ${edit.summary}`,
      });
      break;
    }

    case 'apply_theme': {
      if (!before || !('themeId' in before)) throw error(400, 'Edit row missing before.themeId');
      const prevThemeId = before['themeId'] as string | null;
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) throw error(404, 'Deck not found');
      await db
        .update(decks)
        .set({ themeId: prevThemeId, updatedAt: new Date() })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId,
        userId: event.locals.user?.id,
        kind: 'apply_theme',
        before: { themeId: deck.themeId },
        after: { themeId: prevThemeId },
        summary: `Revert: ${edit.summary}`,
      });
      break;
    }

    case 'edit_title': {
      if (!before || !('title' in before)) throw error(400, 'Edit row missing before.title');
      const prevTitle = before['title'] as string;
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) throw error(404, 'Deck not found');
      await db
        .update(decks)
        .set({ title: prevTitle, updatedAt: new Date() })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId,
        userId: event.locals.user?.id,
        kind: 'edit_title',
        before: { title: deck.title },
        after: { title: prevTitle },
        summary: `Revert: ${edit.summary}`,
      });
      break;
    }

    default:
      throw error(400, `Cannot revert edit of kind "${kind}"`);
  }

  return json({ ok: true });
}
