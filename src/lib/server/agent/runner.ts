import Anthropic from '@anthropic-ai/sdk';
import { db, agentMessages, decks, themes, slideTypes } from '$lib/server/db/index.ts';
import { eq, asc, or, and } from 'drizzle-orm';
import { executeTool, AGENT_TOOLS } from '$lib/server/agent/tools.ts';

const client = new Anthropic();

const BASE_SYSTEM_PROMPT = `You are a slide deck assistant for Os & Data, a Danish cooperative association. \
You help users edit presentations using the available tools.

Guidelines:
- Keep all content in Danish unless the user explicitly asks otherwise
- When using create_slide_type / patch_slide_type, only use these Handlebars helpers: fmt, eq, default, each, if, unless
- CSS in templates must not contain @import, external url(), expression(), or behavior:
- After using tools, briefly describe what you changed
- Be concise — let the tools do the work

Content field rules (CRITICAL):
- NEVER put HTML markup in content fields. Write plain text only. The template handles all formatting.
- Do not use <b>, <em>, <br>, <p>, <ul>, <li>, or any other HTML tags in data fields.
- Do not use Markdown syntax (**, *, #) in content fields unless the field type is explicitly "markdown".

Template rules (IMPORTANT — violations cause "[object Object]" in output):
- {{fmt value}} only works on STRING fields. Never pass an object or array to fmt.
- For list fields (type: "list"), iterate with {{#each items}}...{{/each}} and access string properties inside: {{fmt this.propertyName}}
- For group fields (type: "group"), access each sub-field directly: {{fmt field.subField}}
- Always call list_slide_types before add_slide to check the exact field names and types

Field-shape rules for add_slide / patch_slide data (READ CAREFULLY — these are the most common bugs):
- Pass real JSON objects/arrays in 'data', NEVER a JSON-encoded string. data: { eyebrow: "X" }, NOT data: "{\\"eyebrow\\":\\"X\\"}".
- A list of STRINGS is a flat array of strings. The inner schema's 'name' is a label, NOT a wrapper key.
    Example field: { name: "items", type: "list", items: { name: "item", type: "richtext" } }
    WRONG:  items: [{ "item": "First bullet" }, { "item": "Second" }]
    RIGHT:  items: ["First bullet", "Second"]
- A list of OBJECTS uses each sub-field by name, no wrapper key.
    Example field: { name: "cards", type: "list", items: { type: "group", fields: [{name:"title"},{name:"body"}] } }
    WRONG:  cards: [{ "card": { "title": "X", "body": "Y" } }]
    RIGHT:  cards: [{ "title": "X", "body": "Y" }]
- A 'group' field is an object with the sub-field names as keys, no wrapper.
- Lists of strings inside groups follow the same flat-array rule.

Visual verification (USE THE INSPECT TOOL):
- Immediately after create_slide_type or patch_slide_type, call inspect_slide_type with the new id (no slideId) to see the dummy-data render. Iterate until it looks right.
- After the FIRST add_slide for any slide type you haven't already verified in this session, call inspect_slide_type with the slide's id (passed as slideId) to see the real content fit. Catches overflow, line-wrapping, "[object Object]", colour clashes.
- If the screenshot reveals a template bug, use patch_slide_type to fix it and inspect again. delete_slide_type is available for deck-scoped types you decide not to keep.
- Look at the PNG. Check: text inside the 1920x1080 frame, no overflow, content where you expect it, no literal {{handlebars}} or [object Object] showing.`;

type SseEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_start'; tool: string; toolUseId: string; input: unknown }
  | { type: 'tool_done'; tool: string; toolUseId: string; result: string; undoPatch?: unknown; image?: { base64: string; mediaType: string } }
  | { type: 'done' }
  | { type: 'error'; message: string };

