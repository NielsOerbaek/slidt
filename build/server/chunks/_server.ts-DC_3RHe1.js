import { d as db, t as themes } from './db-CWmjlPNh.js';
import { error, json } from '@sveltejs/kit';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

//#region src/routes/api/themes/+server.ts
async function GET(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	return json(await db.select().from(themes));
}
async function POST(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.name !== "string") throw error(400, "name required");
	if (!body.tokens || typeof body.tokens !== "object") throw error(400, "tokens required");
	const [theme] = await db.insert(themes).values({
		name: body.name,
		tokens: body.tokens,
		scope: body.scope === "deck" ? "deck" : "global",
		deckId: body.deckId ?? null,
		isPreset: body.isPreset === true,
		systemPrompt: typeof body.systemPrompt === "string" ? body.systemPrompt : null
	}).returning();
	return json(theme, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server.ts-DC_3RHe1.js.map
