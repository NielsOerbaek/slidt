import { d as db, b as slideTypes } from './db-CWmjlPNh.js';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/templates/+page.server.ts
var load = async () => {
	return { slideTypes: await db.select().from(slideTypes).where(eq(slideTypes.scope, "global")) };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-D9kIv5Ph.js')).default;
const server_id = "src/routes/templates/+page.server.ts";
const imports = ["_app/immutable/nodes/16.BTxwTTdu.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/16.C8oMorjk.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=16-BG-sTidw.js.map
