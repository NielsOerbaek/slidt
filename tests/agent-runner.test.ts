import { describe, it, expect, vi } from 'vitest';

// Mock @anthropic-ai/sdk
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      stream: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        finalMessage: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Done!' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 10, output_tokens: 5 },
        }),
      }),
    };
  },
}));

// Minimal drizzle-orm mock (operators return plain objects — DB mock ignores values)
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return { ...actual, eq: vi.fn(() => ({})), asc: vi.fn(() => ({})), or: vi.fn(() => ({})), and: vi.fn(() => ({})) };
});

// DB mock: every chain resolves to a predictable array
vi.mock('$lib/server/db/index.ts', () => {
  const DECK = { id: 'deck-1', title: 'Test Deck', themeId: null, slideOrder: [] };
  function chain(val: unknown): unknown {
    const obj: Record<string, unknown> = {
      then(onfulfilled: (v: unknown) => unknown) {
        return Promise.resolve(val).then(onfulfilled);
      },
      catch(onrejected: (e: unknown) => unknown) {
        return Promise.resolve(val).catch(onrejected);
      },
      finally(onfinally: () => void) {
        return Promise.resolve(val).finally(onfinally);
      },
    };
    for (const m of ['from', 'where', 'limit', 'orderBy', 'set', 'values', 'returning']) {
      obj[m] = () => chain(Array.isArray(val) && val.length > 0 ? val : []);
    }
    return obj;
  }
  return {
    db: {
      select: vi.fn(() => chain([DECK])),
      insert: vi.fn(() => chain([])),
      update: vi.fn(() => chain([DECK])),
    },
    agentMessages: {},
    decks: {},
    themes: {},
    slideTypes: {},
  };
});

// Mock tools so no real DB queries happen inside tool execution
vi.mock('$lib/server/agent/tools.ts', () => ({
  AGENT_TOOLS: [],
  executeTool: vi.fn().mockResolvedValue({ result: 'ok' }),
}));

describe('runAgentStream', () => {
  it('returns a ReadableStream', async () => {
    const { runAgentStream } = await import('../src/lib/server/agent/runner.ts');
    const stream = runAgentStream('deck-1', 'user-1', 'Hello');
    expect(stream).toBeInstanceOf(ReadableStream);
  });

  it('emits a done event when Claude responds without tool calls', async () => {
    const { runAgentStream } = await import('../src/lib/server/agent/runner.ts');
    const stream = runAgentStream('deck-1', 'user-1', 'Hello');
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    for (let i = 0; i < 200; i++) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
    }
    expect(chunks.join('')).toContain('"type":"done"');
  });
});
