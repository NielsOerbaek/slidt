import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { db, shareLinks, decks, slides, slideTypes, themes } from '$lib/server/db/index.ts';
import { eq, or, asc } from 'drizzle-orm';
import { render } from '../../../renderer/index.ts';
import { isShareExpired } from '$lib/utils/share-utils.ts';
import type { SlideType, Theme } from '../../../renderer/types.ts';

export const load: PageServerLoad = async ({ params }) => {
  const [link] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.token, params.token))
    .limit(1);

  if (!link) throw error(404, 'Share link not found');
  if (isShareExpired(link.expiresAt)) throw error(410, 'Share link has expired');

  const [deck] = await db.select().from(decks).where(eq(decks.id, link.deckId)).limit(1);
  if (!deck) throw error(404, 'Deck not found');

  const slideRows = await db
    .select()
    .from(slides)
    .where(eq(slides.deckId, deck.id))
    .orderBy(asc(slides.orderIndex));

  const slideMap = new Map(slideRows.map((s) => [s.id, s]));
  const orderedSlides = deck.slideOrder
    .map((id) => slideMap.get(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const typeRows = await db
    .select()
    .from(slideTypes)
    .where(or(eq(slideTypes.scope, 'global'), eq(slideTypes.deckId, deck.id)));

  let theme: typeof themes.$inferSelect | null = null;
  if (deck.themeId) {
    const [t] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
    theme = t ?? null;
  }
  if (!theme) {
    const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
    theme = t ?? null;
  }

  const rendererSlideTypes: SlideType[] = typeRows.map((t) => ({
    name: t.name,
    label: t.label,
    fields: t.fields,
    htmlTemplate: t.htmlTemplate,
    css: t.css,
  }));

  const rendererTheme: Theme = theme
    ? { name: theme.name, tokens: theme.tokens }
    : { name: 'default', tokens: {} };

  const rendererDeck = {
    title: deck.title,
    lang: deck.lang,
    slides: orderedSlides.map((s) => {
      const type = typeRows.find((t) => t.id === s.typeId);
      return { typeName: type?.name ?? '', data: s.data as Record<string, unknown> };
    }),
  };

  // Render full deck HTML on the server
  const renderedHtml = await render(rendererDeck, rendererTheme, rendererSlideTypes);

  return {
    deck: { title: deck.title, lang: deck.lang },
    renderedHtml,
  };
};
