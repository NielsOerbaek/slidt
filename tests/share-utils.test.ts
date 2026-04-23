import { describe, it, expect } from 'vitest';
import { isShareExpired } from '../src/lib/utils/share-utils.ts';

describe('isShareExpired', () => {
  it('returns false when expiresAt is null (no expiry)', () => {
    expect(isShareExpired(null)).toBe(false);
  });
  it('returns false for future expiry', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60);
    expect(isShareExpired(future)).toBe(false);
  });
  it('returns true for past expiry', () => {
    const past = new Date(Date.now() - 1000);
    expect(isShareExpired(past)).toBe(true);
  });
  it('returns true for expiry exactly at now', () => {
    const now = new Date(Date.now() - 1);
    expect(isShareExpired(now)).toBe(true);
  });
});
