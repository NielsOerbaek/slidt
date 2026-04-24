import { d as db, h as assets, a as decks } from './db-CWmjlPNh.js';
import { s as saveAsset } from './assets-BmeXkDhs.js';
import { error, json } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'fs/promises';
import 'path';
import 'crypto';

//#region src/routes/api/assets/+server.ts
async function GET(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const deckId = event.url.searchParams.get("deckId");
	if (!deckId) return json(await db.select().from(assets));
	return json(await db.select().from(assets).where(eq(assets.deckId, deckId)));
}
async function POST(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const formData = await event.request.formData().catch(() => null);
	if (!formData) throw error(400, "multipart/form-data required");
	const deckId = formData.get("deckId");
	const kind = formData.get("kind");
	const file = formData.get("file");
	if (typeof deckId !== "string") throw error(400, "deckId required");
	if (typeof kind !== "string") throw error(400, "kind required");
	if (!(file instanceof Blob)) throw error(400, "file required");
	const [deck] = await db.select({ id: decks.id }).from(decks).where(and(eq(decks.id, deckId), eq(decks.ownerId, event.locals.user.id))).limit(1);
	if (!deck) throw error(404, "Deck not found");
	const filename = file instanceof File ? file.name : "upload";
	const storagePath = await saveAsset(Buffer.from(await file.arrayBuffer()), filename);
	const [asset] = await db.insert(assets).values({
		deckId,
		kind,
		storagePath,
		filename,
		uploadedById: event.locals.user.id
	}).returning();
	return json(asset, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server.ts-LwUd5oIE.js.map
