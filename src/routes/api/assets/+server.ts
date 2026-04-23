import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, assets, decks } from '$lib/server/db/index.ts';
import { saveAsset } from '$lib/server/assets.ts';
import { eq, and } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const deckId = event.url.searchParams.get('deckId');
  if (!deckId) {
    const rows = await db.select().from(assets);
    return json(rows);
  }
  const rows = await db.select().from(assets).where(eq(assets.deckId, deckId));
  return json(rows);
}

export async function POST(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const formData = await event.request.formData().catch(() => null);
  if (!formData) throw error(400, 'multipart/form-data required');
  const deckId = formData.get('deckId');
  const kind = formData.get('kind');
  const file = formData.get('file');
  if (typeof deckId !== 'string') throw error(400, 'deckId required');
  if (typeof kind !== 'string') throw error(400, 'kind required');
  if (!(file instanceof Blob)) throw error(400, 'file required');

  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) throw error(404, 'Deck not found');

  const filename = file instanceof File ? file.name : 'upload';
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = await saveAsset(buffer, filename);

  const [asset] = await db
    .insert(assets)
    .values({ deckId, kind, storagePath, filename, uploadedById: event.locals.user.id })
    .returning();
  return json(asset, { status: 201 });
}
