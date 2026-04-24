import { d as deleteSession } from './auth-4Mm7I3lm.js';
import { redirect } from '@sveltejs/kit';
import './db-CWmjlPNh.js';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '@node-rs/argon2';

//#region src/routes/logout/+page.server.ts
var actions = { default: async ({ cookies }) => {
	const token = cookies.get("session");
	if (token) {
		await deleteSession(token);
		cookies.delete("session", { path: "/" });
	}
	throw redirect(302, "/login");
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions
});

const index = 13;
const server_id = "src/routes/logout/+page.server.ts";
const imports = [];
const stylesheets = [];
const fonts = [];

export { fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=13-Cbu0UUJN.js.map
