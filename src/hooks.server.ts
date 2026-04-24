import type { Handle } from '@sveltejs/kit';
import { resolveSession, resolveApiKey } from '$lib/server/auth.ts';

export const handle: Handle = async ({ event, resolve }) => {
  // API key auth via Bearer token (for CLI / agent access)
  const auth = event.request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    event.locals.user = await resolveApiKey(auth.slice(7).trim());
    return resolve(event);
  }

  // Cookie session auth (for browser UI)
  const token = event.cookies.get('session');
  event.locals.user = token ? await resolveSession(token) : null;
  return resolve(event);
};
