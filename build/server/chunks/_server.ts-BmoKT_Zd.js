import { d as db, b as slideTypes } from './db-CWmjlPNh.js';
import { error, json } from '@sveltejs/kit';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

//#region src/routes/api/templates/+server.ts
async function GET(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	return json(await db.select().from(slideTypes));
}
async function POST(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.name !== "string") throw error(400, "name required");
	if (typeof body.label !== "string") throw error(400, "label required");
	if (!Array.isArray(body.fields)) throw error(400, "fields must be array");
	if (typeof body.htmlTemplate !== "string") throw error(400, "htmlTemplate required");
	const [st] = await db.insert(slideTypes).values({
		name: body.name,
		label: body.label,
		fields: body.fields,
		htmlTemplate: body.htmlTemplate,
		css: body.css ?? "",
		scope: body.scope === "deck" ? "deck" : "global",
		deckId: body.deckId ?? null
	}).returning();
	return json(st, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server.ts-BmoKT_Zd.js.map
