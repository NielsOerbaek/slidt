import { d as db, i as issues, u as users, s as sessions } from './db-CWmjlPNh.js';
import { h as hashPassword } from './auth-4Mm7I3lm.js';
import { fail, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import '@node-rs/argon2';

//#region src/routes/admin/+page.server.ts
function requireAdmin(locals) {
	if (!locals.user) throw error(401, "Not authenticated");
	if (!locals.user.isAdmin) throw error(403, "Admin access required");
}
var load = async ({ locals }) => {
	requireAdmin(locals);
	return {
		users: await db.select({
			id: users.id,
			email: users.email,
			name: users.name,
			isAdmin: users.isAdmin,
			lastSeenAt: users.lastSeenAt
		}).from(users).orderBy(desc(users.lastSeenAt)),
		issues: await db.select({
			id: issues.id,
			title: issues.title,
			body: issues.body,
			severity: issues.severity,
			status: issues.status,
			createdAt: issues.createdAt,
			userId: issues.userId,
			deckId: issues.deckId
		}).from(issues).orderBy(desc(issues.createdAt))
	};
};
var actions = {
	createUser: async ({ locals, request }) => {
		requireAdmin(locals);
		const fd = await request.formData();
		const email = fd.get("email")?.toLowerCase().trim();
		const name = fd.get("name")?.trim();
		const password = fd.get("password");
		const isAdmin = fd.get("isAdmin") === "on";
		if (!email || !name || !password) return fail(400, { error: "email, name, and password required" });
		if (password.length < 8) return fail(400, { error: "Password must be at least 8 characters" });
		const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
		if (existing) return fail(400, { error: `User already exists: ${email}` });
		const passwordHash = await hashPassword(password);
		await db.insert(users).values({
			email,
			name,
			passwordHash,
			isAdmin
		});
		return {
			success: true,
			action: "createUser"
		};
	},
	deleteUser: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = (await request.formData()).get("id");
		if (!id) return fail(400, { error: "id required" });
		if (id === locals.user.id) return fail(400, { error: "Cannot delete yourself" });
		await db.delete(users).where(eq(users.id, id));
		return {
			success: true,
			action: "deleteUser"
		};
	},
	setAdmin: async ({ locals, request }) => {
		requireAdmin(locals);
		const fd = await request.formData();
		const id = fd.get("id");
		const isAdmin = fd.get("isAdmin") === "true";
		if (!id) return fail(400, { error: "id required" });
		await db.update(users).set({ isAdmin }).where(eq(users.id, id));
		return {
			success: true,
			action: "setAdmin"
		};
	},
	resetPassword: async ({ locals, request }) => {
		requireAdmin(locals);
		const fd = await request.formData();
		const id = fd.get("id");
		const password = fd.get("password");
		if (!id || !password) return fail(400, { error: "id and password required" });
		if (password.length < 8) return fail(400, { error: "Password must be at least 8 characters" });
		const passwordHash = await hashPassword(password);
		await db.update(users).set({ passwordHash }).where(eq(users.id, id));
		await db.delete(sessions).where(eq(sessions.userId, id));
		return {
			success: true,
			action: "resetPassword"
		};
	},
	resolveIssue: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = (await request.formData()).get("id");
		if (!id) return fail(400, { error: "id required" });
		await db.update(issues).set({ status: "resolved" }).where(eq(issues.id, id));
		return {
			success: true,
			action: "resolveIssue"
		};
	},
	deleteIssue: async ({ locals, request }) => {
		requireAdmin(locals);
		const id = (await request.formData()).get("id");
		if (!id) return fail(400, { error: "id required" });
		await db.delete(issues).where(eq(issues.id, id));
		return {
			success: true,
			action: "deleteIssue"
		};
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BjcsyxDi.js')).default;
const server_id = "src/routes/admin/+page.server.ts";
const imports = ["_app/immutable/nodes/3.B5Ocanwc.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/3.DPYla25O.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-h139xwit.js.map
