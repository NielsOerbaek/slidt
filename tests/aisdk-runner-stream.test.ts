import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return { ...actual, eq: vi.fn(() => ({})), asc: vi.fn(() => ({})), or: vi.fn(() => ({})), and: vi.fn(() => ({})) };
});

const DECK = { id: 'deck-1', title: 'Test Deck', themeId: null, slideOrder: [] };
function chain(val: unknown): unknown {
  const obj: Record<string, unknown> = {
    then(f: (v: unknown) => unknown) { return Promise.resolve(val).then(f); },
    catch(f: (e: unknown) => unknown) { return Promise.resolve(val).catch(f); },
    finally(f: () => void) { return Promise.resolve(val).finally(f); },
  };
  for (const m of ['from', 'where', 'limit', 'orderBy', 'set', 'values', 'returning']) {
    obj[m] = () => chain(Array.isArray(val) && val.length > 0 ? val : []);
  }
  return obj;
}

const mockValues = vi.fn().mockResolvedValue([]);
const mockInsert = vi.fn(() => ({ values: mockValues }));

vi.mock('$lib/server/db/index.ts', () => ({
  db: { select: vi.fn(() => chain([DECK])), insert: mockInsert },
  agentMessages: {},
  decks: {},
  themes: {},
  slideTypes: {},
}));

vi.mock('$lib/server/agent/build-system-prompt.ts', () => ({
  buildSystemPrompt: vi.fn().mockResolvedValue('You are a test assistant.'),
}));

vi.mock('$lib/server/agent/aisdk-tools.ts', () => ({
  buildAiSdkTools: vi.fn().mockReturnValue({}),
}));

const mockStreamText = vi.fn();
vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return { ...actual, streamText: mockStreamText, stepCountIs: vi.fn(() => () => false) };
});

const mockAnthropicModel = { specificationVersion: 'v3', provider: 'anthropic', modelId: 'claude-sonnet-4-6' };
vi.mock('@ai-sdk/anthropic', () => ({ anthropic: vi.fn(() => mockAnthropicModel) }));

const mockOllamaInstance = vi.fn(() => ({ specificationVersion: 'v3', provider: 'ollama', modelId: 'gemma4:12b-q4' }));
const mockCreateOllama = vi.fn(() => mockOllamaInstance);
vi.mock('ai-sdk-ollama', () => ({ createOllama: mockCreateOllama }));

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Collect all SSE events from the runner's ReadableStream */
async function collectEvents(stream: ReadableStream<Uint8Array>): Promise<Array<Record<string, unknown>>> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const events: Array<Record<string, unknown>> = [];
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() ?? '';
    for (const part of parts) {
      if (part.startsWith('data: ')) {
        events.push(JSON.parse(part.slice(6)) as Record<string, unknown>);
      }
    }
  }
  return events;
}

type FakeEvent = Record<string, unknown> & { type: string };

/**
 * Set up mockStreamText to emit a predetermined sequence of fullStream events.
 * Optionally calls onStepFinish with a minimal step before the finish event,
 * so rawContent gets written to DB.
 */
