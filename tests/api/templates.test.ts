import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as listTemplates, POST as createTemplate } from '../../src/routes/api/templates/+server.ts';
import { GET as getTemplate, PATCH as patchTemplate, DELETE as deleteTemplate } from '../../src/routes/api/templates/[id]/+server.ts';
import { makeEvent, createTestUser, cleanDB } from './helpers.ts';
import { db, slideTypes } from '../../src/lib/server/db/index.ts';

describe('Template (SlideType) CRUD', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>;
  beforeEach(async () => { await cleanDB(); user = await createTestUser(); });
  afterEach(cleanDB);

  it('POST creates a slide type', async () => {
    const event = makeEvent({
      method: 'POST',
      body: {
        name: 'my-slide', label: 'My Slide',
        fields: [{ name: 'text', type: 'text' }],
        htmlTemplate: '<p>{{text}}</p>', css: '', scope: 'global',
      },
      user,
    });
    const res = await createTemplate(event);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('my-slide');
  });

  it('GET lists all global slide types', async () => {
    await db.insert(slideTypes).values([
      { name: 'type-a', label: 'A', fields: [], htmlTemplate: '', css: '', scope: 'global' },
      { name: 'type-b', label: 'B', fields: [], htmlTemplate: '', css: '', scope: 'global' },
    ]);
    const res = await listTemplates(makeEvent({ user }));
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(2);
  });

  it('PATCH updates template fields', async () => {
    const [st] = await db.insert(slideTypes).values({
      name: 'edit-me', label: 'Old', fields: [], htmlTemplate: '', css: '', scope: 'global'
    }).returning();
    const res = await patchTemplate(makeEvent({
      method: 'PATCH', body: { label: 'New Label' }, params: { id: st!.id }, user,
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.label).toBe('New Label');
  });
});
