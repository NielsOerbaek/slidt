import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as listThemes, POST as createTheme } from '../../src/routes/api/themes/+server.ts';
import { GET as getTheme, PATCH as patchTheme, DELETE as deleteTheme } from '../../src/routes/api/themes/[id]/+server.ts';
import { makeEvent, createTestUser, cleanDB } from './helpers.ts';
import { db, themes } from '../../src/lib/server/db/index.ts';

describe('Theme CRUD', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;
  beforeEach(async () => { await cleanDB(); user = await createTestUser(); });
  afterEach(cleanDB);

  it('POST creates a global theme', async () => {
    const event = makeEvent({
      method: 'POST',
      body: { name: 'my-theme', tokens: { '--color': 'red' }, scope: 'global' },
      user,
    });
    const res = await createTheme(event);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('my-theme');
    expect(body.tokens['--color']).toBe('red');
  });

  it('GET lists all global themes', async () => {
    await db.insert(themes).values([
      { name: 'a', tokens: {}, scope: 'global' },
      { name: 'b', tokens: {}, scope: 'global' },
    ]);
    const res = await listThemes(makeEvent({ user }));
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(2);
  });

  it('PATCH updates theme tokens', async () => {
    const [theme] = await db.insert(themes).values({ name: 't', tokens: { '--x': '1' }, scope: 'global' }).returning();
    const res = await patchTheme(makeEvent({ method: 'PATCH', body: { tokens: { '--x': '2' } }, params: { id: theme!.id }, user }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tokens['--x']).toBe('2');
  });

  it('DELETE removes theme', async () => {
    const [theme] = await db.insert(themes).values({ name: 't', tokens: {}, scope: 'global' }).returning();
    const res = await deleteTheme(makeEvent({ method: 'DELETE', params: { id: theme!.id }, user }));
    expect(res.status).toBe(200);
  });
});
