import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, slideTypes } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, event.params.id!)).limit(1);
  if (!st) throw error(404, 'Template not found');
  return json(st);
}

export async function PATCH(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [existing] = await db.select().from(slideTypes).where(eq(slideTypes.id, event.params.id!)).limit(1);
  if (!existing) throw error(404, 'Template not found');
  const body = await event.request.json().catch(() => ({}));
  const updates: Partial<typeof slideTypes.$inferInsert> = {};
  if (typeof body.label === 'string') updates.label = body.label;
  if (Array.isArray(body.fields)) updates.fields = body.fields;
  if (typeof body.htmlTemplate === 'string') updates.htmlTemplate = body.htmlTemplate;
  if (typeof body.css === 'string') updates.css = body.css;
  if (body.scope === 'global' || body.scope === 'deck') updates.scope = body.scope;
  const [updated] = await db.update(slideTypes).set(updates).where(eq(slideTypes.id, event.params.id!)).returning();
  return json(updated);
}

export async function DELETE(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [existing] = await db.select().from(slideTypes).where(eq(slideTypes.id, event.params.id!)).limit(1);
  if (!existing) throw error(404, 'Template not found');
  await db.delete(slideTypes).where(eq(slideTypes.id, event.params.id!));
  return json({ ok: true });
}
