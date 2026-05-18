import type { ModelMessage } from 'ai';

/**
 * Anthropic-format rawContent block shapes stored by runner.ts / aisdk-runner.ts.
 */
type AnthropicBlock =
  | { type: 'text'; text: string }
  | { type: 'thinking'; thinking: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; content: unknown };

type AnthropicRawRow = { role: string; content: unknown };

/**
 * Converts stored Anthropic-format rawContent rows back to AI SDK ModelMessage[]
 * for the `messages` array passed to streamText.
 *
 * Limitation: Anthropic tool_result blocks don't store toolName. We use ''
 * for toolName in ToolModelMessage entries — acceptable since the SDK uses
 * history only for context, not tool dispatch.
 */
export function anthropicRawToAiSdkMessages(rawRows: AnthropicRawRow[]): ModelMessage[] {
  const messages: ModelMessage[] = [];

  for (const row of rawRows) {
    if (row.role !== 'assistant' && row.role !== 'user') continue;

    const content = row.content;

    if (row.role === 'assistant') {
      if (typeof content === 'string') {
        messages.push({ role: 'assistant', content });
        continue;
      }
      if (!Array.isArray(content)) continue;

      const blocks = content as AnthropicBlock[];
      const assistantContent: Array<
        | { type: 'text'; text: string }
        | { type: 'reasoning'; text: string }
        | { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown }
      > = [];

      for (const block of blocks) {
        if (block.type === 'text') {
          assistantContent.push({ type: 'text', text: block.text });
        } else if (block.type === 'thinking') {
          assistantContent.push({ type: 'reasoning', text: block.thinking });
        } else if (block.type === 'tool_use') {
          assistantContent.push({
            type: 'tool-call',
            toolCallId: block.id,
            toolName: block.name,
            input: block.input,
          });
        }
        // tool_result blocks in assistant role are unexpected — skip
      }

      if (assistantContent.length > 0) {
        messages.push({ role: 'assistant', content: assistantContent } as ModelMessage);
      }
    } else if (row.role === 'user') {
      if (typeof content === 'string') {
        messages.push({ role: 'user', content });
        continue;
      }
      if (!Array.isArray(content)) continue;

      const blocks = content as AnthropicBlock[];
      const toolResults: Array<{
        type: 'tool-result';
        toolCallId: string;
        toolName: string;
        output: unknown;
      }> = [];
      let hasToolResults = false;

      for (const block of blocks) {
        if (block.type === 'tool_result') {
          hasToolResults = true;
          const resultContent = block.content;
          // Flatten content to a string if it's an array (strip images already done at write time)
          let output: unknown;
          if (typeof resultContent === 'string') {
            output = resultContent;
          } else if (Array.isArray(resultContent)) {
            const texts = (resultContent as Array<{ type: string; text?: string }>)
              .filter((c) => c.type === 'text')
              .map((c) => c.text ?? '')
              .join('');
            output = texts;
          } else {
            output = String(resultContent ?? '');
          }
          toolResults.push({
            type: 'tool-result',
            toolCallId: block.tool_use_id,
            toolName: '', // not stored — acceptable for history context
            output,
          });
        }
      }

      if (hasToolResults) {
        messages.push({ role: 'tool', content: toolResults } as ModelMessage);
      } else if (typeof content === 'string') {
        messages.push({ role: 'user', content });
      }
    }
  }

  return messages;
}
