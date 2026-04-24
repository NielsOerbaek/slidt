import { f as deleteApiKey, l as listApiKeys, g as createApiKey } from './auth-4Mm7I3lm.js';
import { error, json } from '@sveltejs/kit';
import './db-CWmjlPNh.js';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '@node-rs/argon2';

//#region src/routes/api/keys/+server.ts
/** GET /api/keys — list the current user's API keys */
async function GET(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	return json(await listApiKeys(event.locals.user.id));
}
/** POST /api/keys — create a new API key */
async function POST(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.name !== "string" || !body.name.trim()) throw error(400, "name required");
	const { token, key } = await createApiKey(event.locals.user.id, body.name.trim());
	return json({
		...key,
		token
	}, { status: 201 });
}
/** DELETE /api/keys/:id — revoke an API key */
async function DELETE(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const id = new URL(event.request.url).searchParams.get("id");
	if (!id) throw error(400, "id required");
	if (!await deleteApiKey(id, event.locals.user.id)) throw error(404, "Key not found");
	return json({ ok: true });
}

export { DELETE, GET, POST };
//# sourceMappingURL=_server.ts-C7c_JBiy.js.map
