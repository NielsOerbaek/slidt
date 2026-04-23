import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks } from '$lib/server/db/index.ts';
import { and, eq } from 'drizzle-orm';
import { runAgentStream } from '$lib/server/agent/runner.ts';

export async function POST(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');

  const deckId = event.params.id!;
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) throw error(404, 'Deck not found');

  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    throw error(400, 'message required');
  }

  const stream = runAgentStream(deckId, event.locals.user.id, body.message.trim());

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
