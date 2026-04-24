import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDeckRole } from '$lib/server/deck-access.ts';
import { runAgentStream } from '$lib/server/agent/runner.ts';

export async function POST(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'editor');

  const deckId = event.params.id!;

  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    throw error(400, 'message required');
  }

  const stream = runAgentStream(deckId, event.locals.user!.id, body.message.trim());

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
