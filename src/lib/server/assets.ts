import { mkdir, writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

function assetsDir(): string {
  return process.env.ASSETS_DIR ?? './data/assets';
}

export async function saveAsset(
  fileBuffer: Buffer,
  originalName: string,
): Promise<string> {
  const ext = path.extname(originalName) || '';
  const unique = crypto.randomUUID();
  const filename = `${unique}${ext}`;
  const dir = assetsDir();
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(dir, filename);
  await writeFile(storagePath, fileBuffer);
  return storagePath;
}

export async function readAsset(storagePath: string): Promise<Buffer> {
  return readFile(storagePath);
}

export async function removeAsset(storagePath: string): Promise<void> {
  await unlink(storagePath).catch(() => { /* already gone */ });
}
