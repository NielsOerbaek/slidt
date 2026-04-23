import { hash, verify } from '@node-rs/argon2';
import { db, sessions, users } from './db/index.ts';
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
): Promise<{ id: string; email: string; name: string } | null> {
  const now = new Date();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
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
