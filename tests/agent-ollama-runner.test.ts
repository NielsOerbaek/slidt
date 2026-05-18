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

// ── Reasoning-model create_theme extraction ───────────────────────────────────
//
// Reasoning models (DeepSeek-R1, QwQ, etc.) output their plan in delta.reasoning
// (thinking) and then produce empty delta.content + no tool calls.
// runOllamaStream must detect a complete --sl-* token set in the reasoning and
// call create_theme directly rather than leaving the user with a silent no-op.

describe('reasoning-model: create_theme extraction', () => {
  /** All 14 required --sl-* tokens plus a quoted name — minimum viable reasoning block */
  const FULL_REASONING = [
    "The user wants a new theme.",
    "Name: 'spritz'",
    "--sl-bg: `#FFFBF7`",
    "--sl-surface: `#FFFFFF`",
    "--sl-fg: `#2D2926`",
    "--sl-dim: `#6B6662`",
    "--sl-very-dim: `#A5A09D`",
    "--sl-border: `#EBE9E7`",
    "--sl-border-mid: `#D1CFCD`",
    "--sl-dark-bg: `#1A1A1A`",
    "--sl-dark-fg: `#FFFFFF`",
    "--sl-dark-dim: `#A0A0A0`",
    "--sl-accent: `#FF4D6D`",
    "--sl-accent-bg: `rgba(255, 77, 109, 0.1)`",
    "--sl-font: `'Playfair Display', serif`",
    "--sl-body-font: `'Inter', sans-serif`",
  ].join('\n');

  /** Simulate a reasoning-only SSE response (no delta.content, no tool_calls) */
  function makeReasoningStream(reasoning: string) {
    const lines = [
      `data: ${JSON.stringify({ choices: [{ delta: { reasoning }, finish_reason: null }] })}`,
      `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }] })}`,
      'data: [DONE]',
      '',
    ].join('\n');
    const enc = new TextEncoder();
    return Promise.resolve(new Response(
      new ReadableStream({ start(c) { c.enqueue(enc.encode(lines)); c.close(); } }),
      { status: 200 },
    ));
  }

  beforeEach(() => {
    process.env.OLLAMA_BASE_URL = 'http://test-ollama';
    vi.resetModules();
  });

  it('extracts all 14 tokens + name and emits tool_start / tool_done for create_theme', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', () => {
      callCount++;
      // First call: reasoning-only (model "thinks" but emits no tool call)
      // Second call: model summarises after the tool has been executed
      return callCount === 1 ? makeReasoningStream(FULL_REASONING) : makeFetchOk('Tema oprettet!');
    });

    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const events = await collectEvents(runOllamaStream('deck-1', 'user-1', "Lav tema 'spritz'", 'model'));

    const startEv = events.find((e) => e.type === 'tool_start' && e.tool === 'create_theme');
    expect(startEv, 'tool_start for create_theme must be emitted').toBeDefined();
    expect(startEv?.input?.name).toBe('spritz');
    expect(startEv?.input?.tokens?.['--sl-bg']).toBe('#FFFBF7');
    expect(startEv?.input?.tokens?.['--sl-accent']).toBe('#FF4D6D');
    expect(startEv?.input?.tokens?.['--sl-accent-bg']).toBe('rgba(255, 77, 109, 0.1)');
    expect(startEv?.input?.tokens?.['--sl-font']).toBe("'Playfair Display', serif");

    expect(events.some((e) => e.type === 'tool_done' && e.tool === 'create_theme')).toBe(true);
    expect(events.at(-1)?.type).toBe('done');
    expect(callCount).toBe(2); // extraction on iter 1, summary on iter 2
  });

  it('extracts token values revised mid-reasoning (last occurrence wins)', async () => {
    const reasoning = [
      "First attempt: --sl-bg: `#000000` --sl-accent: `#aaaaaa`",
      "Actually, better palette:",
      "--sl-bg: `#FFFBF7`",
      "--sl-surface: `#FFFFFF`",
      "--sl-fg: `#2D2926`",
      "--sl-dim: `#6B6662`",
      "--sl-very-dim: `#A5A09D`",
      "--sl-border: `#EBE9E7`",
      "--sl-border-mid: `#D1CFCD`",
      "--sl-dark-bg: `#1A1A1A`",
      "--sl-dark-fg: `#FFFFFF`",
      "--sl-dark-dim: `#A0A0A0`",
      "--sl-accent: `#FF0000`",
      "--sl-accent-bg: `rgba(255,0,0,0.1)`",
      "--sl-font: `'Lora', serif`",
      "--sl-body-font: `'Inter', sans-serif`",
      "Name: 'revised'",
    ].join('\n');

    vi.stubGlobal('fetch', (_, req: RequestInit) => {
      // Parse the request body to check if it contains the nudge message
      void req;
      return makeReasoningStream(reasoning);
    });
    // After extraction, second call is needed for summary
    let calls = 0;
    vi.stubGlobal('fetch', () => {
      calls++;
      return calls === 1 ? makeReasoningStream(reasoning) : makeFetchOk('Done.');
    });

    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const events = await collectEvents(runOllamaStream('deck-1', 'user-1', "Lav tema 'revised'", 'model'));

    const startEv = events.find((e) => e.type === 'tool_start' && e.tool === 'create_theme');
    expect(startEv?.input?.tokens?.['--sl-bg']).toBe('#FFFBF7'); // revised value, not #000000
    expect(startEv?.input?.tokens?.['--sl-accent']).toBe('#FF0000');
  });

  it('falls back to nudge when reasoning has fewer than 14 tokens (no extraction)', async () => {
    const partialReasoning = "Thinking... --sl-bg: `#fff` --sl-accent: `#f00`"; // only 2 tokens

    let callCount = 0;
    vi.stubGlobal('fetch', () => {
      callCount++;
      return callCount === 1 ? makeReasoningStream(partialReasoning) : makeFetchOk('Need more info.');
    });

    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const events = await collectEvents(runOllamaStream('deck-1', 'user-1', 'Make a theme', 'model'));

    expect(events.some((e) => e.type === 'tool_start' && e.tool === 'create_theme')).toBe(false);
    expect(callCount).toBe(2); // nudge caused a second call
    expect(events.at(-1)?.type).toBe('done');
  });

  it('detects --sl-* in text content (not reasoning) and sends a planning nudge', async () => {
    // Model writes token values as prose text instead of calling the tool
    const textWithTokens = [
      "I will plan the tokens for the new theme and then call create_theme immediately.",
      "--sl-bg: #FFFBF7 means the background color.",
      "--sl-accent: #FF4D6D is the primary accent and will look great.",
      "--sl-font: 'Playfair Display' for the heading serif.",
      "All other tokens will use sensible defaults from the palette above.",
    ].join('\n');

    let callCount = 0;
    vi.stubGlobal('fetch', () => {
      callCount++;
      return callCount === 1 ? makeFetchOk(textWithTokens) : makeFetchOk('Done.');
    });

    const { runOllamaStream } = await import('../src/lib/server/agent/ollama-runner.ts');
    const events = await collectEvents(runOllamaStream('deck-1', 'user-1', 'Make a theme', 'model'));

    // looksLikePlan matched --sl-* → nudge → second fetch
    expect(callCount).toBe(2);
    // No tool was extracted (text had --sl-* but not via reasoning path)
    expect(events.some((e) => e.type === 'tool_start' && e.tool === 'create_theme')).toBe(false);
    expect(events.at(-1)?.type).toBe('done');
  });
});
