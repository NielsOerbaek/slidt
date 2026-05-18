import type { StepResult, ToolSet } from 'ai';
import type { ToolResult } from '$lib/server/agent/tools.ts';

/** Strip base64 image data from Anthropic-format content blocks to keep DB lean. */
export function stripImages(content: unknown): unknown {
  if (!Array.isArray(content)) return content;
  return content.map((block: unknown) => {
    if (!block || typeof block !== 'object') return block;
    const b = block as Record<string, unknown>;
    if (b.type === 'tool_result' && Array.isArray(b.content)) {
      return {
        ...b,
        content: (b.content as unknown[]).filter(
          (c: unknown) => !(c && typeof c === 'object' && (c as Record<string, unknown>).type === 'image'),
        ),
      };
    }
    if (b.type === 'image') {
      return { type: 'text', text: '[image omitted]' };
    }
    return block;
  });
}

/**
 * Converts AI SDK StepResult[] to Anthropic-format rawContent rows so that
 * the drawer's projectEntry() can parse past AI SDK runs identically to
 * runs produced by runner.ts.
 *
 * Produces pairs of:
 *   { role: 'assistant', content: [text | thinking | tool_use blocks] }
 *   { role: 'user',      content: [tool_result blocks] }   ← only when tools were called
 */
export function buildAnthropicRawContent(
  steps: ReadonlyArray<StepResult<ToolSet>>,
): Array<{ role: string; content: unknown }> {
  const messages: Array<{ role: string; content: unknown }> = [];

  for (const step of steps) {
    const assistantBlocks: unknown[] = [];

    // Reasoning blocks
    for (const r of step.reasoning) {
      assistantBlocks.push({ type: 'thinking', thinking: r.text });
    }

    // Text block
    if (step.text) {
      assistantBlocks.push({ type: 'text', text: step.text });
    }

    // Tool call blocks
    for (const tc of step.toolCalls) {
      assistantBlocks.push({
        type: 'tool_use',
        id: tc.toolCallId,
        name: tc.toolName,
        input: tc.input,
      });
    }

    if (assistantBlocks.length > 0) {
      messages.push({
        role: 'assistant',
        content: stripImages(assistantBlocks),
      });
    }

    // Tool result blocks (in a user message)
    if (step.toolResults.length > 0) {
      const resultBlocks: unknown[] = [];
      for (const tr of step.toolResults) {
        const output = tr.output as ToolResult;
        const content: unknown = output.image
          ? [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: output.image.mediaType,
                  data: output.image.base64,
                },
              },
              { type: 'text', text: output.result },
            ]
          : output.result;
        resultBlocks.push({
          type: 'tool_result',
          tool_use_id: tr.toolCallId,
          content,
        });
      }
      messages.push({
        role: 'user',
        content: stripImages(resultBlocks),
      });
    }
  }

  return messages;
}

/**
 * Build the toolCalls JSONB column value from steps — same shape as runner.ts.
 */
export function buildToolCallsLog(
  steps: ReadonlyArray<StepResult<ToolSet>>,
): unknown[] {
  const log: unknown[] = [];
  for (const step of steps) {
    for (const tc of step.toolCalls) {
      // Find the matching tool result by toolCallId
      const tr = step.toolResults.find((r) => r.toolCallId === tc.toolCallId);
      const output = tr ? (tr.output as ToolResult) : undefined;
      log.push({
        name: tc.toolName,
        input: tc.input,
        result: output?.result ?? '',
        undoPatch: output?.undoPatch,
      });
    }
  }
  return log;
}
