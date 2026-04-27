import type { Actions, PageServerLoad } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import { db, users } from '$lib/server/db/index.ts';
import { verifyPassword, createSession, SESSION_DURATION_SECONDS } from '$lib/server/auth.ts';
import { eq } from 'drizzle-orm';
import { normalizeEmail } from '$lib/utils/auth-utils.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) throw redirect(302, url.searchParams.get('next') ?? '/decks');
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const fd = await request.formData();
    const email = fd.get('email');
    const password = fd.get('password');

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return fail(400, { error: 'Email and password are required.' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(email)))
      .limit(1);

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return fail(401, { error: 'Invalid email or password.' });
    }

    const token = await createSession(user.id);
    cookies.set('session', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION_SECONDS,
    });

    throw redirect(302, '/decks');
  },
};
