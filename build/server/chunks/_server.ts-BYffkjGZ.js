import { d as db, c as slides, a as decks } from './db-CWmjlPNh.js';
import { r as requireDeckRole } from './deck-access-DZX5watP.js';
import { json, error } from '@sveltejs/kit';
import { eq, sql, and } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/decks/[id]/slides/[slideId]/+server.ts
async function loadSlide(event, minRole = "viewer") {
	await requireDeckRole(event.params.id, event.locals.user?.id, minRole);
	const [slide] = await db.select().from(slides).where(and(eq(slides.id, event.params.slideId), eq(slides.deckId, event.params.id))).limit(1);
	if (!slide) throw error(404, "Slide not found");
	return slide;
}
async function GET(event) {
	return json(await loadSlide(event, "viewer"));
}
async function PATCH(event) {
	const slide = await loadSlide(event, "editor");
	const body = await event.request.json().catch(() => ({}));
	const updates = {};
	if (body.data !== void 0) updates.data = {
		...slide.data,
		...body.data
	};
	if (typeof body.typeId === "string") updates.typeId = body.typeId;
	if (typeof body.orderIndex === "number") updates.orderIndex = body.orderIndex;
	const [updated] = await db.update(slides).set(updates).where(eq(slides.id, slide.id)).returning();
	await db.update(decks).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(decks.id, slide.deckId));
	return json(updated);
}
async function DELETE(event) {
	const slide = await loadSlide(event, "editor");
	await db.delete(slides).where(eq(slides.id, slide.id));
	await db.update(decks).set({
		slideOrder: sql`array_remove(${decks.slideOrder}, ${slide.id}::uuid)`,
		updatedAt: /* @__PURE__ */ new Date()
	}).where(eq(decks.id, slide.deckId));
	return json({ ok: true });
}

export { DELETE, GET, PATCH };
//# sourceMappingURL=_server.ts-BYffkjGZ.js.map
