import type { Actions, PageServerLoad } from './$types.js';
import { error, fail } from '@sveltejs/kit';
import {
  createApiKey, listApiKeys, deleteApiKey,
  updateProfile, changePassword, updatePreferences,
} from '$lib/server/auth.ts';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw error(401, 'Not authenticated');
  const keys = await listApiKeys(locals.user.id);
  return { keys, user: locals.user };
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

  updateProfile: async ({ locals, request }) => {
    if (!locals.user) throw error(401, 'Not authenticated');
    const fd = await request.formData();
    const name = (fd.get('name') as string)?.trim();
    if (!name) return fail(400, { profileError: 'Name required' });
    await updateProfile(locals.user.id, name);
    return { profileSuccess: true };
  },

  changePassword: async ({ locals, request }) => {
    if (!locals.user) throw error(401, 'Not authenticated');
    const fd = await request.formData();
    const current = fd.get('current') as string;
    const next = (fd.get('next') as string)?.trim();
    const confirm = fd.get('confirm') as string;
    if (!current || !next) return fail(400, { pwError: 'All fields required' });
    if (next !== confirm) return fail(400, { pwError: 'Passwords do not match' });
    if (next.length < 8) return fail(400, { pwError: 'Minimum 8 characters' });
    const result = await changePassword(locals.user.id, current, next);
    if (!result.ok) return fail(400, { pwError: result.error });
    return { pwSuccess: true };
  },

  updatePreferences: async ({ locals, request }) => {
    if (!locals.user) throw error(401, 'Not authenticated');
    const fd = await request.formData();
    const vim = fd.get('vim') === 'on';
    const locale = fd.get('locale') as 'da' | 'en' | null;
    await updatePreferences(locals.user.id, {
      vim,
      ...(locale ? { locale } : {}),
    });
    return { prefsSuccess: true };
  },
};
