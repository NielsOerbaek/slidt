import { describe, it, expect } from 'vitest';
import { buildAnthropicRawContent, buildToolCallsLog, stripImages } from '../src/lib/server/agent/persist-aisdk.ts';
import { anthropicRawToAiSdkMessages } from '../src/lib/server/agent/load-history-aisdk.ts';
import type { StepResult, ToolSet } from 'ai';

/** Minimal StepResult builder for tests */
function makeStep(
  overrides: Partial<StepResult<ToolSet>> = {},
): StepResult<ToolSet> {
  return {
    stepNumber: 0,
    model: { provider: 'test', modelId: 'test-model' },
    functionId: undefined,
    metadata: undefined,
    experimental_context: undefined,
    content: [],
    text: '',
    reasoning: [],
    reasoningText: undefined,
    files: [],
    sources: [],
    toolCalls: [],
    staticToolCalls: [],
    dynamicToolCalls: [],
    toolResults: [],
    staticToolResults: [],
    dynamicToolResults: [],
    finishReason: 'stop',
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    warnings: [],
    request: { body: undefined },
    response: {
      id: 'resp-1',
      timestamp: new Date(),
      modelId: 'test-model',
      headers: undefined,
      body: undefined,
    },
    providerMetadata: {},
    logprobs: undefined,
    isContinued: false,
    ...overrides,
  } as unknown as StepResult<ToolSet>;
}

