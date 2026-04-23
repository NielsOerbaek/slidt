import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { renderDeckToPdf } from '$lib/server/pdf.ts';
import { db, decks } from '$lib/server/db/index.ts';
import { and, eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');

  const deckId = event.params.id!;
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) throw error(404, 'Deck not found');

  const pdf = await renderDeckToPdf(deckId);

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="deck-${deckId}.pdf"`,
      'Content-Length': String(pdf.byteLength),
    },
  });
}