/** Strip base64 image data from content blocks to keep DB storage lean. */
function stripImages(content: unknown): unknown {
  if (!Array.isArray(content)) return content;
  return content.map((block: unknown) => {
    if (!block || typeof block !== 'object') return block;
    const b = block as Record<string, unknown>;
    // Strip image source data from tool_result blocks
    if (b.type === 'tool_result' && Array.isArray(b.content)) {
      return {
        ...b,
        content: (b.content as unknown[]).filter(
          (c: unknown) => !(c && typeof c === 'object' && (c as Record<string, unknown>).type === 'image'),
        ),
      };
    }
    // Strip image blocks from assistant messages
    if (b.type === 'image') {
      return { type: 'text', text: '[image omitted]' };
    }
    return block;
  });
}

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
        let themeSystemPrompt = '';
        if (deck?.themeId) {
          const [theme] = await db
            .select()
            .from(themes)
            .where(eq(themes.id, deck.themeId))
            .limit(1);
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
          .where(
            or(
              eq(slideTypes.scope, 'global'),
              and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)),
            ),
          );
        const typeList = allTypes.map((t) => `${t.name}: ${t.label}`).join('\n');
        const systemPrompt = `${BASE_SYSTEM_PROMPT}${themeSystemPrompt}\n\nDeck: "${deck?.title ?? deckId}"${themeInfo}\n\nAvailable slide types:\n${typeList}`;

        // Load conversation history from DB and reconstruct full Anthropic message format.
        // Rows with rawContent store the full exchange (assistant+tool turns) from a previous run;
        // rows without rawContent fall back to simple {role, content} text messages.
        const history = await db
          .select()
          .from(agentMessages)
          .where(eq(agentMessages.deckId, deckId))
          .orderBy(asc(agentMessages.createdAt))
          .limit(40);

        const sessionMessages: Anthropic.MessageParam[] = [];
        for (const msg of history) {
          if (msg.rawContent && Array.isArray(msg.rawContent) && msg.rawContent.length > 0) {
            // Expand the full stored exchange back into the message sequence
            for (const raw of msg.rawContent as Array<{ role: string; content: unknown }>) {
              sessionMessages.push({
                role: raw.role as 'user' | 'assistant',
                content: raw.content as Anthropic.MessageParam['content'],
              });
            }
          } else {
            sessionMessages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }
        }

        // Agentic loop — repeat until end_turn or max iterations
        let iterCount = 0;
        const MAX_ITERATIONS = 25;
        let finalText = '';
        const allToolCallsThisSession: unknown[] = [];

        // Track how many messages were in history so we can extract the new exchange at end
        const historyLength = sessionMessages.length;

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
            // Final response — add to sessionMessages so it's included in rawContent
            sessionMessages.push({ role: 'assistant', content: finalMessage.content });
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
              const { result, undoPatch, image } = await executeTool(
                deckId,
                toolUse.name,
                toolUse.input as Record<string, unknown>,
                userId,
              );
              emit({
                type: 'tool_done',
                tool: toolUse.name,
                toolUseId: toolUse.id,
                result,
                undoPatch,
                ...(image ? { image: { base64: image.base64, mediaType: image.mediaType } } : {}),
              });
              allToolCallsThisSession.push({
                name: toolUse.name,
                input: toolUse.input,
                result,
                undoPatch,
              });
              const content: Anthropic.ToolResultBlockParam['content'] = image
                ? [
                    {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: image.mediaType,
                        data: image.base64,
                      },
                    },
                    { type: 'text', text: result },
                  ]
                : result;
              toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content });
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

          // Extend session messages with assistant response + tool results.
          sessionMessages.push({ role: 'assistant', content: finalMessage.content });
          sessionMessages.push({ role: 'user', content: toolResults });
        }

        // Build rawContent: the full exchange from this run (excluding prior history),
        // with images stripped to keep DB storage manageable.
        const exchangeMessages = sessionMessages.slice(historyLength);
        const rawContent = exchangeMessages.map((msg) => ({
          role: msg.role,
          content: stripImages(msg.content),
        }));

        // Save final assistant message with rawContent for cross-session reconstruction
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
