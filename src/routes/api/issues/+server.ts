import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, issues, users, decks } from '$lib/server/db/index.ts';
import { desc, eq, and } from 'drizzle-orm';

/**
 * List agent-reported (or user-reported) issues. Admin-only — these can
 * include details about deck content the reporting user might not want
 * exposed to other accounts.
 *
 * Query params:
 *   ?status=open|resolved      filter by status
 *   ?severity=low|medium|high  filter by severity
 *   ?limit=N                   default 100, max 500
 */
export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  if (!event.locals.user.isAdmin) throw error(403, 'Admins only');

  const url = event.url;
  const status = url.searchParams.get('status');
  const severity = url.searchParams.get('severity');
  const limitRaw = Number(url.searchParams.get('limit') ?? '100');
  const limit = Math.min(500, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 100));

  const conds = [];
  if (status === 'open' || status === 'resolved') conds.push(eq(issues.status, status));
  if (severity === 'low' || severity === 'medium' || severity === 'high') {
    conds.push(eq(issues.severity, severity));
  }

  const rows = await db
    .select({
      id: issues.id,
      title: issues.title,
      body: issues.body,
      severity: issues.severity,
      status: issues.status,
      createdAt: issues.createdAt,
      userId: issues.userId,
      userEmail: users.email,
      userName: users.name,
      deckId: issues.deckId,
      deckTitle: decks.title,
    })
    .from(issues)
    .leftJoin(users, eq(issues.userId, users.id))
    .leftJoin(decks, eq(issues.deckId, decks.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(issues.createdAt))
    .limit(limit);

  return json({ issues: rows });
}
