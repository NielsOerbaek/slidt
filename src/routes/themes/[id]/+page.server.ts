import type { Actions, PageServerLoad } from './$types.js';
import { error, fail } from '@sveltejs/kit';
import { db, themes } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
  const [theme] = await db.select().from(themes).where(eq(themes.id, params.id)).limit(1);
  if (!theme) throw error(404, 'Theme not found');
  return { theme };
};

export const actions: Actions = {
  save: async ({ params, locals, request }) => {
    const fd = await request.formData();
    const tokensRaw = fd.get('tokens');
    const name = fd.get('name');
    if (typeof tokensRaw !== 'string') return fail(400, { error: 'tokens required' });
    let tokens: Record<string, string>;
    try {
      tokens = JSON.parse(tokensRaw);
    } catch {
      return fail(400, { error: 'Invalid tokens JSON' });
    }
    const systemPrompt = fd.get('systemPrompt');
    const updates: Record<string, unknown> = { tokens };
    if (typeof name === 'string' && name.trim()) updates['name'] = name.trim();
    if (typeof systemPrompt === 'string') updates['systemPrompt'] = systemPrompt.trim() || null;
    const [updated] = await db
      .update(themes)
      .set(updates)
      .where(eq(themes.id, params.id))
      .returning();
    return { theme: updated };
  },
};
