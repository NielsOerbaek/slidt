import { d as db, a as decks, c as slides, b as slideTypes, t as themes } from './db-CWmjlPNh.js';
import { r as requireDeckRole, a as removeCollaborator, b as addCollaborator, c as resolveDeckAccess, l as listCollaborators } from './deck-access-DZX5watP.js';
import { error, fail } from '@sveltejs/kit';
import { eq, asc, or } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/decks/[id]/+page.server.ts
var load = async ({ params, locals }) => {
	const [deck] = await db.select().from(decks).where(eq(decks.id, params.id)).limit(1);
	const access = await resolveDeckAccess(params.id, locals.user.id);
	if (!access || !deck) throw error(404, "Deck not found");
	const slideRows = await db.select().from(slides).where(eq(slides.deckId, params.id)).orderBy(asc(slides.orderIndex));
	const slideMap = new Map(slideRows.map((s) => [s.id, s]));
	const orderedSlides = deck.slideOrder.map((id) => slideMap.get(id)).filter((s) => s !== void 0);
	for (const s of slideRows) if (!deck.slideOrder.includes(s.id)) orderedSlides.push(s);
	const typeRows = await db.select().from(slideTypes).where(or(eq(slideTypes.scope, "global"), eq(slideTypes.deckId, params.id)));
	let theme = null;
	if (deck.themeId) {
		const [t] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
		theme = t ?? null;
	}
	if (!theme) {
		const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
		theme = t ?? null;
	}
	const rendererTypes = typeRows.map((t) => ({
		id: t.id,
		name: t.name,
		label: t.label,
		fields: t.fields,
		htmlTemplate: t.htmlTemplate,
		css: t.css,
		scope: t.scope,
		deckId: t.deckId
	}));
	const allThemes = await db.select({
		id: themes.id,
		name: themes.name
	}).from(themes).where(eq(themes.scope, "global"));
	const rendererTheme = theme ? {
		id: theme.id,
		name: theme.name,
		tokens: theme.tokens
	} : null;
	const collaborators = access === "owner" ? await listCollaborators(params.id) : [];
	return {
		deck,
		slides: orderedSlides,
		slideTypes: rendererTypes,
		theme: rendererTheme,
		availableThemes: allThemes,
		isOwner: access === "owner",
		canEdit: access === "owner" || access === "editor",
		collaborators,
		vim: locals.user?.preferences?.vim ?? false
	};
};
var actions = {
	addCollaborator: async ({ params, locals, request }) => {
		if (!locals.user) throw error(401, "Not authenticated");
		await requireDeckRole(params.id, locals.user.id, "owner");
		const fd = await request.formData();
		const email = fd.get("email");
		const role = fd.get("role") === "viewer" ? "viewer" : "editor";
		if (!email) return fail(400, { collabError: "Email required" });
		if (!await addCollaborator(params.id, email, role)) return fail(404, { collabError: `No user found: ${email}` });
		return { success: true };
	},
	removeCollaborator: async ({ params, locals, request }) => {
		if (!locals.user) throw error(401, "Not authenticated");
		await requireDeckRole(params.id, locals.user.id, "owner");
		const userId = (await request.formData()).get("userId");
		if (!userId) return fail(400, { collabError: "userId required" });
		await removeCollaborator(params.id, userId);
		return { success: true };
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C4Dt_zCo.js')).default;
const server_id = "src/routes/decks/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/5.DeifAGcp.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/DXwCX7ou.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/CSSR0z9A.js","_app/immutable/chunks/BsghtdZd.js","_app/immutable/chunks/g3KcxgbC.js","_app/immutable/chunks/6niuxp3M.js"];
const stylesheets = ["_app/immutable/assets/SlidePreview.um5HnGz7.css","_app/immutable/assets/STBtn.C5CgOKx8.css","_app/immutable/assets/STFace.Boe-KZeP.css","_app/immutable/assets/5.CDAP8Gbb.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-UD9b-Cu8.js.map
