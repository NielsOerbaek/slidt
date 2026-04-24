import { d as db, a as decks, b as slideTypes, c as slides, e as deckCollaborators, f as agentMessages } from './db-CWmjlPNh.js';
import { redirect, fail } from '@sveltejs/kit';
import { and, eq, desc, inArray, sql, gte } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/decks/+page.server.ts
var load = async ({ locals }) => {
	const ownedDecks = await db.select().from(decks).where(eq(decks.ownerId, locals.user.id)).orderBy(desc(decks.updatedAt));
	const sharedDeckRows = await db.select({ deckId: deckCollaborators.deckId }).from(deckCollaborators).where(eq(deckCollaborators.userId, locals.user.id));
	const sharedDecks = sharedDeckRows.length > 0 ? await db.select().from(decks).where(inArray(decks.id, sharedDeckRows.map((r) => r.deckId))).orderBy(desc(decks.updatedAt)) : [];
	const sevenDaysAgo = /* @__PURE__ */ new Date(Date.now() - 10080 * 60 * 1e3);
	const [editsRow] = await db.select({ n: sql`count(*)::int` }).from(agentMessages).innerJoin(decks, eq(decks.id, agentMessages.deckId)).where(and(eq(decks.ownerId, locals.user.id), eq(agentMessages.role, "assistant"), gte(agentMessages.createdAt, sevenDaysAgo)));
	return {
		decks: ownedDecks,
		sharedDecks,
		agentEditsLastWeek: editsRow?.n ?? 0
	};
};
var actions = {
	create: async ({ locals, request }) => {
		const title = (await request.formData()).get("title");
		if (typeof title !== "string" || !title.trim()) return fail(400, { error: "Title is required." });
		const [deck] = await db.insert(decks).values({
			title: title.trim(),
			lang: "da",
			ownerId: locals.user.id
		}).returning();
		throw redirect(302, `/decks/${deck.id}`);
	},
	delete: async ({ locals, request }) => {
		const id = (await request.formData()).get("id");
		if (typeof id !== "string") return fail(400, { error: "id required" });
		await db.delete(decks).where(and(eq(decks.id, id), eq(decks.ownerId, locals.user.id)));
		return { ok: true };
	},
	duplicate: async ({ locals, request }) => {
		if (!locals.user) throw redirect(302, "/login");
		const id = (await request.formData()).get("id");
		if (!id) return fail(400, { error: "id required" });
		const [original] = await db.select().from(decks).where(and(eq(decks.id, id), eq(decks.ownerId, locals.user.id))).limit(1);
		if (!original) return fail(404, { error: "Deck not found" });
		const deckScopedTypes = await db.select().from(slideTypes).where(and(eq(slideTypes.scope, "deck"), eq(slideTypes.deckId, id)));
		const originalSlides = await db.select().from(slides).where(eq(slides.deckId, id));
		throw redirect(303, `/decks/${(await db.transaction(async (tx) => {
			const [nd] = await tx.insert(decks).values({
				title: `Copy of ${original.title}`,
				lang: original.lang,
				themeId: original.themeId,
				ownerId: locals.user.id,
				slideOrder: []
			}).returning();
			const typeIdMap = /* @__PURE__ */ new Map();
			for (const st of deckScopedTypes) {
				const [nt] = await tx.insert(slideTypes).values({
					name: st.name,
					label: st.label,
					fields: st.fields,
					htmlTemplate: st.htmlTemplate,
					css: st.css,
					scope: "deck",
					deckId: nd.id
				}).returning({ id: slideTypes.id });
				typeIdMap.set(st.id, nt.id);
			}
			const slideIdMap = /* @__PURE__ */ new Map();
			for (const s of originalSlides) {
				const [ns] = await tx.insert(slides).values({
					deckId: nd.id,
					typeId: typeIdMap.get(s.typeId) ?? s.typeId,
					data: s.data,
					orderIndex: s.orderIndex
				}).returning({ id: slides.id });
				slideIdMap.set(s.id, ns.id);
			}
			const newOrder = original.slideOrder.map((id) => slideIdMap.get(id)).filter((id) => id !== void 0);
			const [updated] = await tx.update(decks).set({ slideOrder: newOrder }).where(eq(decks.id, nd.id)).returning();
			return updated;
		})).id}`);
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B2uzewEC.js')).default;
const server_id = "src/routes/decks/+page.server.ts";
const imports = ["_app/immutable/nodes/4.BcLoJ4dV.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/CSSR0z9A.js","_app/immutable/chunks/BsghtdZd.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/STBtn.C5CgOKx8.css","_app/immutable/assets/STFace.Boe-KZeP.css","_app/immutable/assets/4.CKfxFPyb.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-CNq0PUrF.js.map
