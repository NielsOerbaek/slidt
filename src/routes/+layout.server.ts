import type { LayoutServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { isPublicPath } from '$lib/utils/paths.ts';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user && !isPublicPath(url.pathname)) {
    throw redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);
  }
  return { user: locals.user };
};
