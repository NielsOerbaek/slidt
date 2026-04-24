import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, themes } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [theme] = await db.select().from(themes).where(eq(themes.id, event.params.id!)).limit(1);
  if (!theme) throw error(404, 'Theme not found');
  return json(theme);
}

export async function PATCH(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [existing] = await db.select().from(themes).where(eq(themes.id, event.params.id!)).limit(1);
  if (!existing) throw error(404, 'Theme not found');
  const body = await event.request.json().catch(() => ({}));
  const updates: Partial<typeof themes.$inferInsert> = {};
  if (typeof body.name === 'string') updates.name = body.name;
  if (body.tokens && typeof body.tokens === 'object') updates.tokens = body.tokens;
  if (body.scope === 'global' || body.scope === 'deck') updates.scope = body.scope;
  if ('systemPrompt' in body) updates.systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : null;
  const [updated] = await db.update(themes).set(updates).where(eq(themes.id, event.params.id!)).returning();
  return json(updated);
}

export async function DELETE(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [existing] = await db.select().from(themes).where(eq(themes.id, event.params.id!)).limit(1);
  if (!existing) throw error(404, 'Theme not found');
  await db.delete(themes).where(eq(themes.id, event.params.id!));
  return json({ ok: true });
}
