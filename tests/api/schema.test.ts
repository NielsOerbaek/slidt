import { describe, it, expect } from 'vitest';
import {
  users, sessions, decks, slides, slideTypes,
  themes, assets, agentMessages, shareLinks,
} from '../../src/lib/server/db/schema.ts';

describe('Drizzle schema', () => {
  it('exports all 9 tables', () => {
    expect(users).toBeDefined();
    expect(sessions).toBeDefined();
    expect(decks).toBeDefined();
    expect(slides).toBeDefined();
    expect(slideTypes).toBeDefined();
    expect(themes).toBeDefined();
    expect(assets).toBeDefined();
    expect(agentMessages).toBeDefined();
    expect(shareLinks).toBeDefined();
  });

  it('users table has expected columns', () => {
    expect(Object.keys(users)).toContain('id');
    expect(Object.keys(users)).toContain('email');
    expect(Object.keys(users)).toContain('passwordHash');
  });

  it('decks slideOrder is an array column', () => {
    expect(decks.slideOrder.dataType).toBe('array');
  });
});
