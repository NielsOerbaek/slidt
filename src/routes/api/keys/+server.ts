import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createApiKey, listApiKeys, deleteApiKey } from '$lib/server/auth.ts';

/** GET /api/keys — list the current user's API keys */
export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const keys = await listApiKeys(event.locals.user.id);
  return json(keys);
}

/** POST /api/keys — create a new API key */
export async function POST(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    throw error(400, 'name required');
  }
  const { token, key } = await createApiKey(event.locals.user.id, body.name.trim());
  // Return the token only once — it cannot be retrieved again
  return json({ ...key, token }, { status: 201 });
}

/** DELETE /api/keys/:id — revoke an API key */
export async function DELETE(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const id = new URL(event.request.url).searchParams.get('id');
  if (!id) throw error(400, 'id required');
  const deleted = await deleteApiKey(id, event.locals.user.id);
  if (!deleted) throw error(404, 'Key not found');
  return json({ ok: true });
}
