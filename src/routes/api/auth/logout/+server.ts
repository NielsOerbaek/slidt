import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.ts';

export async function POST(event: RequestEvent) {
  const token = event.cookies.get('session');
  if (token) {
    await deleteSession(token);
    event.cookies.delete('session', { path: '/' });
  }
  return json({ ok: true });
}
