import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  // The layout already redirects unauthenticated users to /login. By the time
  // we get here, the user is signed in — send them to their decks workspace.
  throw redirect(302, '/decks');
};
