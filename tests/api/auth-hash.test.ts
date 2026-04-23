import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/server/auth.ts';

describe('hashPassword / verifyPassword', () => {
  it('hashes a password', async () => {
    const hash = await hashPassword('correct-horse-battery');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(20);
    expect(hash).not.toBe('correct-horse-battery');
  });

  it('verifies the correct password', async () => {
    const hash = await hashPassword('my-secret');
    expect(await verifyPassword(hash, 'my-secret')).toBe(true);
  });

  it('rejects wrong password', async () => {
    const hash = await hashPassword('my-secret');
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });

  it('produces different hashes for same input (salted)', async () => {
    const h1 = await hashPassword('same');
    const h2 = await hashPassword('same');
    expect(h1).not.toBe(h2);
  });
});
