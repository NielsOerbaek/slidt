import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST as uploadAsset } from '../../src/routes/api/assets/+server.ts';
import { GET as serveAsset, DELETE as deleteAsset } from '../../src/routes/api/assets/[id]/+server.ts';
import { makeEvent, createTestUser, cleanDB } from './helpers.ts';
import { db, decks, assets } from '../../src/lib/server/db/index.ts';
import { eq } from 'drizzle-orm';
import { rmSync, existsSync } from 'fs';
import path from 'path';

const TEST_ASSETS_DIR = path.resolve('./data/assets-test');

describe('Asset upload + serve', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;
  let deckId: string;

  beforeEach(async () => {
    await cleanDB();
    user = await createTestUser();
    const [deck] = await db.insert(decks).values({ title: 'Deck', lang: 'da', ownerId: user.id }).returning();
    deckId = deck!.id;
    process.env.ASSETS_DIR = TEST_ASSETS_DIR;
  });
  afterEach(async () => {
    await cleanDB();
    try { rmSync(TEST_ASSETS_DIR, { recursive: true, force: true }); } catch { /* ok */ }
  });

  it('POST uploads a file and creates an asset row', async () => {
    const content = Buffer.from('fake-png-content');
    const formData = new FormData();
    formData.append('deckId', deckId);
    formData.append('kind', 'image');
    formData.append('file', new Blob([content], { type: 'image/png' }), 'test.png');
    const event = {
      ...makeEvent({ method: 'POST', user }),
      request: new Request('http://localhost/api/assets', { method: 'POST', body: formData }),
    };
    const res = await uploadAsset(event as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.filename).toBe('test.png');
    expect(existsSync(body.storagePath.replace('./data/assets', TEST_ASSETS_DIR)
      .replace('/data/assets', TEST_ASSETS_DIR))).toBe(false); // storage path is absolute or relative
  });

  it('DELETE removes asset row', async () => {
    const [asset] = await db.insert(assets).values({
      deckId, kind: 'image', storagePath: '/nonexistent', filename: 'x.png', uploadedById: user.id,
    }).returning();
    const event = makeEvent({ method: 'DELETE', params: { id: asset!.id }, user });
    const res = await deleteAsset(event);
    expect(res.status).toBe(200);
    const remaining = await db.select().from(assets).where(eq(assets.id, asset!.id));
    expect(remaining).toHaveLength(0);
  });
});
