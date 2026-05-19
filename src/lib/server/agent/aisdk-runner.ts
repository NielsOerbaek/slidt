import { streamText, stepCountIs, type StepResult, type ToolSet } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createOllama } from 'ai-sdk-ollama';
import { db, agentMessages } from '$lib/server/db/index.ts';
import { eq, asc } from 'drizzle-orm';
import { buildSystemPrompt } from '$lib/server/agent/build-system-prompt.ts';
import { buildAiSdkTools } from '$lib/server/agent/aisdk-tools.ts';
import { buildAnthropicRawContent, buildToolCallsLog } from '$lib/server/agent/persist-aisdk.ts';
import { anthropicRawToAiSdkMessages } from '$lib/server/agent/load-history-aisdk.ts';
import type { ToolResult } from '$lib/server/agent/tools.ts';

type SseEvent =
  | { type: 'thinking'; delta: string }
  | { type: 'text'; delta: string }
  | { type: 'tool_start'; tool: string; toolUseId: string; input: unknown }
  | { type: 'tool_done'; tool: string; toolUseId: string; result: string; undoPatch?: unknown; image?: { base64: string; mediaType: string } }
  | { type: 'done' }
  | { type: 'error'; message: string };

/**
 * AI SDK-based agent runner. Activated when AGENT_BACKEND=aisdk.
 * Supports both Anthropic (claude-*) and Ollama models via a single streamText path.
 */
export function runAiSdkStream(
  deckId: string,
  userId: string,
  userMessage: string,
  modelTag: string,
  useAnthropic: boolean,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      function emit(event: SseEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // Persist user message
        await db.insert(agentMessages).values({ deckId, role: 'user', content: userMessage });

        // Build system prompt
        const systemPrompt = await buildSystemPrompt(deckId);

        // Load history and convert to AI SDK format
        const history = await db
          .select()
          .from(agentMessages)
          .where(eq(agentMessages.deckId, deckId))
          .orderBy(asc(agentMessages.createdAt))
          .limit(40);

        const historyMessages: ReturnType<typeof anthropicRawToAiSdkMessages> = [];
        for (const msg of history) {
          if (msg.rawContent && Array.isArray(msg.rawContent) && msg.rawContent.length > 0) {
            const raw = msg.rawContent as Array<{ role: string; content: unknown }>;
            // Skip OpenAI-format rawContent from legacy Ollama runner (role:'tool')
            const isOllamaFormat = raw.some((r) => r.role === 'tool');
            if (isOllamaFormat) {
              historyMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
              continue;
            }
            const converted = anthropicRawToAiSdkMessages(raw);
            historyMessages.push(...converted);
          } else {
            historyMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
          }
        }

        // Build model
        const model = useAnthropic
          ? anthropic(modelTag)
          : createOllama({
              baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
              ...(process.env.OLLAMA_API_KEY ? { apiKey: process.env.OLLAMA_API_KEY } : {}),
            })(modelTag, {
              think: true,
              options: { num_ctx: 32768 },
              keep_alive: -1,
            });

        // Anthropic gets thinking enabled via providerOptions; Ollama settings are on the model instance
        const providerOptions = useAnthropic
          ? { anthropic: { thinking: { type: 'adaptive' as const } } }
          : {};

        /** Returns true for transient server errors worth retrying (504, 503, etc.) */
        function isRetryable(err: unknown): boolean {
          const msg = err instanceof Error ? err.message : String(err);
          return /50[234]|gateway.?time.?out|service.?unavailable|upstream.?timed/i.test(msg);
        }

        const MAX_RETRIES = 4;
        let lastError: unknown;
        let succeeded = false;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          if (attempt > 0) {
            const delaySec = Math.pow(2, attempt); // 2, 4, 8, 16 s
            emit({ type: 'thinking', delta: `Model busy — retrying in ${delaySec}s… (attempt ${attempt}/${MAX_RETRIES})` });
            await new Promise((r) => setTimeout(r, delaySec * 1000));
          }

          // Accumulate steps for DB persistence — reset on each retry
          const accumulatedSteps: StepResult<ToolSet>[] = [];
          let completed = false;

          try {
            const result = streamText({
              model,
              system: systemPrompt,
              messages: historyMessages,
              tools: buildAiSdkTools(deckId, userId),
              stopWhen: stepCountIs(25),
              maxOutputTokens: 8192,
              providerOptions,
              onStepFinish(step) {
                accumulatedSteps.push(step);
              },
            });

            for await (const event of result.fullStream) {
              if (event.type === 'text-delta') {
                emit({ type: 'text', delta: event.text });
              } else if (event.type === 'reasoning-delta') {
                emit({ type: 'thinking', delta: event.text });
              } else if (event.type === 'tool-call') {
                emit({
                  type: 'tool_start',
                  tool: event.toolName,
                  toolUseId: event.toolCallId,
                  input: event.input,
                });
              } else if (event.type === 'tool-result') {
                const output = event.output as ToolResult;
                emit({
                  type: 'tool_done',
                  tool: event.toolName,
                  toolUseId: event.toolCallId,
                  result: output.result,
                  ...(output.undoPatch !== undefined ? { undoPatch: output.undoPatch } : {}),
                  ...(output.image ? { image: { base64: output.image.base64, mediaType: output.image.mediaType } } : {}),
                });
              } else if (event.type === 'finish') {
                // Persist to DB before emitting done
                const rawContent = buildAnthropicRawContent(accumulatedSteps);
                const toolCalls = buildToolCallsLog(accumulatedSteps);
                const finalText = accumulatedSteps.map((s) => s.text).filter(Boolean).join('');

                await db.insert(agentMessages).values({
                  deckId,
                  role: 'assistant',
                  content: finalText || '(tool calls only)',
                  toolCalls: toolCalls.length > 0 ? toolCalls : null,
                  rawContent: rawContent.length > 0 ? rawContent : null,
                });

                emit({ type: 'done' });
                completed = true;
                succeeded = true;
              } else if (event.type === 'error') {
                throw event.error instanceof Error ? event.error : new Error(String(event.error));
              }
            }

            if (completed) break; // success
          } catch (err) {
            lastError = err;
            if (isRetryable(err) && attempt < MAX_RETRIES) continue;
            emit({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
            return;
          }
        }

        if (!succeeded && lastError) {
          emit({ type: 'error', message: lastError instanceof Error ? lastError.message : 'Model unavailable after retries' });
        }
      } catch (err) {
        emit({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
      } finally {
        controller.close();
      }
    },
  });
}
