import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { db, shareLinks, decks } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';
import { isShareExpired } from '$lib/utils/share-utils.ts';
import { renderDeckToPdf } from '$lib/server/pdf.ts';

export async function GET(event: RequestEvent) {
  const [link] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.token, event.params.token!))
    .limit(1);

  if (!link) throw error(404, 'Share link not found');
  if (isShareExpired(link.expiresAt)) throw error(410, 'Share link has expired');

  const [deck] = await db.select({ title: decks.title }).from(decks).where(eq(decks.id, link.deckId)).limit(1);
  if (!deck) throw error(404, 'Deck not found');

  const pdfBuf = await renderDeckToPdf(link.deckId);
  const filename = `${deck.title.replace(/[^a-z0-9 \-_]/gi, '').trim() || 'presentation'}.pdf`;

  return new Response(pdfBuf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
