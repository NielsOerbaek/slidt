import { u as updatePreferences, b as changePassword, e as updateProfile, f as deleteApiKey, g as createApiKey, l as listApiKeys } from './auth-4Mm7I3lm.js';
import { error, fail } from '@sveltejs/kit';
import './db-CWmjlPNh.js';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '@node-rs/argon2';

//#region src/routes/settings/+page.server.ts
var load = async ({ locals }) => {
	if (!locals.user) throw error(401, "Not authenticated");
	const keys = await listApiKeys(locals.user.id);
	let ollamaModels = [];
	const ollamaBase = process.env.OLLAMA_BASE_URL;
	const ollamaKey = process.env.OLLAMA_API_KEY;
	if (ollamaBase) try {
		const res = await fetch(`${ollamaBase}/api/tags`, {
			headers: ollamaKey ? { Authorization: `Bearer ${ollamaKey}` } : {},
			signal: AbortSignal.timeout(4e3)
		});
		if (res.ok) ollamaModels = (await res.json()).models.map((m) => m.name);
	} catch {}
	return {
		keys,
		user: locals.user,
		ollamaModels
	};
};
var actions = {
	createKey: async ({ locals, request }) => {
		if (!locals.user) throw error(401, "Not authenticated");
		const name = (await request.formData()).get("name")?.trim();
		if (!name) return fail(400, { error: "Name required" });
		const { token, key } = await createApiKey(locals.user.id, name);
		return {
			success: true,
			token,
			keyId: key.id
		};
	},
	revokeKey: async ({ locals, request }) => {
		if (!locals.user) throw error(401, "Not authenticated");
		const id = (await request.formData()).get("id");
		if (!id) return fail(400, { error: "id required" });
		await deleteApiKey(id, locals.user.id);
		return { success: true };
	},
	updateProfile: async ({ locals, request }) => {
		if (!locals.user) throw error(401, "Not authenticated");
		const name = (await request.formData()).get("name")?.trim();
		if (!name) return fail(400, { profileError: "Name required" });
		await updateProfile(locals.user.id, name);
		return { profileSuccess: true };
	},
	changePassword: async ({ locals, request }) => {
		if (!locals.user) throw error(401, "Not authenticated");
		const fd = await request.formData();
		const current = fd.get("current");
		const next = fd.get("next")?.trim();
		const confirm = fd.get("confirm");
		if (!current || !next) return fail(400, { pwError: "All fields required" });
		if (next !== confirm) return fail(400, { pwError: "Passwords do not match" });
		if (next.length < 8) return fail(400, { pwError: "Minimum 8 characters" });
		const result = await changePassword(locals.user.id, current, next);
		if (!result.ok) return fail(400, { pwError: result.error });
		return { pwSuccess: true };
	},
	updatePreferences: async ({ locals, request }) => {
		if (!locals.user) throw error(401, "Not authenticated");
		const fd = await request.formData();
		const vim = fd.get("vim") === "on";
		const locale = fd.get("locale");
		const aiModel = fd.get("aiModel") ?? void 0;
		await updatePreferences(locals.user.id, {
			vim,
			...locale ? { locale } : {},
			...aiModel ? { aiModel } : {}
		});
		return { prefsSuccess: true };
	}
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-1RLT8hTc.js')).default;
const server_id = "src/routes/settings/+page.server.ts";
const imports = ["_app/immutable/nodes/14.DwEhVCoe.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/BlpW198U.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/14.Cyp5Sj3o.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=14-iX2idPOM.js.map
