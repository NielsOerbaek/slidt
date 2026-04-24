import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => ({})),
    asc: vi.fn(() => ({})),
    or: vi.fn(() => ({})),
    and: vi.fn(() => ({})),
  };
});

const DECK = { id: 'deck-1', title: 'Test Deck', themeId: null, slideOrder: [] };

function chain(val: unknown): unknown {
  const obj: Record<string, unknown> = {
    then(onfulfilled: (v: unknown) => unknown) { return Promise.resolve(val).then(onfulfilled); },
    catch(onrejected: (e: unknown) => unknown) { return Promise.resolve(val).catch(onrejected); },
    finally(onfinally: () => void) { return Promise.resolve(val).finally(onfinally); },
  };
  for (const m of ['from', 'where', 'limit', 'orderBy', 'set', 'values', 'returning']) {
    obj[m] = () => chain(Array.isArray(val) && val.length > 0 ? val : []);
  }
  return obj;
}

vi.mock('$lib/server/db/index.ts', () => ({
  db: {
    select: vi.fn(() => chain([DECK])),
    insert: vi.fn(() => chain([])),
    update: vi.fn(() => chain([DECK])),
  },
  agentMessages: {},
  decks: {},
  themes: {},
  slideTypes: {},
}));

vi.mock('$lib/server/agent/tools.ts', () => ({
  AGENT_TOOLS: [
    {
      name: 'list_slides',
      description: 'List slides',
      input_schema: { type: 'object', properties: {}, required: [] },
    },
  ],
  executeTool: vi.fn().mockResolvedValue({ result: 'ok' }),
}));

vi.mock('$lib/server/agent/runner.ts', () => ({
  BASE_SYSTEM_PROMPT: 'You are a slide assistant.',
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal Ollama SSE stream that returns one text chunk then [DONE] */
function makeFetchOk(content: string, finishReason = 'stop') {
  const lines = [
    `data: ${JSON.stringify({ choices: [{ delta: { content }, finish_reason: null }] })}`,
    `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: finishReason }] })}`,
    'data: [DONE]',
    '',
  ].join('\n');
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(encoder.encode(lines));
      ctrl.close();
    },
  });
  return Promise.resolve(new Response(stream, { status: 200 }));
}

/** Collect all SSE events from the runner's ReadableStream */
async function collectEvents(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let raw = '';
  for (let i = 0; i < 500; i++) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
  }
  return raw
    .split('\n')
    .filter((l) => l.startsWith('data: '))
    .map((l) => JSON.parse(l.slice(6)));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('runOllamaStream', () => {
  beforeEach(() => {
    process.env.OLLAMA_BASE_URL = 'http://test-ollama';
    process.env.OLLAMA_API_KEY = 'test-key';
    vi.resetModules();
  });

  it('returns a ReadableStream', async () => {
    vi.stubGlobal('fetch', () => makeFetchOk('Hello!'));
    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const stream = runOllamaStream('deck-1', 'user-1', 'Hi', 'gemma4:31b');
    expect(stream).toBeInstanceOf(ReadableStream);
  });

  it('emits text delta and done events', async () => {
    vi.stubGlobal('fetch', () => makeFetchOk('Howdy!'));
    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const events = await collectEvents(runOllamaStream('deck-1', 'user-1', 'Hi', 'gemma4:31b'));
    expect(events.some((e) => e.type === 'text' && e.delta === 'Howdy!')).toBe(true);
    expect(events.at(-1)?.type).toBe('done');
  });

  it('executes a tool call and emits tool_start + tool_done events', async () => {
    const toolCallChunk = JSON.stringify({
      choices: [{
        delta: {
          tool_calls: [{
            index: 0,
            id: 'call-1',
            type: 'function',
            function: { name: 'list_slides', arguments: '{}' },
          }],
        },
        finish_reason: null,
      }],
    });
    const finishChunk = JSON.stringify({ choices: [{ delta: {}, finish_reason: 'tool_calls' }] });
    const afterToolChunk = JSON.stringify({ choices: [{ delta: { content: 'Done' }, finish_reason: null }] });
    const afterDone = JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }] });

    const calls = [
      `data: ${toolCallChunk}\ndata: ${finishChunk}\ndata: [DONE]\n`,
      `data: ${afterToolChunk}\ndata: ${afterDone}\ndata: [DONE]\n`,
    ];
    let callCount = 0;
    vi.stubGlobal('fetch', () => {
      const enc = new TextEncoder();
      const body = calls[callCount++] ?? 'data: [DONE]\n';
      return Promise.resolve(new Response(
        new ReadableStream({ start(c) { c.enqueue(enc.encode(body)); c.close(); } }),
        { status: 200 },
      ));
    });

    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const events = await collectEvents(runOllamaStream('deck-1', 'user-1', 'List slides', 'gemma4:31b'));
    expect(events.some((e) => e.type === 'tool_start' && e.tool === 'list_slides')).toBe(true);
    expect(events.some((e) => e.type === 'tool_done' && e.tool === 'list_slides')).toBe(true);
    expect(events.at(-1)?.type).toBe('done');
  });

  it('emits error event when Ollama returns non-ok status', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve(new Response('Bad gateway', { status: 502 })));
    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const events = await collectEvents(runOllamaStream('deck-1', 'user-1', 'Hi', 'gemma4:31b'));
    expect(events.some((e) => e.type === 'error')).toBe(true);
  });
});
