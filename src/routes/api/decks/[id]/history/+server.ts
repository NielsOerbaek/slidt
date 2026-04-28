import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, slideEdits, users } from '$lib/server/db/index.ts';
import { and, desc, eq, lt } from 'drizzle-orm';
import { requireDeckRole } from '$lib/server/deck-access.ts';

/**
 * Recent edit log for a deck. Viewer-or-better access. Paginated by
 * `before` (an ISO timestamp from a previous response's `nextCursor`).
 *   ?limit=N      default 100, max 500
 *   ?before=ISO   return rows strictly older than this timestamp
 */
export async function GET(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'viewer');

  const url = event.url;
  const limitRaw = Number(url.searchParams.get('limit') ?? '100');
  const limit = Math.min(500, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 100));
  const beforeRaw = url.searchParams.get('before');
  const before = beforeRaw ? new Date(beforeRaw) : null;

  const conds = [eq(slideEdits.deckId, event.params.id!)];
  if (before && !Number.isNaN(before.getTime())) conds.push(lt(slideEdits.at, before));

  const rows = await db
    .select({
      id: slideEdits.id,
      slideId: slideEdits.slideId,
      userId: slideEdits.userId,
      userName: users.name,
      at: slideEdits.at,
      kind: slideEdits.kind,
      summary: slideEdits.summary,
    })
    .from(slideEdits)
    .leftJoin(users, eq(slideEdits.userId, users.id))
    .where(and(...conds))
    .orderBy(desc(slideEdits.at))
    .limit(limit);

  const nextCursor = rows.length === limit ? rows[rows.length - 1]!.at.toISOString() : null;
  return json({ edits: rows, nextCursor });
}
