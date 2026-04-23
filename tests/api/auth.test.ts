import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST as login } from '../../src/routes/api/auth/login/+server.ts';
import { POST as logout } from '../../src/routes/api/auth/logout/+server.ts';
import { makeEvent, createTestUser, cleanDB } from './helpers.ts';
import { db, sessions } from '../../src/lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

describe('POST /api/auth/login', () => {
  beforeEach(cleanDB);
  afterEach(cleanDB);

  it('returns 200 and sets session cookie for valid credentials', async () => {
    const user = await createTestUser({ password: 'secret123' });
    const cookieStore = new Map<string, string>();
    const event = makeEventWithCookies(
      { method: 'POST', body: { email: user.email, password: 'secret123' } },
      cookieStore,
    );
    const res = await login(event);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBe(user.id);
    expect(cookieStore.has('session')).toBe(true);
  });

  it('returns 401 for wrong password', async () => {
    const user = await createTestUser({ password: 'secret123' });
    const event = makeEvent({ method: 'POST', body: { email: user.email, password: 'wrong' } });
    const res = await login(event);
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const event = makeEvent({ method: 'POST', body: { email: 'nobody@test.local', password: 'x' } });
    const res = await login(event);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  beforeEach(cleanDB);
  afterEach(cleanDB);

  it('deletes session and clears cookie', async () => {
    const user = await createTestUser();
    const cookieStore = new Map<string, string>();
    const loginEvent = makeEventWithCookies(
      { method: 'POST', body: { email: user.email, password: user.password } },
      cookieStore,
    );
    await login(loginEvent);
    const sessionToken = cookieStore.get('session')!;
    expect(sessionToken).toBeDefined();

    const logoutEvent = makeEventWithCookies({ user, method: 'POST' }, cookieStore);
    const res = await logout(logoutEvent);
    expect(res.status).toBe(200);

    const remaining = await db.select().from(sessions).where(eq(sessions.id, sessionToken));
    expect(remaining).toHaveLength(0);
  });
});

import type { RequestEvent } from '@sveltejs/kit';
function makeEventWithCookies(
  opts: { method?: string; body?: unknown; user?: { id: string; email: string; name: string } | null },
  store: Map<string, string>,
): RequestEvent {
  const url = new URL('http://localhost/api/auth');
  const body = opts.body != null ? JSON.stringify(opts.body) : null;
  const headers: Record<string, string> = {};
  if (body != null) headers['Content-Type'] = 'application/json';
  return {
    request: new Request(url, { method: opts.method ?? 'POST', body, headers }),
    params: {},
    url,
    cookies: {
      get: (name: string) => store.get(name),
      set: (name: string, value: string) => { store.set(name, value); },
      delete: (name: string) => { store.delete(name); },
      getAll: () => [...store.entries()].map(([name, value]) => ({ name, value })),
      serialize: (name: string, value: string) => `${name}=${value}`,
    },
    locals: { user: opts.user ?? null },
    platform: undefined,
    fetch: globalThis.fetch,
    getClientAddress: () => '127.0.0.1',
    isDataRequest: false,
    isSubRequest: false,
    route: { id: '' },
    setHeaders: () => {},
  } as unknown as RequestEvent;
}
