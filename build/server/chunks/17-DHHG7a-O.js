import { d as db, b as slideTypes } from './db-CWmjlPNh.js';
import { fail, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/templates/[id]/+page.server.ts
var load = async ({ params }) => {
	const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, params.id)).limit(1);
	if (!st) throw error(404, "Template not found");
	return { slideType: st };
};
var actions = { save: async ({ params, request }) => {
	const fd = await request.formData();
	const label = fd.get("label");
	const htmlTemplate = fd.get("htmlTemplate");
	const css = fd.get("css");
	const fieldsRaw = fd.get("fields");
	if (typeof fieldsRaw !== "string") return fail(400, { error: "fields required" });
	let fields;
	try {
		fields = JSON.parse(fieldsRaw);
		if (!Array.isArray(fields)) throw new Error("not array");
	} catch {
		return fail(400, { error: "fields must be a valid JSON array" });
	}
	const updates = { fields };
	if (typeof label === "string" && label.trim()) updates["label"] = label.trim();
	if (typeof htmlTemplate === "string") updates["htmlTemplate"] = htmlTemplate;
	if (typeof css === "string") updates["css"] = css;
	const [updated] = await db.update(slideTypes).set(updates).where(eq(slideTypes.id, params.id)).returning();
	return { slideType: updated };
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bydgcro4.js')).default;
const server_id = "src/routes/templates/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/17.CT9Q566b.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/DXwCX7ou.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/CSSR0z9A.js","_app/immutable/chunks/g3KcxgbC.js","_app/immutable/chunks/6niuxp3M.js"];
const stylesheets = ["_app/immutable/assets/SlidePreview.um5HnGz7.css","_app/immutable/assets/STBtn.C5CgOKx8.css","_app/immutable/assets/17.CjsWmGST.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=17-DHHG7a-O.js.map
