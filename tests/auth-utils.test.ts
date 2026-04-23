import { describe, it, expect } from 'vitest';
import { normalizeEmail } from '../src/lib/utils/auth-utils.ts';

describe('normalizeEmail', () => {
  it('trims leading/trailing whitespace', () => {
    expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com');
  });
  it('lowercases the entire address', () => {
    expect(normalizeEmail('User@Example.COM')).toBe('user@example.com');
  });
  it('handles both trim and lowercase', () => {
    expect(normalizeEmail(' User@Example.com ')).toBe('user@example.com');
  });
  it('is idempotent on clean input', () => {
    expect(normalizeEmail('niels@ogtal.dk')).toBe('niels@ogtal.dk');
  });
});
