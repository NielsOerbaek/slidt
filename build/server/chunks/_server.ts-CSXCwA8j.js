import { d as db, h as assets, a as decks } from './db-CWmjlPNh.js';
import { r as removeAsset, a as readAsset } from './assets-BmeXkDhs.js';
import { json, error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'fs/promises';
import 'path';
import 'crypto';

//#region src/routes/api/assets/[id]/+server.ts
async function requireAssetAccess(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const [asset] = await db.select().from(assets).where(eq(assets.id, event.params.id)).limit(1);
	if (!asset) throw error(404, "Asset not found");
	const [deck] = await db.select({ id: decks.id }).from(decks).where(and(eq(decks.id, asset.deckId), eq(decks.ownerId, event.locals.user.id))).limit(1);
	if (!deck) throw error(403, "Forbidden");
	return asset;
}
async function GET(event) {
	const asset = await requireAssetAccess(event);
	const buffer = await readAsset(asset.storagePath).catch(() => {
		throw error(404, "File not found on disk");
	});
	const contentType = {
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		svg: "image/svg+xml",
		pdf: "application/pdf",
		webp: "image/webp"
	}[asset.filename.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
	return new Response(new Uint8Array(buffer), { headers: {
		"Content-Type": contentType,
		"Cache-Control": "public, max-age=31536000"
	} });
}
async function DELETE(event) {
	const asset = await requireAssetAccess(event);
	await removeAsset(asset.storagePath);
	await db.delete(assets).where(eq(assets.id, asset.id));
	return json({ ok: true });
}

export { DELETE, GET };
//# sourceMappingURL=_server.ts-CSXCwA8j.js.map
