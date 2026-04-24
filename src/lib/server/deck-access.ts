import { db } from '$lib/server/db/index.ts';
import { decks, deckCollaborators, users } from '$lib/server/db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export type DeckRole = 'owner' | 'editor' | 'viewer';

/**
 * Returns the access level a user has on a deck, or null if none.
 * Checks owner first, then collaborator table.
 */
export async function resolveDeckAccess(
  deckId: string,
  userId: string,
): Promise<DeckRole | null> {
  const [deck] = await db
    .select({ ownerId: decks.ownerId })
    .from(decks)
    .where(eq(decks.id, deckId))
    .limit(1);

  if (!deck) return null;
  if (deck.ownerId === userId) return 'owner';

  const [collab] = await db
    .select({ role: deckCollaborators.role })
    .from(deckCollaborators)
    .where(and(eq(deckCollaborators.deckId, deckId), eq(deckCollaborators.userId, userId)))
    .limit(1);

  if (!collab) return null;
  return collab.role;
}

/**
 * Convenience: throws a SvelteKit error if user can't access deck at minRole level.
 * Returns the resolved role on success.
 */
export async function requireDeckRole(
  deckId: string,
  userId: string | undefined,
  minRole: DeckRole = 'viewer',
): Promise<DeckRole> {
  if (!userId) throw error(401, 'Not authenticated');
  const role = await resolveDeckAccess(deckId, userId);
  if (!role) throw error(404, 'Deck not found');
  const order: DeckRole[] = ['viewer', 'editor', 'owner'];
  if (order.indexOf(role) < order.indexOf(minRole)) throw error(403, 'Insufficient access');
  return role;
}

// ── Collaborator management (owner-only operations) ───────────────────────

export async function listCollaborators(deckId: string) {
  return db
    .select({
      id: deckCollaborators.id,
      userId: deckCollaborators.userId,
      role: deckCollaborators.role,
      name: users.name,
      email: users.email,
      createdAt: deckCollaborators.createdAt,
    })
    .from(deckCollaborators)
    .innerJoin(users, eq(deckCollaborators.userId, users.id))
    .where(eq(deckCollaborators.deckId, deckId));
}

export async function addCollaborator(
  deckId: string,
  email: string,
  role: 'editor' | 'viewer' = 'editor',
): Promise<{ id: string; userId: string; role: string; name: string; email: string } | null> {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  if (!user) return null;

  const [collab] = await db
    .insert(deckCollaborators)
    .values({ deckId, userId: user.id, role })
    .onConflictDoUpdate({ target: [deckCollaborators.deckId, deckCollaborators.userId], set: { role } })
    .returning();

  return { id: collab!.id, userId: user.id, role: collab!.role, name: user.name, email: user.email };
}

export async function updateCollaboratorRole(
  deckId: string,
  userId: string,
  role: 'editor' | 'viewer',
): Promise<boolean> {
  const result = await db
    .update(deckCollaborators)
    .set({ role })
    .where(and(eq(deckCollaborators.deckId, deckId), eq(deckCollaborators.userId, userId)))
    .returning({ id: deckCollaborators.id });
  return result.length > 0;
}

export async function removeCollaborator(deckId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(deckCollaborators)
    .where(and(eq(deckCollaborators.deckId, deckId), eq(deckCollaborators.userId, userId)))
    .returning({ id: deckCollaborators.id });
  return result.length > 0;
}
