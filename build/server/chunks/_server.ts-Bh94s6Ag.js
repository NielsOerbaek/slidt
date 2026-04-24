import { d as db, a as decks, g as shareLinks } from './db-CWmjlPNh.js';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/decks/[id]/share/+server.ts
function unauthorized() {
	return new Response(JSON.stringify({ message: "Not authenticated" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
}
function notFound() {
	return new Response(JSON.stringify({ message: "Deck not found" }), {
		status: 404,
		headers: { "Content-Type": "application/json" }
	});
}
async function GET(event) {
	if (!event.locals.user) return unauthorized();
	const [deck] = await db.select({ id: decks.id }).from(decks).where(and(eq(decks.id, event.params.id), eq(decks.ownerId, event.locals.user.id))).limit(1);
	if (!deck) return notFound();
	return json(await db.select().from(shareLinks).where(eq(shareLinks.deckId, deck.id)));
}
async function POST(event) {
	if (!event.locals.user) return unauthorized();
	const [deck] = await db.select({ id: decks.id }).from(decks).where(and(eq(decks.id, event.params.id), eq(decks.ownerId, event.locals.user.id))).limit(1);
	if (!deck) return notFound();
	const body = await event.request.json().catch(() => ({}));
	const token = crypto.randomBytes(24).toString("base64url");
	const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
	const [link] = await db.insert(shareLinks).values({
		deckId: deck.id,
		token,
		...expiresAt ? { expiresAt } : {}
	}).returning();
	return json(link, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server.ts-Bh94s6Ag.js.map
