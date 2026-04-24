import type { Actions, PageServerLoad } from './$types.js';
import { db, decks, agentMessages, slides, slideTypes, deckCollaborators } from '$lib/server/db/index.ts';
import { eq, desc, and, gte, sql, inArray } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const ownedDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.ownerId, locals.user!.id))
    .orderBy(desc(decks.updatedAt));

  const sharedDeckRows = await db
    .select({ deckId: deckCollaborators.deckId })
    .from(deckCollaborators)
    .where(eq(deckCollaborators.userId, locals.user!.id));

  const sharedDecks = sharedDeckRows.length > 0
    ? await db
        .select()
        .from(decks)
        .where(inArray(decks.id, sharedDeckRows.map(r => r.deckId)))
        .orderBy(desc(decks.updatedAt))
    : [];

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
    decks: ownedDecks,
    sharedDecks,
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

  duplicate: async ({ locals, request }) => {
    if (!locals.user) throw redirect(302, '/login');
    const fd = await request.formData();
    const id = fd.get('id') as string;
    if (!id) return fail(400, { error: 'id required' });

    const [original] = await db
      .select()
      .from(decks)
      .where(and(eq(decks.id, id), eq(decks.ownerId, locals.user.id)))
      .limit(1);
    if (!original) return fail(404, { error: 'Deck not found' });

    const deckScopedTypes = await db
      .select()
      .from(slideTypes)
      .where(and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, id)));
    const originalSlides = await db.select().from(slides).where(eq(slides.deckId, id));

    const newDeck = await db.transaction(async (tx) => {
      const [nd] = await tx
        .insert(decks)
        .values({ title: `Copy of ${original.title}`, lang: original.lang, themeId: original.themeId, ownerId: locals.user!.id, slideOrder: [] })
        .returning();
      const typeIdMap = new Map<string, string>();
      for (const st of deckScopedTypes) {
        const [nt] = await tx.insert(slideTypes).values({ name: st.name, label: st.label, fields: st.fields, htmlTemplate: st.htmlTemplate, css: st.css, scope: 'deck', deckId: nd!.id }).returning({ id: slideTypes.id });
        typeIdMap.set(st.id, nt!.id);
      }
      const slideIdMap = new Map<string, string>();
      for (const s of originalSlides) {
        const [ns] = await tx.insert(slides).values({ deckId: nd!.id, typeId: typeIdMap.get(s.typeId) ?? s.typeId, data: s.data, orderIndex: s.orderIndex }).returning({ id: slides.id });
        slideIdMap.set(s.id, ns!.id);
      }
      const newOrder = original.slideOrder.map(id => slideIdMap.get(id)).filter((id): id is string => id !== undefined);
      const [updated] = await tx.update(decks).set({ slideOrder: newOrder }).where(eq(decks.id, nd!.id)).returning();
      return updated!;
    });

    throw redirect(303, `/decks/${newDeck.id}`);
  },
};
