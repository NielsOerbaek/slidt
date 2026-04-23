import type { Actions, PageServerLoad } from './$types.js';
import { db, themes } from '$lib/server/db/index.ts';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const rows = await db.select().from(themes).orderBy(themes.name);
  return { themes: rows };
};

export const actions: Actions = {
  create: async ({ locals, request }) => {
    const fd = await request.formData();
    const name = fd.get('name');
    if (typeof name !== 'string' || !name.trim()) {
      return fail(400, { error: 'Name is required.' });
    }
    const [theme] = await db
      .insert(themes)
      .values({
        name: name.trim(),
        tokens: {},
        scope: 'global',
        isPreset: false,
      })
      .returning();
    throw redirect(302, `/themes/${theme!.id}`);
  },
};
