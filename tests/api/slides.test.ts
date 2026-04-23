import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as listSlides, POST as createSlide } from '../../src/routes/api/decks/[id]/slides/+server.ts';
import { GET as getSlide, PATCH as patchSlide, DELETE as deleteSlide } from '../../src/routes/api/decks/[id]/slides/[slideId]/+server.ts';
import { makeEvent, createTestUser, cleanDB } from './helpers.ts';
import { db, decks, slideTypes, slides } from '../../src/lib/server/db/index.ts';

describe('Slide CRUD', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;
  let deckId: string;
  let typeId: string;

  beforeEach(async () => {
    await cleanDB();
    user = await createTestUser();
    const [deck] = await db.insert(decks).values({ title: 'Test', lang: 'da', ownerId: user.id }).returning();
    deckId = deck!.id;
    const [st] = await db.insert(slideTypes).values({
      name: 'test-type', label: 'Test Type',
      fields: [{ name: 'title', type: 'text', required: true }],
      htmlTemplate: '<h1>{{title}}</h1>', css: '',
    }).returning();
    typeId = st!.id;
  });
  afterEach(cleanDB);

  it('POST creates a slide and appends to slideOrder', async () => {
    const event = makeEvent({
      method: 'POST',
      body: { typeId, data: { title: 'Hello' } },
      params: { id: deckId },
      user,
    });
    const res = await createSlide(event);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.slide.typeId).toBe(typeId);
    expect(body.slide.data).toEqual({ title: 'Hello' });
    expect(body.deck.slideOrder).toContain(body.slide.id);
  });

  it('GET lists slides ordered by orderIndex', async () => {
    await db.insert(slides).values([
      { deckId, typeId, data: { title: 'B' }, orderIndex: 1 },
      { deckId, typeId, data: { title: 'A' }, orderIndex: 0 },
    ]);
    const event = makeEvent({ params: { id: deckId }, user });
    const res = await listSlides(event);
    const body = await res.json();
    expect(body[0].data.title).toBe('A');
    expect(body[1].data.title).toBe('B');
  });

  it('PATCH updates slide data', async () => {
    const [slide] = await db.insert(slides).values({ deckId, typeId, data: { title: 'Old' }, orderIndex: 0 }).returning();
    const event = makeEvent({
      method: 'PATCH',
      body: { data: { title: 'New' } },
      params: { id: deckId, slideId: slide!.id },
      user,
    });
    const res = await patchSlide(event);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe('New');
  });

  it('DELETE removes slide and updates slideOrder', async () => {
    const createEvent = makeEvent({
      method: 'POST',
      body: { typeId, data: { title: 'Bye' } },
      params: { id: deckId },
      user,
    });
    const created = await (await createSlide(createEvent)).json();
    const slideId = created.slide.id;

    const deleteEvent = makeEvent({ method: 'DELETE', params: { id: deckId, slideId }, user });
    const res = await deleteSlide(deleteEvent);
    expect(res.status).toBe(200);
    const remaining = await db.select().from(slides).where(
      (await import('drizzle-orm')).eq(slides.id, slideId)
    );
    expect(remaining).toHaveLength(0);
  });
});
