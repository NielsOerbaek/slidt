import type { Actions, PageServerLoad } from './$types.js';
import { db, decks } from '$lib/server/db/index.ts';
import { eq, desc } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const rows = await db
    .select()
    .from(decks)
    .where(eq(decks.ownerId, locals.user!.id))
    .orderBy(desc(decks.updatedAt));
  return { decks: rows };
};

export const actions: Actions = {
  create: async ({ locals, request }) => {
    const fd = await request.formData();
    const title = fd.get('title');
    if (typeof title !== 'string' || !title.trim()) {
      return fail(400, { error: 'Title is required.' });
    }
    const [deck] = await db
      .insert(decks)
      .values({ title: title.trim(), lang: 'da', ownerId: locals.user!.id })
      .returning();
    throw redirect(302, `/decks/${deck!.id}`);
  },

  delete: async ({ locals, request }) => {
    const fd = await request.formData();
    const id = fd.get('id');
    if (typeof id !== 'string') return fail(400, { error: 'id required' });
    await db.delete(decks).where(eq(decks.id, id));
    return { ok: true };
  },
};
