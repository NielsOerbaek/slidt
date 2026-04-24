import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @sveltejs/kit error
vi.mock('@sveltejs/kit', () => ({
  error: (status: number, message: string) => {
    throw Object.assign(new Error(message), { status });
  },
}));

// Minimal drizzle-orm mock (operators return plain objects — DB mock ignores values)
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return { ...actual, eq: vi.fn(() => ({})), and: vi.fn(() => ({})) };
});

// Mock DB before importing the module under test
vi.mock('$lib/server/db/index.ts', () => ({
  db: { select: vi.fn() },
  decks: {},
  deckCollaborators: {},
  users: {},
}));

import { resolveDeckAccess, requireDeckRole } from '../src/lib/server/deck-access.ts';
import { db } from '$lib/server/db/index.ts';

/** Build a chainable query mock where .limit() resolves to rows. */
function makeChain(rows: unknown[]) {
  const chain = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    innerJoin: vi.fn(),
  };
  chain.from.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.innerJoin.mockReturnValue(chain);
  chain.limit.mockResolvedValue(rows);
  return chain;
}

/** Set up db.select to return successive result sets for each .limit() call. */
function setupSelect(...resultSets: unknown[][]) {
  if (resultSets.length === 1) {
    // single call — simple mock
    const chain = makeChain(resultSets[0]!);
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  } else {
    // multiple sequential calls — same chain object, limit returns values in order
    const chain = {
      from: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
      innerJoin: vi.fn(),
    };
    chain.from.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    chain.innerJoin.mockReturnValue(chain);
    let callCount = 0;
    chain.limit.mockImplementation(() => {
      const rows = resultSets[callCount] ?? [];
      callCount++;
      return Promise.resolve(rows);
    });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  }
}

describe('resolveDeckAccess', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns null when deck does not exist', async () => {
    setupSelect([]);
    const result = await resolveDeckAccess('deck-1', 'user-1');
    expect(result).toBeNull();
  });

  it('returns owner when user is the owner', async () => {
    setupSelect([{ ownerId: 'user-1' }], []);
    const result = await resolveDeckAccess('deck-1', 'user-1');
    expect(result).toBe('owner');
  });

  it('returns editor when user is a collaborator with editor role', async () => {
    setupSelect([{ ownerId: 'owner-99' }], [{ role: 'editor' }]);
    const result = await resolveDeckAccess('deck-1', 'user-1');
    expect(result).toBe('editor');
  });

  it('returns viewer when user is a collaborator with viewer role', async () => {
    setupSelect([{ ownerId: 'owner-99' }], [{ role: 'viewer' }]);
    const result = await resolveDeckAccess('deck-1', 'user-1');
    expect(result).toBe('viewer');
  });

  it('returns null when user has no relation to deck', async () => {
    setupSelect([{ ownerId: 'owner-99' }], []);
    const result = await resolveDeckAccess('deck-1', 'user-1');
    expect(result).toBeNull();
  });
});

describe('requireDeckRole', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('throws 401 when userId is undefined', async () => {
    await expect(requireDeckRole('deck-1', undefined, 'viewer')).rejects.toMatchObject({ status: 401 });
  });

  it('throws 404 when deck does not exist', async () => {
    setupSelect([]);
    await expect(requireDeckRole('deck-1', 'user-1', 'viewer')).rejects.toMatchObject({ status: 404 });
  });

  it('throws 403 when role is insufficient (viewer cannot require editor)', async () => {
    setupSelect([{ ownerId: 'owner-99' }], [{ role: 'viewer' }]);
    await expect(requireDeckRole('deck-1', 'user-1', 'editor')).rejects.toMatchObject({ status: 403 });
  });

  it('returns the role when access meets minimum requirement', async () => {
    setupSelect([{ ownerId: 'owner-99' }], [{ role: 'editor' }]);
    const role = await requireDeckRole('deck-1', 'user-1', 'viewer');
    expect(role).toBe('editor');
  });

  it('owner satisfies any minRole including owner', async () => {
    setupSelect([{ ownerId: 'user-1' }], []);
    const role = await requireDeckRole('deck-1', 'user-1', 'owner');
    expect(role).toBe('owner');
  });
});
