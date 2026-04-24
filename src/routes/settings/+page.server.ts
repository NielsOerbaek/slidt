import type { Actions, PageServerLoad } from './$types.js';
import { error, fail } from '@sveltejs/kit';
import { createApiKey, listApiKeys, deleteApiKey } from '$lib/server/auth.ts';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw error(401, 'Not authenticated');
  const keys = await listApiKeys(locals.user.id);
  return { keys };
};

export const actions: Actions = {
  createKey: async ({ locals, request }) => {
    if (!locals.user) throw error(401, 'Not authenticated');
    const fd = await request.formData();
    const name = (fd.get('name') as string)?.trim();
    if (!name) return fail(400, { error: 'Name required' });
    const { token, key } = await createApiKey(locals.user.id, name);
    return { success: true, token, keyId: key.id };
  },

  revokeKey: async ({ locals, request }) => {
    if (!locals.user) throw error(401, 'Not authenticated');
    const fd = await request.formData();
    const id = fd.get('id') as string;
    if (!id) return fail(400, { error: 'id required' });
    await deleteApiKey(id, locals.user.id);
    return { success: true };
  },
};
