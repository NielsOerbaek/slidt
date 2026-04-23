import type { RequestEvent } from '@sveltejs/kit';
import { db, users, sessions, agentMessages, shareLinks, assets, slides, decks, slideTypes, themes } from '../../src/lib/server/db/index.ts';
import { hashPassword } from '../../src/lib/server/auth.ts';

export type MockUser = { id: string; email: string; name: string; password: string };

export async function createTestUser(
  overrides: Partial<{ email: string; name: string; password: string }> = {},
): Promise<MockUser> {
  const email = overrides.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.local`;
  const name = overrides.name ?? 'Test User';
  const password = overrides.password ?? 'test-password-123';
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ email, passwordHash, name }).returning();
  return { ...user!, password };
}

export async function cleanDB(): Promise<void> {
  await db.delete(sessions);
  await db.delete(agentMessages);
  await db.delete(shareLinks);
  await db.delete(assets);
  await db.delete(slides);
  await db.delete(decks);
  await db.delete(slideTypes);
  await db.delete(themes);
  await db.delete(users);
}

export function makeEvent(opts: {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
  user?: { id: string; email: string; name: string } | null;
}): RequestEvent {
  const url = new URL('http://localhost/api/test');
  const body = opts.body != null ? JSON.stringify(opts.body) : null;
  const headers: Record<string, string> = {};
  if (body != null) headers['Content-Type'] = 'application/json';
  return {
    request: new Request(url, { method: opts.method ?? 'GET', body, headers }),
    params: opts.params ?? {},
    url,
    cookies: {
      get: () => undefined,
      set: () => {},
      delete: () => {},
      getAll: () => [],
      serialize: (n: string, v: string) => `${n}=${v}`,
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
