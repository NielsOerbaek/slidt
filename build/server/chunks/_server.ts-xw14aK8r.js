import { d as db, a as decks } from './db-CWmjlPNh.js';
import { json } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/routes/api/decks/+server.ts
async function GET(event) {
	if (!event.locals.user) return new Response(JSON.stringify({ message: "Not authenticated" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	return json(await db.select().from(decks).where(eq(decks.ownerId, event.locals.user.id)).orderBy(desc(decks.updatedAt)));
}
async function POST(event) {
	if (!event.locals.user) return new Response(JSON.stringify({ message: "Not authenticated" }), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.title !== "string") return new Response(JSON.stringify({ message: "title required" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const lang = typeof body.lang === "string" ? body.lang : "da";
	const [deck] = await db.insert(decks).values({
		title: body.title,
		lang,
		ownerId: event.locals.user.id
	}).returning();
	return json(deck, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server.ts-xw14aK8r.js.map
