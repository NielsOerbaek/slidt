import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeDate } from '../src/lib/utils/date-utils.ts';

describe('formatRelativeDate', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-04-23T12:00:00Z')); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns "just now" for very recent dates', () => {
    expect(formatRelativeDate(new Date('2026-04-23T11:59:50Z'))).toBe('just now');
  });
  it('returns minutes ago', () => {
    expect(formatRelativeDate(new Date('2026-04-23T11:55:00Z'))).toBe('5 min ago');
  });
  it('returns hours ago', () => {
    expect(formatRelativeDate(new Date('2026-04-23T10:00:00Z'))).toBe('2 hr ago');
  });
  it('returns days ago', () => {
    expect(formatRelativeDate(new Date('2026-04-21T12:00:00Z'))).toBe('2 days ago');
  });
  it('returns date string for old dates', () => {
    const result = formatRelativeDate(new Date('2026-01-01T00:00:00Z'));
    expect(result).toMatch(/Jan 1, 2026/);
  });
});
