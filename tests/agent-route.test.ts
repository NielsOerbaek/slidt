import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/db/index.ts', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([{ id: 'deck-id', ownerId: 'user-id' }]),
        })),
      })),
    })),
  },
  decks: {},
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return { ...actual, eq: vi.fn(() => ({})), and: vi.fn(() => ({})) };
});

vi.mock('$lib/server/agent/runner.ts', () => ({
  runAgentStream: vi.fn().mockReturnValue(
    new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode('data: {"type":"text","delta":"Hello"}\n\n'));
        controller.enqueue(enc.encode('data: {"type":"done"}\n\n'));
        controller.close();
      },
    }),
  ),
}));

describe('POST /api/decks/[id]/agent', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const { POST } = await import('../src/routes/api/decks/[id]/agent/+server.ts');
    const event: any = {
      locals: { user: null },
      params: { id: 'deck-id' },
      request: { json: () => Promise.resolve({ message: 'hello' }) },
    };
    await expect(POST(event)).rejects.toMatchObject({ status: 401 });
  });

  it('returns text/event-stream for authenticated deck owner', async () => {
    const { POST } = await import('../src/routes/api/decks/[id]/agent/+server.ts');
    const event: any = {
      locals: { user: { id: 'user-id' } },
      params: { id: 'deck-id' },
      request: { json: () => Promise.resolve({ message: 'Rewrite slide 3' }) },
    };
    const res = await POST(event);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('rejects missing or blank message with 400', async () => {
    const { POST } = await import('../src/routes/api/decks/[id]/agent/+server.ts');
    const event: any = {
      locals: { user: { id: 'user-id' } },
      params: { id: 'deck-id' },
      request: { json: () => Promise.resolve({ message: '   ' }) },
    };
    await expect(POST(event)).rejects.toMatchObject({ status: 400 });
  });

  it('returns 404 when deck not found or not owned', async () => {
    const { db } = await import('$lib/server/db/index.ts');
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })),
      })),
    } as any);
    const { POST } = await import('../src/routes/api/decks/[id]/agent/+server.ts');
    const event: any = {
      locals: { user: { id: 'user-id' } },
      params: { id: 'other-deck' },
      request: { json: () => Promise.resolve({ message: 'hello' }) },
    };
    await expect(POST(event)).rejects.toMatchObject({ status: 404 });
  });
});
