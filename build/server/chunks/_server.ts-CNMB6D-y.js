import { d as db, a as decks } from './db-CWmjlPNh.js';
import { r as renderDeckToPdf } from './pdf-B01yRnKa.js';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import './renderer-AiFTzwmy.js';
import './validate-CiBKPHUw.js';
import 'handlebars';
import 'postcss';
import 'fs/promises';
import 'path';
import 'pdf-lib';

//#region src/routes/api/decks/[id]/export/+server.ts
async function GET(event) {
	if (!event.locals.user) throw error(401, "Not authenticated");
	const deckId = event.params.id;
	const [deck] = await db.select({ id: decks.id }).from(decks).where(and(eq(decks.id, deckId), eq(decks.ownerId, event.locals.user.id))).limit(1);
	if (!deck) throw error(404, "Deck not found");
	const pdf = await renderDeckToPdf(deckId);
	return new Response(new Uint8Array(pdf), { headers: {
		"Content-Type": "application/pdf",
		"Content-Disposition": `attachment; filename="deck-${deckId}.pdf"`,
		"Content-Length": String(pdf.byteLength)
	} });
}

export { GET };
//# sourceMappingURL=_server.ts-CNMB6D-y.js.map
