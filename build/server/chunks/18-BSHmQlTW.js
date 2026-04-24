import { d as db, t as themes } from './db-CWmjlPNh.js';
import { fail, redirect } from '@sveltejs/kit';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

//#region src/routes/themes/+page.server.ts
var load = async () => {
	return { themes: await db.select().from(themes).orderBy(themes.name) };
};
var actions = { create: async ({ locals, request }) => {
	const name = (await request.formData()).get("name");
	if (typeof name !== "string" || !name.trim()) return fail(400, { error: "Name is required." });
	const [theme] = await db.insert(themes).values({
		name: name.trim(),
		tokens: {},
		scope: "global",
		isPreset: false
	}).returning();
	throw redirect(302, `/themes/${theme.id}`);
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 18;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DdO6lyLX.js')).default;
const server_id = "src/routes/themes/+page.server.ts";
const imports = ["_app/immutable/nodes/18.BgAYNOvH.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/CSSR0z9A.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/STBtn.C5CgOKx8.css","_app/immutable/assets/18.B3ZTDfO1.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=18-BSHmQlTW.js.map
