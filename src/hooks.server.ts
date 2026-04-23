import type { Handle } from '@sveltejs/kit';
import { resolveSession } from '$lib/server/auth.ts';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  event.locals.user = token ? await resolveSession(token) : null;
  return resolve(event);
};
