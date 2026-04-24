import type { Actions, PageServerLoad } from './$types.js';
import { db, decks, agentMessages } from '$lib/server/db/index.ts';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const rows = await db
    .select()
    .from(decks)
    .where(eq(decks.ownerId, locals.user!.id))
    .orderBy(desc(decks.updatedAt));

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [editsRow] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(agentMessages)
    .innerJoin(decks, eq(decks.id, agentMessages.deckId))
    .where(and(
      eq(decks.ownerId, locals.user!.id),
      eq(agentMessages.role, 'assistant'),
      gte(agentMessages.createdAt, sevenDaysAgo),
    ));

  return {
    decks: rows,
    agentEditsLastWeek: editsRow?.n ?? 0,
  };
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
    await db.delete(decks).where(and(eq(decks.id, id), eq(decks.ownerId, locals.user!.id)));
    return { ok: true };
  },
};
