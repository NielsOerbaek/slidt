import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db, assets, decks } from '$lib/server/db/index.ts';
import { readAsset, removeAsset } from '$lib/server/assets.ts';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

async function requireAssetAccess(event: RequestEvent) {
  if (!event.locals.user) throw error(401, 'Not authenticated');
  const [asset] = await db
    .select()
    .from(assets)
    .where(eq(assets.id, event.params.id!))
    .limit(1);
  if (!asset) throw error(404, 'Asset not found');
  // Verify deck ownership
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, asset.deckId), eq(decks.ownerId, event.locals.user.id)))
    .limit(1);
  if (!deck) throw error(403, 'Forbidden');
  return asset;
}

export async function GET(event: RequestEvent) {
  const asset = await requireAssetAccess(event);
  const buffer = await readAsset(asset.storagePath).catch(() => {
    throw error(404, 'File not found on disk');
  });
  const ext = asset.filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeTypes: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', svg: 'image/svg+xml', pdf: 'application/pdf',
    webp: 'image/webp',
  };
  const contentType = mimeTypes[ext] ?? 'application/octet-stream';
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}

export async function DELETE(event: RequestEvent) {
  const asset = await requireAssetAccess(event);
  await removeAsset(asset.storagePath);
  await db.delete(assets).where(eq(assets.id, asset.id));
  return json({ ok: true });
}
