import { db, agentMessages, decks, themes, slideTypes } from '$lib/server/db/index.ts';
import { eq, asc, or, and } from 'drizzle-orm';
import { executeTool, AGENT_TOOLS } from '$lib/server/agent/tools.ts';
import { BASE_SYSTEM_PROMPT } from '$lib/server/agent/runner.ts';

type SseEvent =
  | { type: 'thinking'; delta: string }
  | { type: 'text'; delta: string }
  | { type: 'tool_start'; tool: string; toolUseId: string; input: unknown }
  | { type: 'tool_done'; tool: string; toolUseId: string; result: string; undoPatch?: unknown; image?: { base64: string; mediaType: string } }
  | { type: 'done' }
  | { type: 'error'; message: string };

type OllamaMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: OllamaToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

interface OllamaToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

/** Convert AGENT_TOOLS (Anthropic format) → OpenAI function tool array */
function toOpenAITools() {
  return AGENT_TOOLS.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }));
}

export function runOllamaStream(
  deckId: string,
  userId: string,
  userMessage: string,
  modelTag: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? '';
  const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY ?? '';

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      function emit(event: SseEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // Persist user message
        await db.insert(agentMessages).values({ deckId, role: 'user', content: userMessage });

        // Build system prompt (same logic as runner.ts)
        const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
        let themeInfo = '';
        let themeSystemPrompt = '';
        if (deck?.themeId) {
          const [theme] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
          if (theme) {
            themeInfo = `\nCurrent theme: ${theme.name}\nTheme tokens: ${JSON.stringify(theme.tokens)}`;
            if (theme.systemPrompt) {
              themeSystemPrompt = `\n\nTheme guidelines (${theme.name}):\n${theme.systemPrompt}`;
            }
          }
        }
        const allTypes = await db
          .select({ name: slideTypes.name, label: slideTypes.label })
          .from(slideTypes)
          .where(or(
            eq(slideTypes.scope, 'global'),
            and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)),
          ));
        const typeList = allTypes.map((t) => `${t.name}: ${t.label}`).join('\n');
        const systemPrompt = `${BASE_SYSTEM_PROMPT}${themeSystemPrompt}\n\nDeck: "${deck?.title ?? deckId}"${themeInfo}\n\nAvailable slide types:\n${typeList}`;

        // Load plain-text history (skip rawContent — Anthropic format incompatible with OpenAI)
        const history = await db
          .select()
          .from(agentMessages)
          .where(eq(agentMessages.deckId, deckId))
          .orderBy(asc(agentMessages.createdAt))
          .limit(40);

        const sessionMessages: OllamaMessage[] = history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        const historyLength = sessionMessages.length;
        let iterCount = 0;
        const MAX_ITERATIONS = 25;
        let finalText = '';
        const allToolCallsThisSession: unknown[] = [];

        while (iterCount < MAX_ITERATIONS) {
          iterCount++;

          const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
            },
            body: JSON.stringify({
              model: modelTag,
              messages: [{ role: 'system', content: systemPrompt }, ...sessionMessages],
              tools: toOpenAITools(),
              stream: true,
            }),
          });

          if (!response.ok || !response.body) {
            const errText = await response.text().catch(() => '');
            // Don't leak raw HTML (e.g. 504 Gateway Time-out pages) to the user
            const msg = errText.includes('<') || !errText
              ? `Ollama returned HTTP ${response.status}${response.status === 504 ? ' (gateway timeout — model may be loading or too slow)' : ''}`
              : `Ollama error: ${errText}`;
            throw new Error(msg);
          }

          // Parse streaming SSE from Ollama
          const reader = response.body.getReader();
          const dec = new TextDecoder();
          let buf = '';
          let assistantContent = '';
          const pendingToolCalls: OllamaToolCall[] = [];
          let finishReason: string | null = null;

          outer: while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (payload === '[DONE]') break outer;
              let chunk: {
                choices: Array<{
                  delta: {
                    reasoning?: string | null;
                    content?: string | null;
                    tool_calls?: Array<{
                      index: number;
                      id?: string;
                      function?: { name?: string; arguments?: string };
                    }>;
                  };
                  finish_reason?: string | null;
                }>;
              };
              try { chunk = JSON.parse(payload); } catch { continue; }
              const choice = chunk.choices?.[0];
              if (!choice) continue;
              if (choice.finish_reason) finishReason = choice.finish_reason;
              const delta = choice.delta;
              if (delta.reasoning) {
                emit({ type: 'thinking', delta: delta.reasoning });
              }
              if (delta.content) {
                assistantContent += delta.content;
                emit({ type: 'text', delta: delta.content });
              }
              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (!pendingToolCalls[tc.index]) {
                    pendingToolCalls[tc.index] = {
                      id: tc.id ?? '',
                      type: 'function',
                      function: { name: tc.function?.name ?? '', arguments: '' },
                    };
                  }
                  const pending = pendingToolCalls[tc.index]!;
                  if (tc.id) pending.id = tc.id;
                  if (tc.function?.name) pending.function.name = tc.function.name;
                  if (tc.function?.arguments) pending.function.arguments += tc.function.arguments;
                }
              }
            }
          }

          finalText = assistantContent;

          if (finishReason !== 'tool_calls' || pendingToolCalls.length === 0) {
            sessionMessages.push({ role: 'assistant', content: assistantContent });
            break;
          }

          // Push assistant message with tool_calls before executing them
          sessionMessages.push({
            role: 'assistant',
            content: assistantContent || null,
            tool_calls: pendingToolCalls,
          });

          for (const tc of pendingToolCalls) {
            let toolInput: Record<string, unknown>;
            try { toolInput = JSON.parse(tc.function.arguments); } catch { toolInput = {}; }

            emit({ type: 'tool_start', tool: tc.function.name, toolUseId: tc.id, input: toolInput });

            try {
              const { result, undoPatch, image } = await executeTool(deckId, tc.function.name, toolInput, userId);
              emit({
                type: 'tool_done',
                tool: tc.function.name,
                toolUseId: tc.id,
                result,
                undoPatch,
                ...(image ? { image: { base64: image.base64, mediaType: image.mediaType } } : {}),
              });
              allToolCallsThisSession.push({ name: tc.function.name, input: toolInput, result, undoPatch });
              sessionMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : String(err);
              emit({ type: 'tool_done', tool: tc.function.name, toolUseId: tc.id, result: `error: ${errMsg}` });
              sessionMessages.push({ role: 'tool', tool_call_id: tc.id, content: `error: ${errMsg}` });
            }
          }
        }

        // Persist exchange (OpenAI-format rawContent — incompatible with Claude sessions)
        const exchangeMessages = sessionMessages.slice(historyLength);
        const rawContent = exchangeMessages.map((msg) => ({ role: msg.role, content: 'content' in msg ? msg.content : null }));

        await db.insert(agentMessages).values({
          deckId,
          role: 'assistant',
          content: finalText || '(tool calls only)',
          toolCalls: allToolCallsThisSession.length > 0 ? allToolCallsThisSession : null,
          rawContent: rawContent.length > 0 ? rawContent : null,
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
