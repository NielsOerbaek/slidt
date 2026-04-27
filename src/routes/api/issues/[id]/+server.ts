import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, issues } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  if (!event.locals.user.isAdmin) throw error(403, 'Admins only');
  const [row] = await db.select().from(issues).where(eq(issues.id, event.params.id!)).limit(1);
  if (!row) throw error(404, 'Issue not found');
  return json(row);
}

/**
 * Update an issue's status or severity. Body: `{ status?: 'open' | 'resolved', severity?: 'low' | 'medium' | 'high' }`.
 */
export async function PATCH(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  if (!event.locals.user.isAdmin) throw error(403, 'Admins only');

  const body = await event.request.json().catch(() => null);
  if (!body || typeof body !== 'object') throw error(400, 'Body required');

  const updates: { status?: 'open' | 'resolved'; severity?: 'low' | 'medium' | 'high' } = {};
  if (body.status === 'open' || body.status === 'resolved') updates.status = body.status;
  if (body.severity === 'low' || body.severity === 'medium' || body.severity === 'high') {
    updates.severity = body.severity;
  }
  if (Object.keys(updates).length === 0) {
    throw error(400, 'Nothing to update — provide status and/or severity');
  }

  const [updated] = await db
    .update(issues)
    .set(updates)
    .where(eq(issues.id, event.params.id!))
    .returning();
  if (!updated) throw error(404, 'Issue not found');
  return json(updated);
}

export async function DELETE(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  if (!event.locals.user.isAdmin) throw error(403, 'Admins only');
  const result = await db
    .delete(issues)
    .where(eq(issues.id, event.params.id!))
    .returning({ id: issues.id });
  if (result.length === 0) throw error(404, 'Issue not found');
  return json({ ok: true });
}
