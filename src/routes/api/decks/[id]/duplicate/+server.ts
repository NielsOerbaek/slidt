import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks, slides, slideTypes } from '$lib/server/db/index.ts';
import { eq, and } from 'drizzle-orm';

export async function POST(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');

  const deckId = event.params.id!;
  const [original] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!original) throw error(404, 'Deck not found');

  // Load deck-scoped slide types
  const deckTypes = await db
    .select()
    .from(slideTypes)
    .where(and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)));

  // Load all slides
  const originalSlides = await db
    .select()
    .from(slides)
    .where(eq(slides.deckId, deckId));

  // --- Transactional deep copy ---
  const newDeck = await db.transaction(async (tx) => {
    // 1. Create new deck
    const [nd] = await tx
      .insert(decks)
      .values({
        title: `Copy of ${original.title}`,
        lang: original.lang,
        themeId: original.themeId,
        ownerId: event.locals.user!.id,
        slideOrder: [],
      })
      .returning();

    // 2. Copy deck-scoped slide types, build id remap
    const typeIdMap = new Map<string, string>();
    for (const st of deckTypes) {
      const [newType] = await tx
        .insert(slideTypes)
        .values({
          name: st.name,
          label: st.label,
          fields: st.fields,
          htmlTemplate: st.htmlTemplate,
          css: st.css,
          scope: 'deck',
          deckId: nd!.id,
        })
        .returning({ id: slideTypes.id });
      typeIdMap.set(st.id, newType!.id);
    }

    // 3. Copy slides, remapping deck-scoped typeIds
    const slideIdMap = new Map<string, string>();
    for (const s of originalSlides) {
      const newTypeId = typeIdMap.get(s.typeId) ?? s.typeId;
      const [newSlide] = await tx
        .insert(slides)
        .values({
          deckId: nd!.id,
          typeId: newTypeId,
          data: s.data,
          orderIndex: s.orderIndex,
        })
        .returning({ id: slides.id });
      slideIdMap.set(s.id, newSlide!.id);
    }

    // 4. Build new slideOrder using remapped UUIDs
    const newSlideOrder = original.slideOrder
      .map((id) => slideIdMap.get(id))
      .filter((id): id is string => id !== undefined);

    // 5. Update slideOrder on new deck
    const [updated] = await tx
      .update(decks)
      .set({ slideOrder: newSlideOrder })
      .where(eq(decks.id, nd!.id))
      .returning();

    return updated!;
  });

  return json({ id: newDeck.id, title: newDeck.title }, { status: 201 });
}
