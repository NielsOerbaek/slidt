import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireDeckRole } from '$lib/server/deck-access.ts';
import { runAgentStream } from '$lib/server/agent/runner.ts';
import { runOllamaStream } from '$lib/server/agent/ollama-runner.ts';
import { db, agentMessages } from '$lib/server/db/index.ts';
import { asc, eq } from 'drizzle-orm';

/**
 * Return the agent's persisted message history for this deck so a freshly
 * mounted drawer can hydrate instead of starting empty. We hand back the raw
 * stored rows (role + content + tool calls); the client re-projects them into
 * its turn-by-turn view model.
 */
export async function GET(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'viewer');
  const rows = await db
    .select()
    .from(agentMessages)
    .where(eq(agentMessages.deckId, event.params.id!))
    .orderBy(asc(agentMessages.createdAt));
  return json({ messages: rows });
}

export async function POST(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'editor');

  const deckId = event.params.id!;

  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    throw error(400, 'message required');
  }

  const aiModel = event.locals.user?.preferences?.aiModel;
  const DEFAULT_OLLAMA_MODEL = 'gemma4:26b';
  let stream: ReadableStream<Uint8Array>;

  if (aiModel?.startsWith('claude')) {
    stream = runAgentStream(deckId, event.locals.user!.id, body.message.trim());
  } else {
    const modelTag = aiModel?.startsWith('ollama:') ? aiModel.slice(7) : DEFAULT_OLLAMA_MODEL;
    stream = runOllamaStream(deckId, event.locals.user!.id, body.message.trim(), modelTag);
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function DELETE(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'editor');
  await db.delete(agentMessages).where(eq(agentMessages.deckId, event.params.id!));
  return new Response(null, { status: 204 });
}
