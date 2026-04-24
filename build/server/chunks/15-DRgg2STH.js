import { d as db, g as shareLinks, a as decks, c as slides, b as slideTypes, t as themes } from './db-CWmjlPNh.js';
import { r as render } from './renderer-AiFTzwmy.js';
import { error } from '@sveltejs/kit';
import { eq, asc, or } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import './validate-CiBKPHUw.js';
import 'handlebars';
import 'postcss';

//#region src/lib/utils/share-utils.ts
function isShareExpired(expiresAt) {
	if (!expiresAt) return false;
	return expiresAt.getTime() <= Date.now();
}
//#endregion
//#region src/routes/share/[token]/+page.server.ts
var load = async ({ params }) => {
	const [link] = await db.select().from(shareLinks).where(eq(shareLinks.token, params.token)).limit(1);
	if (!link) throw error(404, "Share link not found");
	if (isShareExpired(link.expiresAt)) throw error(410, "Share link has expired");
	const [deck] = await db.select().from(decks).where(eq(decks.id, link.deckId)).limit(1);
	if (!deck) throw error(404, "Deck not found");
	const slideRows = await db.select().from(slides).where(eq(slides.deckId, deck.id)).orderBy(asc(slides.orderIndex));
	const slideMap = new Map(slideRows.map((s) => [s.id, s]));
	const orderedSlides = deck.slideOrder.map((id) => slideMap.get(id)).filter((s) => s !== void 0);
	const typeRows = await db.select().from(slideTypes).where(or(eq(slideTypes.scope, "global"), eq(slideTypes.deckId, deck.id)));
	let theme = null;
	if (deck.themeId) {
		const [t] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
		theme = t ?? null;
	}
	if (!theme) {
		const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
		theme = t ?? null;
	}
	const rendererSlideTypes = typeRows.map((t) => ({
		name: t.name,
		label: t.label,
		fields: t.fields,
		htmlTemplate: t.htmlTemplate,
		css: t.css
	}));
	const rendererTheme = theme ? {
		name: theme.name,
		tokens: theme.tokens
	} : {
		tokens: {}
	};
	const renderedHtml = await render({
		title: deck.title,
		lang: deck.lang,
		slides: orderedSlides.map((s) => {
			return {
				typeName: typeRows.find((t) => t.id === s.typeId)?.name ?? "",
				data: s.data
			};
		})
	}, rendererTheme, rendererSlideTypes);
	return {
		deck: {
			title: deck.title,
			lang: deck.lang
		},
		renderedHtml
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-n-RwzsZv.js')).default;
const server_id = "src/routes/share/[token]/+page.server.ts";
const imports = ["_app/immutable/nodes/15.Bzb00HT_.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/15.DZxQ0Qhe.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=15-DRgg2STH.js.map
