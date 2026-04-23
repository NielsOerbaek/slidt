import type { Actions, PageServerLoad } from './$types.js';
import { error, fail } from '@sveltejs/kit';
import { db, slideTypes } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
  const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, params.id)).limit(1);
  if (!st) throw error(404, 'Template not found');
  return { slideType: st };
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
};
