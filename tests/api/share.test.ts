import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST as createShareLink } from '../../src/routes/api/decks/[id]/share/+server.ts';
import { makeEvent, createTestUser, cleanDB } from './helpers.ts';
import { db, decks, shareLinks } from '../../src/lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

describe('Share links', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;
  let deckId: string;

  beforeEach(async () => {
    await cleanDB();
    user = await createTestUser();
    const [deck] = await db.insert(decks).values({ title: 'Shared', lang: 'da', ownerId: user.id }).returning();
    deckId = deck!.id;
  });
  afterEach(cleanDB);

  it('POST creates a share link with a token', async () => {
    const event = makeEvent({ method: 'POST', params: { id: deckId }, user });
    const res = await createShareLink(event);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(10);
  });

  it('POST with expiresAt stores expiry', async () => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const event = makeEvent({ method: 'POST', body: { expiresAt }, params: { id: deckId }, user });
    const res = await createShareLink(event);
    const body = await res.json();
    const [link] = await db.select().from(shareLinks).where(eq(shareLinks.token, body.token));
    expect(link!.expiresAt).not.toBeNull();
  });

  it('returns 401 if not authenticated', async () => {
    const event = makeEvent({ method: 'POST', params: { id: deckId }, user: null });
    const res = await createShareLink(event);
    expect(res.status).toBe(401);
  });
});
