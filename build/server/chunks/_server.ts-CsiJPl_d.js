import { d as db, t as themes } from './db-CWmjlPNh.js';
import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/themes/[id]/+server.ts
async function GET(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const [theme] = await db.select().from(themes).where(eq(themes.id, event.params.id)).limit(1);
	if (!theme) throw error(404, "Theme not found");
	return json(theme);
}
async function PATCH(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const [existing] = await db.select().from(themes).where(eq(themes.id, event.params.id)).limit(1);
	if (!existing) throw error(404, "Theme not found");
	const body = await event.request.json().catch(() => ({}));
	const updates = {};
	if (typeof body.name === "string") updates.name = body.name;
	if (body.tokens && typeof body.tokens === "object") updates.tokens = body.tokens;
	if (body.scope === "global" || body.scope === "deck") updates.scope = body.scope;
	if ("systemPrompt" in body) updates.systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt : null;
	const [updated] = await db.update(themes).set(updates).where(eq(themes.id, event.params.id)).returning();
	return json(updated);
}
async function DELETE(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const [existing] = await db.select().from(themes).where(eq(themes.id, event.params.id)).limit(1);
	if (!existing) throw error(404, "Theme not found");
	await db.delete(themes).where(eq(themes.id, event.params.id));
	return json({ ok: true });
}

export { DELETE, GET, PATCH };
//# sourceMappingURL=_server.ts-CsiJPl_d.js.map
