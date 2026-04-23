import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/pdf.ts', () => ({
  renderDeckToPdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 test')),
}));

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

describe('GET /api/decks/[id]/export', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const { GET } = await import('../src/routes/api/decks/[id]/export/+server.ts');
    const event: any = { locals: { user: null }, params: { id: 'deck-id' } };
    await expect(GET(event)).rejects.toMatchObject({ status: 401 });
  });

  it('returns application/pdf response for authenticated deck owner', async () => {
    const { GET } = await import('../src/routes/api/decks/[id]/export/+server.ts');
    const event: any = {
      locals: { user: { id: 'user-id' } },
      params: { id: 'deck-id' },
    };
    const res = await GET(event);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('deck-id');
  });
});
