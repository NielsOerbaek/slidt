import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handle } from '../../src/hooks.server.ts';
import { createSession, hashPassword } from '../../src/lib/server/auth.ts';
import { db, users } from '../../src/lib/server/db/index.ts';
import { cleanDB, createTestUser } from './helpers.ts';

describe('hooks.server handle', () => {
  beforeEach(cleanDB);
  afterEach(cleanDB);

  it('sets locals.user to null when no cookie', async () => {
    const event = makeMockEvent({});
    let capturedLocals: App.Locals | null = null;
    await handle({
      event,
      resolve: async (e) => {
        capturedLocals = e.locals;
        return new Response('ok');
      },
    });
    expect(capturedLocals!.user).toBeNull();
  });

  it('sets locals.user when valid session cookie present', async () => {
    const { id: userId } = await createTestUser();
    const token = await createSession(userId);
    const event = makeMockEvent({ sessionCookie: token });
    let capturedLocals: App.Locals | null = null;
    await handle({
      event,
      resolve: async (e) => {
        capturedLocals = e.locals;
        return new Response('ok');
      },
    });
    expect(capturedLocals!.user).not.toBeNull();
    expect(capturedLocals!.user!.id).toBe(userId);
  });
});

function makeMockEvent(opts: { sessionCookie?: string }) {
  const cookies = new Map<string, string>();
  if (opts.sessionCookie) cookies.set('session', opts.sessionCookie);
  return {
    request: new Request('http://localhost/'),
    cookies: {
      get: (name: string) => cookies.get(name),
      set: (name: string, value: string) => { cookies.set(name, value); },
      delete: (name: string) => { cookies.delete(name); },
      getAll: () => [...cookies.entries()].map(([name, value]) => ({ name, value })),
      serialize: (name: string, value: string) => `${name}=${value}`,
    },
    locals: { user: null } as App.Locals,
    url: new URL('http://localhost/'),
    params: {},
    platform: undefined,
    fetch: globalThis.fetch,
    getClientAddress: () => '127.0.0.1',
    isDataRequest: false,
    isSubRequest: false,
    route: { id: '' },
    setHeaders: () => {},
  } as unknown as import('@sveltejs/kit').RequestEvent;
}
