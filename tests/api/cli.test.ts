import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createUser, resetPassword } from '../../scripts/cli-lib.ts';
import { db, users } from '../../src/lib/server/db/index.ts';
import { eq } from 'drizzle-orm';
import { cleanDB } from './helpers.ts';
import { verifyPassword } from '../../src/lib/server/auth.ts';

describe('createUser', () => {
  beforeEach(cleanDB);
  afterEach(cleanDB);

  it('creates a user in the database', async () => {
    await createUser('alice@test.local', 'Alice', 'pw123456');
    const [user] = await db.select().from(users).where(eq(users.email, 'alice@test.local'));
    expect(user).toBeDefined();
    expect(user!.name).toBe('Alice');
    expect(await verifyPassword(user!.passwordHash, 'pw123456')).toBe(true);
  });

  it('throws if email already exists', async () => {
    await createUser('bob@test.local', 'Bob', 'pw123456');
    await expect(createUser('bob@test.local', 'Bob2', 'pw654321')).rejects.toThrow();
  });
});

describe('resetPassword', () => {
  beforeEach(cleanDB);
  afterEach(cleanDB);

  it('updates the password hash', async () => {
    await createUser('carol@test.local', 'Carol', 'old-password');
    await resetPassword('carol@test.local', 'new-password');
    const [user] = await db.select().from(users).where(eq(users.email, 'carol@test.local'));
    expect(await verifyPassword(user!.passwordHash, 'new-password')).toBe(true);
    expect(await verifyPassword(user!.passwordHash, 'old-password')).toBe(false);
  });

  it('throws if user not found', async () => {
    await expect(resetPassword('nobody@test.local', 'pw')).rejects.toThrow('User not found');
  });
});
