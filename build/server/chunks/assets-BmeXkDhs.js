import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

//#region src/lib/server/assets.ts
function assetsDir() {
	return process.env.ASSETS_DIR ?? "./data/assets";
}
async function saveAsset(fileBuffer, originalName) {
	const ext = path.extname(originalName) || "";
	const filename = `${crypto.randomUUID()}${ext}`;
	const dir = assetsDir();
	await mkdir(dir, { recursive: true });
	const storagePath = path.join(dir, filename);
	await writeFile(storagePath, fileBuffer);
	return storagePath;
}
async function readAsset(storagePath) {
	return readFile(storagePath);
}
async function removeAsset(storagePath) {
	await unlink(storagePath).catch(() => {});
}

export { readAsset as a, removeAsset as r, saveAsset as s };
//# sourceMappingURL=assets-BmeXkDhs.js.map
