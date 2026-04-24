import { d as db, u as users, j as apiKeys, s as sessions } from './db-CWmjlPNh.js';
import { eq } from 'drizzle-orm';
import { verify, hash } from '@node-rs/argon2';

//#region src/lib/server/auth.ts
async function hashPassword(password) {
	return hash(password, { algorithm: 2 });
}
async function verifyPassword(storedHash, password) {
	try {
		return await verify(storedHash, password);
	} catch {
		return false;
	}
}
var SESSION_DURATION_MS = 720 * 60 * 60 * 1e3;
async function createSession(userId) {
	const id = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	await db.insert(sessions).values({
		id,
		userId,
		expiresAt
	});
	return id;
}
async function resolveSession(token) {
	const now = /* @__PURE__ */ new Date();
	const rows = await db.select({
		id: users.id,
		email: users.email,
		name: users.name,
		isAdmin: users.isAdmin,
		preferences: users.preferences
	}).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(eq(sessions.id, token)).limit(1);
	if (!rows[0]) return null;
	await db.update(sessions).set({ expiresAt: new Date(now.getTime() + SESSION_DURATION_MS) }).where(eq(sessions.id, token));
	return rows[0];
}
async function deleteSession(token) {
	await db.delete(sessions).where(eq(sessions.id, token));
}
var KEY_PREFIX = "slidt_";
function generateApiKeyToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return `${KEY_PREFIX}${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}
async function hashApiKey(token) {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
	return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function createApiKey(userId, name) {
	const token = generateApiKeyToken();
	const keyHash = await hashApiKey(token);
	const key = (await db.insert(apiKeys).values({
		userId,
		name,
		keyHash
	}).returning())[0];
	if (!key) throw new Error("Failed to create API key");
	return {
		token,
		key
	};
}
async function resolveApiKey(token) {
	if (!token.startsWith(KEY_PREFIX)) return null;
	const keyHash = await hashApiKey(token);
	const rows = await db.select({
		id: users.id,
		email: users.email,
		name: users.name,
		isAdmin: users.isAdmin,
		preferences: users.preferences
	}).from(apiKeys).innerJoin(users, eq(apiKeys.userId, users.id)).where(eq(apiKeys.keyHash, keyHash)).limit(1);
	if (!rows[0]) return null;
	db.update(apiKeys).set({ lastUsedAt: /* @__PURE__ */ new Date() }).where(eq(apiKeys.keyHash, keyHash)).catch(() => {});
	return rows[0];
}
async function listApiKeys(userId) {
	return db.select({
		id: apiKeys.id,
		name: apiKeys.name,
		createdAt: apiKeys.createdAt,
		lastUsedAt: apiKeys.lastUsedAt
	}).from(apiKeys).where(eq(apiKeys.userId, userId));
}
async function deleteApiKey(id, userId) {
	return (await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning({ id: apiKeys.id })).length > 0;
}
async function updateProfile(userId, name) {
	await db.update(users).set({ name }).where(eq(users.id, userId));
}
async function changePassword(userId, currentPassword, newPassword) {
	const row = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
	if (!row[0]) return {
		ok: false,
		error: "User not found"
	};
	if (!await verifyPassword(row[0].passwordHash, currentPassword)) return {
		ok: false,
		error: "Current password incorrect"
	};
	const newHash = await hashPassword(newPassword);
	await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));
	return { ok: true };
}
async function updatePreferences(userId, patch) {
	const merged = {
		...(await db.select({ preferences: users.preferences }).from(users).where(eq(users.id, userId)).limit(1))[0]?.preferences ?? {},
		...patch
	};
	await db.update(users).set({ preferences: merged }).where(eq(users.id, userId));
}

export { resolveSession as a, changePassword as b, createSession as c, deleteSession as d, updateProfile as e, deleteApiKey as f, createApiKey as g, hashPassword as h, listApiKeys as l, resolveApiKey as r, updatePreferences as u, verifyPassword as v };
//# sourceMappingURL=auth-4Mm7I3lm.js.map
