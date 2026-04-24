import { r as resolveApiKey, a as resolveSession } from './auth-4Mm7I3lm.js';
import './db-CWmjlPNh.js';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import '@node-rs/argon2';

//#region src/hooks.server.ts
var handle = async ({ event, resolve }) => {
	const auth = event.request.headers.get("authorization");
	if (auth?.startsWith("Bearer ")) {
		event.locals.user = await resolveApiKey(auth.slice(7).trim());
		return resolve(event);
	}
	const token = event.cookies.get("session");
	event.locals.user = token ? await resolveSession(token) : null;
	return resolve(event);
};

export { handle };
//# sourceMappingURL=hooks.server-DdGRwudN.js.map
