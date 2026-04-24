import { hash, verify } from '@node-rs/argon2';
import { db, sessions, users, apiKeys } from './db/index.ts';
import { eq } from 'drizzle-orm';

// ── Password hashing ──────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return hash(password, { algorithm: 2 }); // 2 = argon2id
}

export async function verifyPassword(
  storedHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}

// ── Session management ────────────────────────────────────────────

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string): Promise<string> {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return id;
}

export async function resolveSession(
  token: string,
): Promise<{ id: string; email: string; name: string; isAdmin: boolean } | null> {
  const now = new Date();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      isAdmin: users.isAdmin,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token))
    .limit(1);

  if (!rows[0]) return null;

  // Refresh session expiry on use (rolling window)
  await db
    .update(sessions)
    .set({ expiresAt: new Date(now.getTime() + SESSION_DURATION_MS) })
    .where(eq(sessions.id, token));

  return rows[0];
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, token));
}

// ── API key management ────────────────────────────────────────────

const KEY_PREFIX = 'slidt_';

export function generateApiKeyToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${KEY_PREFIX}${hex}`;
}

export async function hashApiKey(token: string): Promise<string> {
  // Use SHA-256 for API keys (argon2 is overkill; keys are long random strings)
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createApiKey(
  userId: string,
  name: string,
): Promise<{ token: string; key: typeof apiKeys.$inferSelect }> {
  const token = generateApiKeyToken();
  const keyHash = await hashApiKey(token);
  const rows = await db
    .insert(apiKeys)
    .values({ userId, name, keyHash })
    .returning();
  const key = rows[0];
  if (!key) throw new Error('Failed to create API key');
  return { token, key };
}

export async function resolveApiKey(
  token: string,
): Promise<{ id: string; email: string; name: string; isAdmin: boolean } | null> {
  if (!token.startsWith(KEY_PREFIX)) return null;
  const keyHash = await hashApiKey(token);
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      isAdmin: users.isAdmin,
    })
    .from(apiKeys)
    .innerJoin(users, eq(apiKeys.userId, users.id))
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!rows[0]) return null;

  // Update last_used_at in background
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.keyHash, keyHash))
    .catch(() => {});

  return rows[0];
}

export async function listApiKeys(userId: string) {
  return db
    .select({ id: apiKeys.id, name: apiKeys.name, createdAt: apiKeys.createdAt, lastUsedAt: apiKeys.lastUsedAt })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));
}

export async function deleteApiKey(id: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(apiKeys)
    .where(eq(apiKeys.id, id))
    .returning({ id: apiKeys.id });
  return result.length > 0;
}
