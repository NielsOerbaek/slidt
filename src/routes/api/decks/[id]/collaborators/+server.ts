import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import {
  requireDeckRole,
  listCollaborators,
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
} from '$lib/server/deck-access.ts';

export async function GET(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'owner');
  const collabs = await listCollaborators(event.params.id!);
  return json(collabs);
}

export async function POST(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'owner');
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.email !== 'string') throw error(400, 'email required');
  const role = body.role === 'viewer' ? 'viewer' : 'editor';
  const collab = await addCollaborator(event.params.id!, body.email, role);
  if (!collab) throw error(404, `No user found with email: ${body.email}`);
  return json(collab, { status: 201 });
}

export async function PATCH(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'owner');
  const body = await event.request.json().catch(() => null);
  if (!body || typeof body.userId !== 'string') throw error(400, 'userId required');
  const role = body.role === 'viewer' ? 'viewer' : 'editor';
  const ok = await updateCollaboratorRole(event.params.id!, body.userId, role);
  if (!ok) throw error(404, 'Collaborator not found');
  return json({ ok: true });
}

export async function DELETE(event: RequestEvent) {
  await requireDeckRole(event.params.id!, event.locals.user?.id, 'owner');
  const userId = new URL(event.request.url).searchParams.get('userId');
  if (!userId) throw error(400, 'userId required');
  const ok = await removeCollaborator(event.params.id!, userId);
  if (!ok) throw error(404, 'Collaborator not found');
  return json({ ok: true });
}
