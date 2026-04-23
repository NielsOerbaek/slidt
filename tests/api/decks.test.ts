import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as listDecks, POST as createDeck } from '../../src/routes/api/decks/+server.ts';
import { GET as getDeck, PATCH as patchDeck, DELETE as deleteDeck } from '../../src/routes/api/decks/[id]/+server.ts';
import { makeEvent, createTestUser, cleanDB } from './helpers.ts';
import { db, decks } from '../../src/lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

describe('Deck CRUD', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await cleanDB();
    user = await createTestUser();
  });
  afterEach(cleanDB);

  it('POST /api/decks creates a deck', async () => {
    const event = makeEvent({ method: 'POST', body: { title: 'Q1 Review', lang: 'da' }, user });
    const res = await createDeck(event);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.title).toBe('Q1 Review');
    expect(body.ownerId).toBe(user.id);
  });

  it('GET /api/decks returns owned decks', async () => {
    await db.insert(decks).values({ title: 'Deck 1', lang: 'da', ownerId: user.id });
    await db.insert(decks).values({ title: 'Deck 2', lang: 'en', ownerId: user.id });
    const event = makeEvent({ user });
    const res = await listDecks(event);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  it('GET /api/decks/[id] returns 404 for missing deck', async () => {
    const event = makeEvent({ params: { id: crypto.randomUUID() }, user });
    const res = await getDeck(event);
    expect(res.status).toBe(404);
  });

  it('PATCH /api/decks/[id] updates title', async () => {
    const [deck] = await db.insert(decks).values({ title: 'Old', lang: 'da', ownerId: user.id }).returning();
    const event = makeEvent({ method: 'PATCH', body: { title: 'New' }, params: { id: deck!.id }, user });
    const res = await patchDeck(event);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('New');
  });

  it('DELETE /api/decks/[id] removes deck', async () => {
    const [deck] = await db.insert(decks).values({ title: 'Gone', lang: 'da', ownerId: user.id }).returning();
    const event = makeEvent({ method: 'DELETE', params: { id: deck!.id }, user });
    const res = await deleteDeck(event);
    expect(res.status).toBe(200);
    const remaining = await db.select().from(decks).where(eq(decks.id, deck!.id));
    expect(remaining).toHaveLength(0);
  });

  it('returns 401 when not authenticated', async () => {
    const event = makeEvent({ method: 'POST', body: { title: 'X', lang: 'da' }, user: null });
    const res = await createDeck(event);
    expect(res.status).toBe(401);
  });
});
