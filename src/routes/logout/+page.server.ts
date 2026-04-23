import type { Actions } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.ts';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const token = cookies.get('session');
    if (token) {
      await deleteSession(token);
      cookies.delete('session', { path: '/' });
    }
    throw redirect(302, '/login');
  },
};
