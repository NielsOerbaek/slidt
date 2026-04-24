import type { Actions, PageServerLoad } from './$types.js';
import { error, fail } from '@sveltejs/kit';
import { db, users, sessions } from '$lib/server/db/index.ts';
import { eq, desc } from 'drizzle-orm';
import { hashPassword, createApiKey, listApiKeys } from '$lib/server/auth.ts';

function requireAdmin(locals: App.Locals) {
  if (!locals.user) throw error(401, 'Not authenticated');
  if (!locals.user.isAdmin) throw error(403, 'Admin access required');
}

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      isAdmin: users.isAdmin,
      lastSeenAt: users.lastSeenAt,
    })
    .from(users)
    .orderBy(desc(users.lastSeenAt));
  return { users: allUsers };
};

export const actions: Actions = {
  createUser: async ({ locals, request }) => {
    requireAdmin(locals);
    const fd = await request.formData();
    const email = (fd.get('email') as string)?.toLowerCase().trim();
    const name = (fd.get('name') as string)?.trim();
    const password = fd.get('password') as string;
    const isAdmin = fd.get('isAdmin') === 'on';

    if (!email || !name || !password) return fail(400, { error: 'email, name, and password required' });
    if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters' });

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) return fail(400, { error: `User already exists: ${email}` });

    const passwordHash = await hashPassword(password);
    await db.insert(users).values({ email, name, passwordHash, isAdmin });
    return { success: true, action: 'createUser' };
  },

  deleteUser: async ({ locals, request }) => {
    requireAdmin(locals);
    const fd = await request.formData();
    const id = fd.get('id') as string;
    if (!id) return fail(400, { error: 'id required' });
    if (id === locals.user!.id) return fail(400, { error: 'Cannot delete yourself' });
    await db.delete(users).where(eq(users.id, id));
    return { success: true, action: 'deleteUser' };
  },

  setAdmin: async ({ locals, request }) => {
    requireAdmin(locals);
    const fd = await request.formData();
    const id = fd.get('id') as string;
    const isAdmin = fd.get('isAdmin') === 'true';
    if (!id) return fail(400, { error: 'id required' });
    await db.update(users).set({ isAdmin }).where(eq(users.id, id));
    return { success: true, action: 'setAdmin' };
  },

  resetPassword: async ({ locals, request }) => {
    requireAdmin(locals);
    const fd = await request.formData();
    const id = fd.get('id') as string;
    const password = fd.get('password') as string;
    if (!id || !password) return fail(400, { error: 'id and password required' });
    if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters' });
    const passwordHash = await hashPassword(password);
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
    // Invalidate all sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, id));
    return { success: true, action: 'resetPassword' };
  },
};
