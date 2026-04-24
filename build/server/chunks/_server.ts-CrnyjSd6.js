import { r as requireDeckRole, a as removeCollaborator, l as listCollaborators, u as updateCollaboratorRole, b as addCollaborator } from './deck-access-DZX5watP.js';
import { error, json } from '@sveltejs/kit';
import './db-CWmjlPNh.js';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

//#region src/routes/api/decks/[id]/collaborators/+server.ts
async function GET(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "owner");
	return json(await listCollaborators(event.params.id));
}
async function POST(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "owner");
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.email !== "string") throw error(400, "email required");
	const role = body.role === "viewer" ? "viewer" : "editor";
	const collab = await addCollaborator(event.params.id, body.email, role);
	if (!collab) throw error(404, `No user found with email: ${body.email}`);
	return json(collab, { status: 201 });
}
async function PATCH(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "owner");
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.userId !== "string") throw error(400, "userId required");
	const role = body.role === "viewer" ? "viewer" : "editor";
	if (!await updateCollaboratorRole(event.params.id, body.userId, role)) throw error(404, "Collaborator not found");
	return json({ ok: true });
}
async function DELETE(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "owner");
	const userId = new URL(event.request.url).searchParams.get("userId");
	if (!userId) throw error(400, "userId required");
	if (!await removeCollaborator(event.params.id, userId)) throw error(404, "Collaborator not found");
	return json({ ok: true });
}

export { DELETE, GET, PATCH, POST };
//# sourceMappingURL=_server.ts-CrnyjSd6.js.map
