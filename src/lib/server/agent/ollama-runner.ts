import { db, agentMessages, decks, themes, slideTypes } from '$lib/server/db/index.ts';
import { eq, asc, or, and } from 'drizzle-orm';
import { executeTool, AGENT_TOOLS } from '$lib/server/agent/tools.ts';
import { BASE_SYSTEM_PROMPT } from '$lib/server/agent/runner.ts';
import { type LoopHookState, getPostResponseInjection } from '$lib/server/agent/hooks.ts';

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

const REQUIRED_THEME_TOKENS = [
  '--sl-bg', '--sl-surface', '--sl-fg', '--sl-dim', '--sl-very-dim',
  '--sl-border', '--sl-border-mid', '--sl-dark-bg', '--sl-dark-fg', '--sl-dark-dim',
  '--sl-accent', '--sl-accent-bg', '--sl-font', '--sl-body-font',
] as const;

/**
 * Reasoning models often compute complete create_theme parameters in their
 * thinking block but fail to emit the actual tool call. This function scans
 * the reasoning text for --sl-* token values and a theme name, and returns a
 * ready-to-execute tool input if a full set is found. Returns null otherwise.
 */
function tryExtractCreateTheme(
  reasoning: string,
  messages: OllamaMessage[],
): { name: string; tokens: Record<string, string>; applyToDeck: boolean } | null {
  const tokens: Record<string, string> = {};
  // Handles: `value`, 'value', "value", bare hex #rrggbb, bare rgba(...)
  const pat = /--sl-([\w-]+)\s*[:\s]+(?:`([^`]+)`|'([^'\n]{1,100})'|"([^"\n]{1,100})"|(#[0-9a-fA-F]{3,8}|rgba?\([^)\n]+\)))/g;
  let m: RegExpExecArray | null;
  while ((m = pat.exec(reasoning)) !== null) {
    const key = `--sl-${m[1]}`;
    const value = (m[2] ?? m[3] ?? m[4] ?? m[5] ?? '').trim();
    if ((REQUIRED_THEME_TOKENS as readonly string[]).includes(key) && value) {
      tokens[key] = value; // later occurrences win (model may revise mid-reasoning)
    }
  }
  if (REQUIRED_THEME_TOKENS.some((k) => !tokens[k])) return null;

  // Theme name: prefer the first single/double-quoted word in user messages
  let name: string | null = null;
  for (const msg of [...messages].reverse()) {
    if (msg.role === 'user' && typeof msg.content === 'string') {
      const nm = msg.content.match(/['"]([a-zA-Z0-9_-]{2,40})['"]/);
      if (nm) { name = nm[1] ?? null; break; }
    }
  }
  if (!name) {
    const nm = reasoning.match(/[Nn]ame\s*[:\s]+['"`]([^'"`\n]{2,40})['"`]/);
    if (nm) name = nm[1] ?? null;
  }
  if (!name) return null;

  const allText = messages
    .map((msg) => (typeof msg.content === 'string' ? msg.content : ''))
    .join(' ') + ' ' + reasoning;
  const applyToDeck = /til dette deck|apply.*to.*deck|for (this|the current) deck/i.test(allText);

  return { name, tokens, applyToDeck };
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
        if (!OLLAMA_BASE_URL) throw new Error('OLLAMA_BASE_URL is not configured');

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
        let finalText = '';
        const allToolCallsThisSession: unknown[] = [];
        let iterCount = 0;
        const CONTEXT_WARN_AT = 20;
        const hookState: LoopHookState = { planningNudgeSent: false };

        // eslint-disable-next-line no-constant-condition
        while (true) {
          iterCount++;

          if (iterCount === CONTEXT_WARN_AT) {
            sessionMessages.push({
              role: 'user',
              content: '[System: Context is getting long. Please summarise your progress so far and continue with the remaining work.]',
            });
          }

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
              keep_alive: -1,
            }),
            signal: AbortSignal.timeout(300_000),
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
          let reasoningContent = '';
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
                reasoningContent += delta.reasoning;
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
                      id: tc.id ?? crypto.randomUUID(),
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

          finalText += assistantContent;

          if (finishReason !== 'tool_calls' || pendingToolCalls.length === 0) {
            // Reasoning-only guard: model thought but produced no text and no tool calls.
            // Try to salvage by extracting a create_theme call from the reasoning before
            // falling back to a nudge. Reasoning models consistently compute all token values
            // but fail to emit the function-call structure — extraction bypasses that failure.
            if (!assistantContent && reasoningContent) {
              const extracted = tryExtractCreateTheme(reasoningContent, sessionMessages);
              if (extracted) {
                const toolUseId = crypto.randomUUID();
                emit({ type: 'tool_start', tool: 'create_theme', toolUseId, input: extracted });
                try {
                  const { result, undoPatch } = await executeTool(deckId, 'create_theme', extracted, userId);
                  emit({ type: 'tool_done', tool: 'create_theme', toolUseId, result, undoPatch });
                  allToolCallsThisSession.push({ name: 'create_theme', input: extracted, result, undoPatch });
                  sessionMessages.push({
                    role: 'assistant',
                    content: null,
                    tool_calls: [{ id: toolUseId, type: 'function', function: { name: 'create_theme', arguments: JSON.stringify(extracted) } }],
                  });
                  sessionMessages.push({ role: 'tool', tool_call_id: toolUseId, content: result });
                } catch (err) {
                  const errMsg = err instanceof Error ? err.message : String(err);
                  emit({ type: 'tool_done', tool: 'create_theme', toolUseId, result: `error: ${errMsg}` });
                  sessionMessages.push({
                    role: 'assistant',
                    content: null,
                    tool_calls: [{ id: toolUseId, type: 'function', function: { name: 'create_theme', arguments: JSON.stringify(extracted) } }],
                  });
                  sessionMessages.push({ role: 'tool', tool_call_id: toolUseId, content: `error: ${errMsg}` });
                }
                continue;
              }
            }

            // Empty / reasoning-only with no extractable tool call → nudge once, then exit.
            if (!assistantContent && !hookState.planningNudgeSent) {
              hookState.planningNudgeSent = true;
              const hadReasoning = reasoningContent.length > 0;
              sessionMessages.push({ role: 'assistant', content: hadReasoning ? '[internal reasoning only]' : '...' });
              sessionMessages.push({
                role: 'user',
                content: hadReasoning
                  ? '[System: You produced internal reasoning but no visible response and no tool calls. ' +
                    'Your NEXT response MUST be a tool call — call it RIGHT NOW. Do not output any text first.]'
                  : '[System: Your previous response was empty. If you have all the information you need, call the appropriate tool now. ' +
                    'If you still need something from the user, write a short text reply asking for it.]',
              });
              continue;
            }

            // Pass full brain output (reasoning + text) so the hook can detect planning in thinking blocks
            const fullOutput = [reasoningContent, assistantContent].filter(Boolean).join('\n');
            const injection = getPostResponseInjection(fullOutput, iterCount, Infinity, hookState);
            if (injection) {
              sessionMessages.push({ role: 'assistant', content: assistantContent || null });
              sessionMessages.push({ role: 'user', content: injection });
              continue;
            }
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
