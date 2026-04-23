import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { db, decks, slides, slideTypes, themes } from '$lib/server/db/index.ts';
import { eq, or, asc } from 'drizzle-orm';
import type { SlideType, Theme } from '../../../renderer/types.ts';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Load deck (verify ownership)
  const [deck] = await db
    .select()
    .from(decks)
    .where(eq(decks.id, params.id))
    .limit(1);

  if (!deck || deck.ownerId !== locals.user!.id) {
    throw error(404, 'Deck not found');
  }

  // Load slides ordered by orderIndex
  const slideRows = await db
    .select()
    .from(slides)
    .where(eq(slides.deckId, params.id))
    .orderBy(asc(slides.orderIndex));

  // Re-order by deck.slideOrder (source of truth for order)
  const slideMap = new Map(slideRows.map((s) => [s.id, s]));
  const orderedSlides = deck.slideOrder
    .map((id) => slideMap.get(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  // Append any slides not yet in slideOrder (shouldn't happen but be safe)
  for (const s of slideRows) {
    if (!deck.slideOrder.includes(s.id)) orderedSlides.push(s);
  }

  // Load slide types (global + deck-scoped for this deck)
  const typeRows = await db
    .select()
    .from(slideTypes)
    .where(or(eq(slideTypes.scope, 'global'), eq(slideTypes.deckId, params.id)));

  // Load theme (deck's theme, or first preset, or null)
  let theme: typeof themes.$inferSelect | null = null;
  if (deck.themeId) {
    const [t] = await db
      .select()
      .from(themes)
      .where(eq(themes.id, deck.themeId))
      .limit(1);
    theme = t ?? null;
  }
  if (!theme) {
    const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
    theme = t ?? null;
  }

  // Convert DB slide types to renderer SlideType shape
  const rendererTypes: (SlideType & { id: string; scope: string; deckId: string | null })[] =
    typeRows.map((t) => ({
      id: t.id,
      name: t.name,
      label: t.label,
      fields: t.fields,
      htmlTemplate: t.htmlTemplate,
      css: t.css,
      scope: t.scope,
      deckId: t.deckId,
    }));

  // Convert DB theme to renderer Theme shape
  const rendererTheme: (Theme & { id: string }) | null = theme
    ? { id: theme.id, name: theme.name, tokens: theme.tokens }
    : null;

  return {
    deck,
    slides: orderedSlides,
    slideTypes: rendererTypes,
    theme: rendererTheme,
  };
};
