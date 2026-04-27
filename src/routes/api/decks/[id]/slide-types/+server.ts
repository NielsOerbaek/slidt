import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, slideTypes } from '$lib/server/db/index.ts';
import { eq, or, and } from 'drizzle-orm';
import { requireDeckRole } from '$lib/server/deck-access.ts';

/**
 * Combined slide types for a deck: every global type plus any deck-scoped
 * type belonging to this deck. Returns both `id` (UUID) and `name` (slug)
 * so external scripts and the agent can pick up either reference.
 *
 * Requires viewer access on the deck (so we don't leak deck-scoped types
 * to outsiders). Global-only listings live at /api/templates.
 */
export async function GET(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'viewer');

  const rows = await db
    .select({
      id: slideTypes.id,
      name: slideTypes.name,
      label: slideTypes.label,
      fields: slideTypes.fields,
      htmlTemplate: slideTypes.htmlTemplate,
      css: slideTypes.css,
      scope: slideTypes.scope,
      deckId: slideTypes.deckId,
    })
    .from(slideTypes)
    .where(
      or(
        eq(slideTypes.scope, 'global'),
        and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, event.params.id!)),
      ),
    );

  return json({ slideTypes: rows });
}
