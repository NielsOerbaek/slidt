import { d as db, a as decks } from './db-CWmjlPNh.js';
import { r as requireDeckRole } from './deck-access-DZX5watP.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/decks/[id]/+server.ts
async function GET(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "viewer");
	const [deck] = await db.select().from(decks).where(eq(decks.id, event.params.id)).limit(1);
	return json(deck);
}
async function PATCH(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "editor");
	const body = await event.request.json().catch(() => ({}));
	const updates = {};
	if (typeof body.title === "string") updates.title = body.title;
	if (typeof body.lang === "string") updates.lang = body.lang;
	if (typeof body.themeId === "string" || body.themeId === null) updates.themeId = body.themeId;
	if (Array.isArray(body.slideOrder)) updates.slideOrder = body.slideOrder;
	updates.updatedAt = /* @__PURE__ */ new Date();
	const [updated] = await db.update(decks).set(updates).where(eq(decks.id, event.params.id)).returning();
	return json(updated);
}
async function DELETE(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "owner");
	await db.delete(decks).where(eq(decks.id, event.params.id));
	return json({ ok: true });
}

export { DELETE, GET, PATCH };
//# sourceMappingURL=_server.ts-C3ay_i5L.js.map
