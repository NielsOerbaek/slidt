import { tool, jsonSchema, type ToolSet } from 'ai';
import { executeTool, AGENT_TOOLS } from '$lib/server/agent/tools.ts';

/**
 * Convert AGENT_TOOLS (Anthropic format) → AI SDK tool() definitions.
 * Each tool's execute wraps executeTool() and returns the full ToolResult
 * so undoPatch and image thread through to the SSE events.
 */
export function buildAiSdkTools(deckId: string, userId: string): ToolSet {
  const result: ToolSet = {};
  for (const t of AGENT_TOOLS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result[t.name] = tool<any, any>({
      description: t.description,
      inputSchema: jsonSchema(t.input_schema),
      execute: (input: Record<string, unknown>) => executeTool(deckId, t.name, input, userId),
    });
  }
  return result;
}