function setupStream(
  events: FakeEvent[],
  stepOverride?: Partial<{ text: string; reasoning: unknown[]; toolCalls: unknown[]; toolResults: unknown[] }>,
) {
  mockStreamText.mockImplementationOnce((opts: Record<string, unknown>) => {
    const fullStream = (async function* () {
      for (const event of events) {
        if (event.type === 'finish' && opts['onStepFinish']) {
          // Call onStepFinish before finish so accumulatedSteps is populated
          const step = {
            stepNumber: 0, text: stepOverride?.text ?? '',
            reasoning: stepOverride?.reasoning ?? [],
            toolCalls: stepOverride?.toolCalls ?? [],
            toolResults: stepOverride?.toolResults ?? [],
            finishReason: 'stop',
          };
          await (opts['onStepFinish'] as (s: unknown) => Promise<void>)(step);
        }
        yield event;
      }
    })();
    return { fullStream };
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockValues.mockResolvedValue([]);
  mockInsert.mockImplementation(() => ({ values: mockValues }));
});

describe('runAiSdkStream — SSE event mapping', () => {
  it('emits text event for text-delta and done on finish', async () => {
    setupStream([
      { type: 'text-delta', text: 'Hello world', id: 'td-1' },
      { type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} },
    ], { text: 'Hello world' });

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    const events = await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hi', 'claude-sonnet-4-6', true));

    expect(events).toContainEqual({ type: 'text', delta: 'Hello world' });
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('emits thinking event for reasoning-delta', async () => {
    setupStream([
      { type: 'reasoning-delta', text: 'Let me think...', id: 'rd-1' },
      { type: 'text-delta', text: 'Done.', id: 'td-1' },
      { type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} },
    ]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    const events = await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Think about this', 'claude-sonnet-4-6', true));

    expect(events).toContainEqual({ type: 'thinking', delta: 'Let me think...' });
    expect(events).toContainEqual({ type: 'text', delta: 'Done.' });
  });

  it('emits tool_start and tool_done for a tool call/result pair', async () => {
    const toolOutput = { result: '[{"id":"slide-1"}]', undoPatch: undefined };
    setupStream([
      {
        type: 'tool-call',
        toolCallId: 'tc-1',
        toolName: 'list_slides',
        input: {},
      },
      {
        type: 'tool-result',
        toolCallId: 'tc-1',
        toolName: 'list_slides',
        input: {},
        output: toolOutput,
      },
      { type: 'text-delta', text: 'Here are your slides.', id: 'td-1' },
      { type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} },
    ]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    const events = await collectEvents(runAiSdkStream('deck-1', 'user-1', 'List slides', 'claude-sonnet-4-6', true));

    expect(events).toContainEqual({
      type: 'tool_start',
      tool: 'list_slides',
      toolUseId: 'tc-1',
      input: {},
    });
    expect(events).toContainEqual({
      type: 'tool_done',
      tool: 'list_slides',
      toolUseId: 'tc-1',
      result: '[{"id":"slide-1"}]',
    });
  });

  it('includes undoPatch in tool_done when present', async () => {
    const undoPatch = { id: 'slide-1', patch: { title: 'Old Title' } };
    setupStream([
      { type: 'tool-call', toolCallId: 'tc-2', toolName: 'patch_slide', input: { id: 'slide-1', patch: { title: 'New' } } },
      {
        type: 'tool-result',
        toolCallId: 'tc-2',
        toolName: 'patch_slide',
        input: {},
        output: { result: 'ok', undoPatch },
      },
      { type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} },
    ]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    const events = await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Patch slide', 'claude-sonnet-4-6', true));

    const done = events.find((e) => e.type === 'tool_done') as Record<string, unknown> | undefined;
    expect(done?.undoPatch).toEqual(undoPatch);
  });

  it('emits error event when streamText throws', async () => {
    mockStreamText.mockImplementationOnce(() => {
      throw new Error('Model unavailable');
    });

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    const events = await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hi', 'claude-sonnet-4-6', true));

    expect(events).toContainEqual({ type: 'error', message: 'Model unavailable' });
  });

  it('emits error event when fullStream yields an error event', async () => {
    setupStream([
      { type: 'error', error: new Error('Rate limited') },
    ]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    const events = await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hi', 'claude-sonnet-4-6', true));

    expect(events).toContainEqual({ type: 'error', message: 'Rate limited' });
  });
});

describe('runAiSdkStream — DB persistence', () => {
  it('inserts user message and assistant message to DB', async () => {
    setupStream([
      { type: 'text-delta', text: 'Response', id: 'td-1' },
      { type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} },
    ], { text: 'Response' });

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hello', 'claude-sonnet-4-6', true));

    expect(mockValues).toHaveBeenCalledTimes(2);
    // First insert: user message
    const firstCall = mockValues.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(firstCall).toMatchObject({ role: 'user', content: 'Hello', deckId: 'deck-1' });
    // Second insert: assistant message
    const secondCall = mockValues.mock.calls[1]?.[0] as Record<string, unknown>;
    expect(secondCall).toMatchObject({ role: 'assistant', deckId: 'deck-1' });
  });

  it('stores finalText from accumulated steps', async () => {
    setupStream([
      { type: 'text-delta', text: 'Done!', id: 'td-1' },
      { type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} },
    ], { text: 'Done!' });

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Go', 'claude-sonnet-4-6', true));

    const assistantInsert = mockValues.mock.calls[1]?.[0] as Record<string, unknown>;
    expect(assistantInsert?.content).toBe('Done!');
  });

  it('uses "(tool calls only)" as content when no text was produced', async () => {
    setupStream([
      { type: 'tool-call', toolCallId: 'tc-1', toolName: 'list_slides', input: {} },
      { type: 'tool-result', toolCallId: 'tc-1', toolName: 'list_slides', input: {}, output: { result: '[]' } },
      { type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} },
    ]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    await collectEvents(runAiSdkStream('deck-1', 'user-1', 'List', 'claude-sonnet-4-6', true));

    const assistantInsert = mockValues.mock.calls[1]?.[0] as Record<string, unknown>;
    expect(assistantInsert?.content).toBe('(tool calls only)');
  });
});

describe('runAiSdkStream — model selection', () => {
  it('uses @ai-sdk/anthropic when useAnthropic=true', async () => {
    setupStream([{ type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} }]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hi', 'claude-sonnet-4-6', true));

    const { anthropic } = await import('@ai-sdk/anthropic');
    expect(anthropic).toHaveBeenCalledWith('claude-sonnet-4-6');
    expect(mockCreateOllama).not.toHaveBeenCalled();
  });

  it('uses ai-sdk-ollama with think:true and keep_alive:-1 when useAnthropic=false', async () => {
    setupStream([{ type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} }]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hi', 'gemma4:12b-q4_K_M', false));

    expect(mockCreateOllama).toHaveBeenCalled();
    expect(mockOllamaInstance).toHaveBeenCalledWith(
      'gemma4:12b-q4_K_M',
      expect.objectContaining({ think: true, keep_alive: -1 }),
    );
  });

  it('passes Anthropic thinking providerOptions, not Ollama', async () => {
    setupStream([{ type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} }]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hi', 'claude-sonnet-4-6', true));

    const callOpts = mockStreamText.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callOpts?.providerOptions).toMatchObject({
      anthropic: { thinking: { type: 'adaptive' } },
    });
  });

  it('passes empty providerOptions for Ollama (settings are on model instance)', async () => {
    setupStream([{ type: 'finish', finishReason: 'stop', rawFinishReason: 'stop', totalUsage: {} }]);

    const { runAiSdkStream } = await import('../src/lib/server/agent/aisdk-runner.ts');
    await collectEvents(runAiSdkStream('deck-1', 'user-1', 'Hi', 'gemma4:12b-q4_K_M', false));

    const callOpts = mockStreamText.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callOpts?.providerOptions).toEqual({});
  });
});
