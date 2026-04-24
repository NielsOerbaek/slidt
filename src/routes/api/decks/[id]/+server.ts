import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, decks } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';
import { requireDeckRole } from '$lib/server/deck-access.ts';

export async function GET(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'viewer');
  const [deck] = await db.select().from(decks).where(eq(decks.id, event.params.id!)).limit(1);
  return json(deck);
}

export async function PATCH(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'editor');
  const body = await event.request.json().catch(() => ({}));
  const updates: Partial<typeof decks.$inferInsert> = {};
  if (typeof body.title === 'string') updates.title = body.title;
  if (typeof body.lang === 'string') updates.lang = body.lang;
  if (typeof body.themeId === 'string' || body.themeId === null) updates.themeId = body.themeId;
  if (Array.isArray(body.slideOrder)) updates.slideOrder = body.slideOrder;
  updates.updatedAt = new Date();
  const [updated] = await db.update(decks).set(updates).where(eq(decks.id, event.params.id!)).returning();
  return json(updated);
}

export async function DELETE(event: RequestEvent) {
  // Delete is owner-only
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'owner');
  await db.delete(decks).where(eq(decks.id, event.params.id!));
  return json({ ok: true });
}
