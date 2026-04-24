import { d as deleteSession } from './auth-4Mm7I3lm.js';
import { json } from '@sveltejs/kit';
import './db-CWmjlPNh.js';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '@node-rs/argon2';

//#region src/routes/api/auth/logout/+server.ts
async function POST(event) {
	const token = event.cookies.get("session");
	if (token) {
		await deleteSession(token);
		event.cookies.delete("session", { path: "/" });
	}
	return json({ ok: true });
}

export { POST };
//# sourceMappingURL=_server.ts-5bxBKH7a.js.map
