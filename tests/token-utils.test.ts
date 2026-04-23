import { describe, it, expect } from 'vitest';
import { isColorToken } from '../src/lib/utils/token-utils.ts';

describe('isColorToken', () => {
  it('recognizes 6-digit hex colors', () => {
    expect(isColorToken('#FFFFFF')).toBe(true);
    expect(isColorToken('#6E31FF')).toBe(true);
    expect(isColorToken('#000000')).toBe(true);
  });
  it('recognizes 3-digit hex colors', () => {
    expect(isColorToken('#FFF')).toBe(true);
    expect(isColorToken('#abc')).toBe(true);
  });
  it('returns false for non-color values', () => {
    expect(isColorToken('bold')).toBe(false);
    expect(isColorToken('16px')).toBe(false);
    expect(isColorToken('Inter, sans-serif')).toBe(false);
  });
  it('returns false for empty string', () => {
    expect(isColorToken('')).toBe(false);
  });
});
