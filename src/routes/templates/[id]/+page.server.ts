import type { Actions, PageServerLoad } from './$types.js';
import { error, fail } from '@sveltejs/kit';
import { db, slideTypes, decks } from '$lib/server/db/index.ts';
import { and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
  const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, params.id)).limit(1);
  if (!st) throw error(404, 'Template not found');

  let deckTitle: string | null = null;
  if (st.deckId) {
    const [d] = await db.select({ title: decks.title }).from(decks).where(eq(decks.id, st.deckId)).limit(1);
    deckTitle = d?.title ?? null;
  }

  return { slideType: st, deckTitle };
};

export const actions: Actions = {
  save: async ({ params, request }) => {
    const fd = await request.formData();
    const label = fd.get('label');
    const htmlTemplate = fd.get('htmlTemplate');
    const css = fd.get('css');
    const fieldsRaw = fd.get('fields');

    if (typeof fieldsRaw !== 'string') return fail(400, { error: 'fields required' });
    let fields;
    try {
      fields = JSON.parse(fieldsRaw);
      if (!Array.isArray(fields)) throw new Error('not array');
    } catch {
      return fail(400, { error: 'fields must be a valid JSON array' });
    }

    const updates: Record<string, unknown> = { fields };
    if (typeof label === 'string' && label.trim()) updates['label'] = label.trim();
    if (typeof htmlTemplate === 'string') updates['htmlTemplate'] = htmlTemplate;
    if (typeof css === 'string') updates['css'] = css;

    const [updated] = await db
      .update(slideTypes)
      .set(updates)
      .where(eq(slideTypes.id, params.id))
      .returning();
    return { slideType: updated };
  },

  promote: async ({ params, locals }) => {
    if (!locals.user?.isAdmin) return fail(403, { error: 'Admins only' });

    const [existing] = await db
      .select()
      .from(slideTypes)
      .where(eq(slideTypes.id, params.id))
      .limit(1);
    if (!existing) return fail(404, { error: 'Template not found' });
    if (existing.scope === 'global') return { slideType: existing };

    // Promotion fails the unique (name, scope, deck_id) constraint if a global
    // template with the same name already exists. Surface that explicitly.
    const [conflict] = await db
      .select({ id: slideTypes.id })
      .from(slideTypes)
      .where(and(eq(slideTypes.name, existing.name), eq(slideTypes.scope, 'global')))
      .limit(1);
    if (conflict) {
      return fail(409, {
        error: `A global template named "${existing.name}" already exists. Rename this one first.`,
      });
    }

    const [updated] = await db
      .update(slideTypes)
      .set({ scope: 'global', deckId: null })
      .where(eq(slideTypes.id, params.id))
      .returning();
    return { slideType: updated, promoted: true };
  },
};