// ────────────────────────────────────────────────────────────────────────────
// stripImages
// ────────────────────────────────────────────────────────────────────────────
describe('stripImages', () => {
  it('removes image blocks from assistant content', () => {
    const input = [
      { type: 'text', text: 'hello' },
      { type: 'image', source: { type: 'base64', data: 'abc' } },
    ];
    const output = stripImages(input) as typeof input;
    expect(output).toHaveLength(2);
    expect(output[0]).toEqual({ type: 'text', text: 'hello' });
    expect((output[1]! as { type: string; text: string }).text).toBe('[image omitted]');
  });

  it('removes image items from tool_result content arrays', () => {
    const input = [
      {
        type: 'tool_result',
        tool_use_id: 'tu-1',
        content: [
          { type: 'image', source: { type: 'base64', data: 'xyz' } },
          { type: 'text', text: 'result text' },
        ],
      },
    ];
    const output = stripImages(input) as typeof input;
    expect(output[0]!.content).toHaveLength(1);
    expect((output[0]!.content as Array<{ type: string }>)[0]!.type).toBe('text');
  });

  it('returns non-array values unchanged', () => {
    expect(stripImages('hello')).toBe('hello');
    expect(stripImages(null)).toBe(null);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildAnthropicRawContent
// ────────────────────────────────────────────────────────────────────────────
describe('buildAnthropicRawContent', () => {
  it('converts a text-only step to a single assistant message', () => {
    const steps = [makeStep({ text: 'Hello world', toolCalls: [], toolResults: [] })];
    const result = buildAnthropicRawContent(steps);
    expect(result).toHaveLength(1);
    expect(result[0]!.role).toBe('assistant');
    const content = result[0]!.content as Array<{ type: string; text?: string }>;
    expect(content).toContainEqual({ type: 'text', text: 'Hello world' });
  });

  it('converts reasoning to thinking blocks', () => {
    const steps = [
      makeStep({
        reasoning: [{ type: 'reasoning', text: 'I think this' }],
        text: '',
        toolCalls: [],
        toolResults: [],
      }),
    ];
    const result = buildAnthropicRawContent(steps);
    expect(result[0]!.role).toBe('assistant');
    const content = result[0]!.content as Array<{ type: string; thinking?: string }>;
    expect(content).toContainEqual({ type: 'thinking', thinking: 'I think this' });
  });

  it('converts tool call + result into assistant tool_use and user tool_result blocks', () => {
    const toolCall = {
      type: 'tool-call' as const,
      toolCallId: 'tc-1',
      toolName: 'list_slides',
      input: {},
    };
    const toolResult = {
      type: 'tool-result' as const,
      toolCallId: 'tc-1',
      toolName: 'list_slides',
      input: {},
      output: { result: '[]', undoPatch: undefined },
    };

    const steps = [
      makeStep({
        text: '',
        toolCalls: [toolCall] as StepResult<ToolSet>['toolCalls'],
        toolResults: [toolResult] as StepResult<ToolSet>['toolResults'],
      }),
    ];

    const result = buildAnthropicRawContent(steps);
    // One assistant message (tool_use block) + one user message (tool_result block)
    expect(result).toHaveLength(2);

    const assistantBlocks = result[0]!.content as Array<{ type: string; id?: string; name?: string }>;
    expect(result[0]!.role).toBe('assistant');
    expect(assistantBlocks).toContainEqual({
      type: 'tool_use',
      id: 'tc-1',
      name: 'list_slides',
      input: {},
    });

    const userBlocks = result[1]!.content as Array<{ type: string; tool_use_id?: string; content?: unknown }>;
    expect(result[1]!.role).toBe('user');
    expect(userBlocks[0]!.type).toBe('tool_result');
    expect(userBlocks[0]!.tool_use_id).toBe('tc-1');
    expect(userBlocks[0]!.content).toBe('[]');
  });

  it('round-trips: buildAnthropicRawContent + anthropicRawToAiSdkMessages', () => {
    const toolCall = {
      type: 'tool-call' as const,
      toolCallId: 'tc-round',
      toolName: 'get_slide',
      input: { id: 'slide-1' },
    };
    const toolResult = {
      type: 'tool-result' as const,
      toolCallId: 'tc-round',
      toolName: 'get_slide',
      input: { id: 'slide-1' },
      output: { result: '{"id":"slide-1"}', undoPatch: undefined },
    };

    const steps = [
      makeStep({
        reasoning: [{ type: 'reasoning', text: 'checking slide' }],
        text: 'Done',
        toolCalls: [toolCall] as StepResult<ToolSet>['toolCalls'],
        toolResults: [toolResult] as StepResult<ToolSet>['toolResults'],
      }),
    ];

    const rawContent = buildAnthropicRawContent(steps);
    const messages = anthropicRawToAiSdkMessages(rawContent);

    // Should have assistant message and tool message
    expect(messages.some((m) => m.role === 'assistant')).toBe(true);
    expect(messages.some((m) => m.role === 'tool')).toBe(true);

    const assistantMsg = messages.find((m) => m.role === 'assistant')!;
    const content = assistantMsg.content as Array<{ type: string }>;
    // Reasoning/thinking blocks are intentionally stripped from converted
    // history (see anthropicRawToAiSdkMessages) — text and tool-call survive.
    expect(content.some((b) => b.type === 'reasoning')).toBe(false);
    expect(content.some((b) => b.type === 'text')).toBe(true);
    expect(content.some((b) => b.type === 'tool-call')).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildToolCallsLog
// ────────────────────────────────────────────────────────────────────────────
describe('buildToolCallsLog', () => {
  it('extracts tool calls with result and undoPatch', () => {
    const toolCall = {
      type: 'tool-call' as const,
      toolCallId: 'tc-log',
      toolName: 'patch_slide',
      input: { id: 'slide-2', patch: { title: 'New' } },
    };
    const toolResult = {
      type: 'tool-result' as const,
      toolCallId: 'tc-log',
      toolName: 'patch_slide',
      input: { id: 'slide-2', patch: { title: 'New' } },
      output: { result: 'ok', undoPatch: { id: 'slide-2', patch: { title: 'Old' } } },
    };

    const steps = [
      makeStep({
        toolCalls: [toolCall] as StepResult<ToolSet>['toolCalls'],
        toolResults: [toolResult] as StepResult<ToolSet>['toolResults'],
      }),
    ];

    const log = buildToolCallsLog(steps);
    expect(log).toHaveLength(1);
    const entry = log[0] as { name: string; input: unknown; result: string; undoPatch: unknown };
    expect(entry.name).toBe('patch_slide');
    expect(entry.result).toBe('ok');
    expect(entry.undoPatch).toEqual({ id: 'slide-2', patch: { title: 'Old' } });
  });

  it('handles multiple steps with multiple tool calls', () => {
    const makeToolCall = (id: string, name: string) => ({
      type: 'tool-call' as const,
      toolCallId: id,
      toolName: name,
      input: {},
    });
    const makeToolResult = (id: string, name: string) => ({
      type: 'tool-result' as const,
      toolCallId: id,
      toolName: name,
      input: {},
      output: { result: `result-${id}`, undoPatch: undefined },
    });

    const steps = [
      makeStep({
        toolCalls: [makeToolCall('tc-a', 'list_slides')] as StepResult<ToolSet>['toolCalls'],
        toolResults: [makeToolResult('tc-a', 'list_slides')] as StepResult<ToolSet>['toolResults'],
      }),
      makeStep({
        toolCalls: [makeToolCall('tc-b', 'add_slide')] as StepResult<ToolSet>['toolCalls'],
        toolResults: [makeToolResult('tc-b', 'add_slide')] as StepResult<ToolSet>['toolResults'],
      }),
    ];

    const log = buildToolCallsLog(steps);
    expect(log).toHaveLength(2);
    const names = (log as Array<{ name: string }>).map((e) => e.name);
    expect(names).toContain('list_slides');
    expect(names).toContain('add_slide');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// anthropicRawToAiSdkMessages
// ────────────────────────────────────────────────────────────────────────────
describe('anthropicRawToAiSdkMessages', () => {
  it('converts plain text user/assistant rows to ModelMessages', () => {
    const raw = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ];
    const messages = anthropicRawToAiSdkMessages(raw);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ role: 'user', content: 'Hello' });
    expect(messages[1]).toEqual({ role: 'assistant', content: 'Hi there' });
  });

  it('converts structured assistant content with tool calls', () => {
    const raw = [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Let me check' },
          { type: 'tool_use', id: 'tu-x', name: 'list_slides', input: {} },
        ],
      },
    ];
    const messages = anthropicRawToAiSdkMessages(raw);
    expect(messages).toHaveLength(1);
    expect(messages[0]!.role).toBe('assistant');
    const content = messages[0]!.content as Array<{ type: string }>;
    expect(content.find((b) => b.type === 'text')).toBeTruthy();
    expect(content.find((b) => b.type === 'tool-call')).toBeTruthy();
  });

  it('converts tool_result user rows to tool ModelMessages', () => {
    const raw = [
      {
        role: 'user',
        content: [
          { type: 'tool_result', tool_use_id: 'tu-x', content: '[]' },
        ],
      },
    ];
    const messages = anthropicRawToAiSdkMessages(raw);
    expect(messages).toHaveLength(1);
    expect(messages[0]!.role).toBe('tool');
    const content = messages[0]!.content as Array<{ type: string; toolCallId: string; output: unknown }>;
    expect(content[0]!.type).toBe('tool-result');
    expect(content[0]!.toolCallId).toBe('tu-x');
    // AI SDK v6 tool-result output is the typed shape { type: 'text', value }.
    expect(content[0]!.output).toEqual({ type: 'text', value: '[]' });
  });

  it('skips unknown roles', () => {
    const raw = [{ role: 'system', content: 'irrelevant' }];
    const messages = anthropicRawToAiSdkMessages(raw);
    expect(messages).toHaveLength(0);
  });
});
