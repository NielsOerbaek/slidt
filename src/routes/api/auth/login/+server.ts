import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, users } from '$lib/server/db/index.ts';
import { verifyPassword, createSession } from '$lib/server/auth.ts';
import { eq } from 'drizzle-orm';

export async function POST(event: RequestEvent) {
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return new Response(JSON.stringify({ message: 'email and password required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email.toLowerCase().trim()))
    .limit(1);

  if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
    return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = await createSession(user.id);

  await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, user.id));

  event.cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60,
  });

  return json({ user: { id: user.id, email: user.email, name: user.name } });
}
