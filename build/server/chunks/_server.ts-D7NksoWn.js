import { d as db, c as slides, a as decks } from './db-CWmjlPNh.js';
import { r as requireDeckRole } from './deck-access-DZX5watP.js';
import { json, error } from '@sveltejs/kit';
import { eq, asc, sql } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/decks/[id]/slides/+server.ts
async function GET(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "viewer");
	return json(await db.select().from(slides).where(eq(slides.deckId, event.params.id)).orderBy(asc(slides.orderIndex)));
}
async function POST(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "editor");
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.typeId !== "string") throw error(400, "typeId required");
	const data = body.data ?? {};
	const [deck] = await db.select().from(decks).where(eq(decks.id, event.params.id)).limit(1);
	if (!deck) throw error(404, "Deck not found");
	const orderIndex = deck.slideOrder.length;
	const [slide] = await db.insert(slides).values({
		deckId: deck.id,
		typeId: body.typeId,
		data,
		orderIndex
	}).returning();
	const [updatedDeck] = await db.update(decks).set({
		slideOrder: sql`array_append(${decks.slideOrder}, ${slide.id}::uuid)`,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(decks.id, deck.id)).returning();
	return json({
		slide,
		deck: updatedDeck
	}, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server.ts-D7NksoWn.js.map
