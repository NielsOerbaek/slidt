import { d as db, e as deckCollaborators, u as users, a as decks } from './db-CWmjlPNh.js';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

//#region src/lib/server/deck-access.ts
/**
* Returns the access level a user has on a deck, or null if none.
* Checks owner first, then collaborator table.
*/
async function resolveDeckAccess(deckId, userId) {
	const [deck] = await db.select({ ownerId: decks.ownerId }).from(decks).where(eq(decks.id, deckId)).limit(1);
	if (!deck) return null;
	if (deck.ownerId === userId) return "owner";
	const [collab] = await db.select({ role: deckCollaborators.role }).from(deckCollaborators).where(and(eq(deckCollaborators.deckId, deckId), eq(deckCollaborators.userId, userId))).limit(1);
	if (!collab) return null;
	return collab.role;
}
/**
* Convenience: throws a SvelteKit error if user can't access deck at minRole level.
* Returns the resolved role on success.
*/
async function requireDeckRole(deckId, userId, minRole = "viewer") {
	if (!userId) throw error(401, "Not authenticated");
	const role = await resolveDeckAccess(deckId, userId);
	if (!role) throw error(404, "Deck not found");
	const order = [
		"viewer",
		"editor",
		"owner"
	];
	if (order.indexOf(role) < order.indexOf(minRole)) throw error(403, "Insufficient access");
	return role;
}
async function listCollaborators(deckId) {
	return db.select({
		id: deckCollaborators.id,
		userId: deckCollaborators.userId,
		role: deckCollaborators.role,
		name: users.name,
		email: users.email,
		createdAt: deckCollaborators.createdAt
	}).from(deckCollaborators).innerJoin(users, eq(deckCollaborators.userId, users.id)).where(eq(deckCollaborators.deckId, deckId));
}
async function addCollaborator(deckId, email, role = "editor") {
	const [user] = await db.select({
		id: users.id,
		name: users.name,
		email: users.email
	}).from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
	if (!user) return null;
	const [collab] = await db.insert(deckCollaborators).values({
		deckId,
		userId: user.id,
		role
	}).onConflictDoUpdate({
		target: [deckCollaborators.deckId, deckCollaborators.userId],
		set: { role }
	}).returning();
	return {
		id: collab.id,
		userId: user.id,
		role: collab.role,
		name: user.name,
		email: user.email
	};
}
async function updateCollaboratorRole(deckId, userId, role) {
	return (await db.update(deckCollaborators).set({ role }).where(and(eq(deckCollaborators.deckId, deckId), eq(deckCollaborators.userId, userId))).returning({ id: deckCollaborators.id })).length > 0;
}
async function removeCollaborator(deckId, userId) {
	return (await db.delete(deckCollaborators).where(and(eq(deckCollaborators.deckId, deckId), eq(deckCollaborators.userId, userId))).returning({ id: deckCollaborators.id })).length > 0;
}

export { removeCollaborator as a, addCollaborator as b, resolveDeckAccess as c, listCollaborators as l, requireDeckRole as r, updateCollaboratorRole as u };
//# sourceMappingURL=deck-access-DZX5watP.js.map
