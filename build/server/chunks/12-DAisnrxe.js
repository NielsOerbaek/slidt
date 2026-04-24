import { d as db, u as users } from './db-CWmjlPNh.js';
import { v as verifyPassword, c as createSession } from './auth-4Mm7I3lm.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import '@node-rs/argon2';

//#region src/lib/utils/auth-utils.ts
function normalizeEmail(email) {
	return email.trim().toLowerCase();
}
//#endregion
//#region src/routes/login/+page.server.ts
var load = async ({ locals, url }) => {
	if (locals.user) throw redirect(302, url.searchParams.get("next") ?? "/decks");
	return {};
};
var actions = { default: async ({ request, cookies }) => {
	const fd = await request.formData();
	const email = fd.get("email");
	const password = fd.get("password");
	if (typeof email !== "string" || typeof password !== "string" || !email || !password) return fail(400, { error: "Email and password are required." });
	const [user] = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
	if (!user || !await verifyPassword(user.passwordHash, password)) return fail(401, { error: "Invalid email or password." });
	const token = await createSession(user.id);
	cookies.set("session", token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 720 * 60 * 60
	});
	throw redirect(302, "/decks");
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 12;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-mMiNHx3Z.js')).default;
const server_id = "src/routes/login/+page.server.ts";
const imports = ["_app/immutable/nodes/12.DpWJuXCR.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/CSSR0z9A.js","_app/immutable/chunks/BsghtdZd.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/STBtn.C5CgOKx8.css","_app/immutable/assets/STFace.Boe-KZeP.css","_app/immutable/assets/12.D-Tcie56.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=12-DAisnrxe.js.map
