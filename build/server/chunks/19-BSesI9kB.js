import { d as db, t as themes } from './db-CWmjlPNh.js';
import { fail, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/themes/[id]/+page.server.ts
var load = async ({ params }) => {
	const [theme] = await db.select().from(themes).where(eq(themes.id, params.id)).limit(1);
	if (!theme) throw error(404, "Theme not found");
	return { theme };
};
var actions = { save: async ({ params, locals, request }) => {
	const fd = await request.formData();
	const tokensRaw = fd.get("tokens");
	const name = fd.get("name");
	if (typeof tokensRaw !== "string") return fail(400, { error: "tokens required" });
	let tokens;
	try {
		tokens = JSON.parse(tokensRaw);
	} catch {
		return fail(400, { error: "Invalid tokens JSON" });
	}
	const systemPrompt = fd.get("systemPrompt");
	const updates = { tokens };
	if (typeof name === "string" && name.trim()) updates["name"] = name.trim();
	if (typeof systemPrompt === "string") updates["systemPrompt"] = systemPrompt.trim() || null;
	const [updated] = await db.update(themes).set(updates).where(eq(themes.id, params.id)).returning();
	return { theme: updated };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 19;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Ck3KD3B2.js')).default;
const server_id = "src/routes/themes/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/19.BbXf2mDL.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/DXwCX7ou.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/CSSR0z9A.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/SlidePreview.um5HnGz7.css","_app/immutable/assets/STBtn.C5CgOKx8.css","_app/immutable/assets/19.4JtBUHLC.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=19-BSesI9kB.js.map
