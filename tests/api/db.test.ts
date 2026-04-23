import { describe, it, expect } from 'vitest';
import { db } from '../../src/lib/server/db/index.ts';
import { users } from '../../src/lib/server/db/schema.ts';

describe('DB client', () => {
  it('can query the users table', async () => {
    const rows = await db.select().from(users).limit(1);
    expect(Array.isArray(rows)).toBe(true);
  });
});
