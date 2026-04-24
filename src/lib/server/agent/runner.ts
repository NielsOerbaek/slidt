import Anthropic from '@anthropic-ai/sdk';
import { db, agentMessages, decks, themes, slideTypes } from '$lib/server/db/index.ts';
import { eq, asc, or, and } from 'drizzle-orm';
import { executeTool, AGENT_TOOLS } from '$lib/server/agent/tools.ts';

const client = new Anthropic();

const BASE_SYSTEM_PROMPT = `You are a slide deck assistant for Os & Data, a Danish cooperative association. \
You help users edit presentations using the available tools.

Guidelines:
- Keep all content in Danish unless the user explicitly asks otherwise
- When using create_slide_type, only use these Handlebars helpers: fmt, eq, default, each, if, unless
- CSS in templates must not contain @import, external url(), expression(), or behavior:
- After using tools, briefly describe what you changed
- Be concise — let the tools do the work

Template rules (IMPORTANT — violations cause "[object Object]" in output):
- {{fmt value}} only works on STRING fields. Never pass an object or array to fmt.
- For list fields (type: "list"), iterate with {{#each items}}...{{/each}} and access string properties inside: {{fmt this.propertyName}}
- For group fields (type: "group"), access each sub-field directly: {{fmt field.subField}}
- Always call list_slide_types before add_slide to check the exact field names and types for that slide type
- When add_slide data must contain a list field, pass an array of strings or objects matching the field schema — never a plain string`;

type SseEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_start'; tool: string; toolUseId: string; input: unknown }
  | { type: 'tool_done'; tool: string; toolUseId: string; result: string; undoPatch?: unknown }
  | { type: 'done' }
  | { type: 'error'; message: string };

export function runAgentStream(
  deckId: string,
  userId: string,
  userMessage: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      function emit(event: SseEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // Save user message to DB
        await db.insert(agentMessages).values({ deckId, role: 'user', content: userMessage });

        // Load deck context for system prompt
        const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
        let themeInfo = '';
        if (deck?.themeId) {
          const [theme] = await db
            .select()
            .from(themes)
            .where(eq(themes.id, deck.themeId))
            .limit(1);
          if (theme) {
            themeInfo = `\nCurrent theme: ${theme.name}\nTheme tokens: ${JSON.stringify(theme.tokens)}`;
          }
        }
        const allTypes = await db
          .select({ name: slideTypes.name, label: slideTypes.label })
          .from(slideTypes)
          .where(
            or(
              eq(slideTypes.scope, 'global'),
              and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)),
            ),
          );
        const typeList = allTypes.map((t) => `${t.name}: ${t.label}`).join('\n');
        const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nDeck: "${deck?.title ?? deckId}"${themeInfo}\n\nAvailable slide types:\n${typeList}`;

        // Load recent conversation history (last 20 messages)
        const history = await db
          .select()
          .from(agentMessages)
          .where(eq(agentMessages.deckId, deckId))
          .orderBy(asc(agentMessages.createdAt))
          .limit(20);

        const messages: Array<{ role: 'user' | 'assistant'; content: string }> = history.map(
          (msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content }),
        );

        // Agentic loop — repeat until end_turn or max iterations
        let iterCount = 0;
        const MAX_ITERATIONS = 10;
        let finalText = '';
        const allToolCallsThisSession: unknown[] = [];

        // Multi-turn messages (includes tool_use + tool_result blocks for this session)
        const sessionMessages: Anthropic.MessageParam[] = [...messages];

        while (iterCount < MAX_ITERATIONS) {
          iterCount++;

          const stream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: systemPrompt,
            tools: AGENT_TOOLS as Anthropic.Tool[],
            messages: sessionMessages,
          });

          stream.on('text', (delta: string) => {
            if (delta) {
              finalText += delta;
              emit({ type: 'text', delta });
            }
          });

          const finalMessage = await stream.finalMessage();

          const toolUseBlocks = finalMessage.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
          );

          if (finalMessage.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) {
            break;
          }

          // Execute tool calls and collect results
          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const toolUse of toolUseBlocks) {
            emit({
              type: 'tool_start',
              tool: toolUse.name,
              toolUseId: toolUse.id,
              input: toolUse.input,
            });
            try {
              const { result, undoPatch } = await executeTool(
                deckId,
                toolUse.name,
                toolUse.input as Record<string, unknown>,
              );
              emit({
                type: 'tool_done',
                tool: toolUse.name,
                toolUseId: toolUse.id,
                result,
                undoPatch,
              });
              allToolCallsThisSession.push({
                name: toolUse.name,
                input: toolUse.input,
                result,
                undoPatch,
              });
              toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: result });
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : String(err);
              emit({
                type: 'tool_done',
                tool: toolUse.name,
                toolUseId: toolUse.id,
                result: `error: ${errMsg}`,
              });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `error: ${errMsg}`,
                is_error: true,
              });
            }
          }

          // Extend session messages with assistant response + tool results
          sessionMessages.push({ role: 'assistant', content: finalMessage.content });
          sessionMessages.push({ role: 'user', content: toolResults });
          finalText = ''; // reset for next iteration's text
        }

        // Save final assistant message
        await db.insert(agentMessages).values({
          deckId,
          role: 'assistant',
          content: finalText || '(tool calls only)',
          toolCalls: allToolCallsThisSession.length > 0 ? allToolCallsThisSession : null,
        });

        emit({ type: 'done' });
      } catch (err) {
        emit({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
      } finally {
        controller.close();
      }
    },
  });
}
