import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { db, shareLinks, decks } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';
import { renderDeckToPresentation } from '$lib/server/pdf.ts';
import { isShareExpired } from '$lib/utils/share-utils.ts';

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

  const renderedHtml = await renderDeckToPresentation(link.deckId);

  return {
    deck: { title: deck.title, lang: deck.lang },
    token: params.token,
    renderedHtml,
  };
};
