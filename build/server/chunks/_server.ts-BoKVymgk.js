import { d as db, b as slideTypes } from './db-CWmjlPNh.js';
import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/templates/[id]/+server.ts
async function GET(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, event.params.id)).limit(1);
	if (!st) throw error(404, "Template not found");
	return json(st);
}
async function PATCH(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const [existing] = await db.select().from(slideTypes).where(eq(slideTypes.id, event.params.id)).limit(1);
	if (!existing) throw error(404, "Template not found");
	const body = await event.request.json().catch(() => ({}));
	const updates = {};
	if (typeof body.label === "string") updates.label = body.label;
	if (Array.isArray(body.fields)) updates.fields = body.fields;
	if (typeof body.htmlTemplate === "string") updates.htmlTemplate = body.htmlTemplate;
	if (typeof body.css === "string") updates.css = body.css;
	if (body.scope === "global" || body.scope === "deck") updates.scope = body.scope;
	const [updated] = await db.update(slideTypes).set(updates).where(eq(slideTypes.id, event.params.id)).returning();
	return json(updated);
}
async function DELETE(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const [existing] = await db.select().from(slideTypes).where(eq(slideTypes.id, event.params.id)).limit(1);
	if (!existing) throw error(404, "Template not found");
	await db.delete(slideTypes).where(eq(slideTypes.id, event.params.id));
	return json({ ok: true });
}

export { DELETE, GET, PATCH };
//# sourceMappingURL=_server.ts-BoKVymgk.js.map
