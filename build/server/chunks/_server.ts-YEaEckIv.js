import { d as db, u as users } from './db-CWmjlPNh.js';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/lib/server/health.ts
/**
* Returns a health status object.
* Accepts an injectable `dbPing` so the function is unit-testable without a live DB.
* The HTTP status is always 200 — even a DB error only changes `db` field,
* so uptime monitors continue to get a valid response.
*/
async function getHealthStatus(dbPing) {
	try {
		await dbPing();
		return {
			status: "ok",
			db: "ok"
		};
	} catch (err) {
		return {
			status: "ok",
			db: err instanceof Error ? err.message : String(err)
		};
	}
}
//#endregion
//#region src/routes/healthz/+server.ts
async function GET() {
	return json(await getHealthStatus(async () => {
		await db.select({ ping: sql`1` }).from(users).limit(1);
	}));
}

export { GET };
//# sourceMappingURL=_server.ts-YEaEckIv.js.map
