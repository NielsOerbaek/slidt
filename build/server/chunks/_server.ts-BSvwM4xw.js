import { d as db, a as decks, b as slideTypes, c as slides } from './db-CWmjlPNh.js';
import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/decks/[id]/duplicate/+server.ts
async function POST(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const deckId = event.params.id;
	const [original] = await db.select().from(decks).where(and(eq(decks.id, deckId), eq(decks.ownerId, event.locals.user.id))).limit(1);
	if (!original) throw error(404, "Deck not found");
	const deckTypes = await db.select().from(slideTypes).where(and(eq(slideTypes.scope, "deck"), eq(slideTypes.deckId, deckId)));
	const originalSlides = await db.select().from(slides).where(eq(slides.deckId, deckId));
	const newDeck = await db.transaction(async (tx) => {
		const [nd] = await tx.insert(decks).values({
			title: `Copy of ${original.title}`,
			lang: original.lang,
			themeId: original.themeId,
			ownerId: event.locals.user.id,
			slideOrder: []
		}).returning();
		const typeIdMap = /* @__PURE__ */ new Map();
		for (const st of deckTypes) {
			const [newType] = await tx.insert(slideTypes).values({
				name: st.name,
				label: st.label,
				fields: st.fields,
				htmlTemplate: st.htmlTemplate,
				css: st.css,
				scope: "deck",
				deckId: nd.id
			}).returning({ id: slideTypes.id });
			typeIdMap.set(st.id, newType.id);
		}
		const slideIdMap = /* @__PURE__ */ new Map();
		for (const s of originalSlides) {
			const newTypeId = typeIdMap.get(s.typeId) ?? s.typeId;
			const [newSlide] = await tx.insert(slides).values({
				deckId: nd.id,
				typeId: newTypeId,
				data: s.data,
				orderIndex: s.orderIndex
			}).returning({ id: slides.id });
			slideIdMap.set(s.id, newSlide.id);
		}
		const newSlideOrder = original.slideOrder.map((id) => slideIdMap.get(id)).filter((id) => id !== void 0);
		const [updated] = await tx.update(decks).set({ slideOrder: newSlideOrder }).where(eq(decks.id, nd.id)).returning();
		return updated;
	});
	return json({
		id: newDeck.id,
		title: newDeck.title
	}, { status: 201 });
}

export { POST };
//# sourceMappingURL=_server.ts-BSvwM4xw.js.map
