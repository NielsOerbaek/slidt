<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let {
    deckId,
    themeId = null,
    onclose,
  }: { deckId: string; themeId?: string | null; onclose: () => void } = $props();

  interface ToolCall {
    name: string;
    toolUseId: string;
    input?: unknown;
    result?: string;
    undoPatch?: unknown;
  }

  interface Message {
    role: 'user' | 'assistant';
    content: string;
    toolCalls?: ToolCall[];
  }

  let messages = $state<Message[]>([
    {
      role: 'assistant',
      content:
        'Hi! I can help you edit this deck — rewrite content, tweak the theme, or create new slide types.',
    },
  ]);
  let input = $state('');
  let sending = $state(false);
  let errorMsg = $state('');

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    messages = [...messages, { role: 'user', content: text }];
    input = '';
    sending = true;
    errorMsg = '';

    // Insert empty assistant placeholder to stream into
    messages = [...messages, { role: 'assistant', content: '', toolCalls: [] }];
    const assistantIdx = messages.length - 1;

    function updateAssistant(fn: (m: Message) => Message) {
      messages = messages.map((m, i) => (i === assistantIdx ? fn(m) : m));
    }

    try {
      const response = await fetch(`/api/decks/${deckId}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok || !response.body) {
        throw new Error(await response.text().catch(() => 'Request failed'));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          let event: { type: string } & Record<string, unknown>;
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          if (event.type === 'text') {
            updateAssistant((m) => ({ ...m, content: m.content + (event.delta as string) }));
          } else if (event.type === 'tool_start') {
            const tc: ToolCall = {
              name: event.tool as string,
              toolUseId: event.toolUseId as string,
              input: event.input,
            };
            updateAssistant((m) => ({ ...m, toolCalls: [...(m.toolCalls ?? []), tc] }));
          } else if (event.type === 'tool_done') {
            updateAssistant((m) => ({
              ...m,
              toolCalls: (m.toolCalls ?? []).map((tc) =>
                tc.toolUseId === (event.toolUseId as string)
                  ? { ...tc, result: event.result as string, undoPatch: event.undoPatch }
                  : tc,
              ),
            }));
          } else if (event.type === 'done') {
            await invalidateAll();
            break outer;
          } else if (event.type === 'error') {
            errorMsg = event.message as string;
          }
        }
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      // Remove the empty placeholder on error
      messages = messages.filter((_, i) => i !== assistantIdx);
    } finally {
      sending = false;
    }
  }

  async function handleUndo(undoPatch: unknown) {
    const patch = undoPatch as Record<string, unknown>;
    try {
      if (patch.type === 'patch_slide') {
        await fetch(`/api/decks/${deckId}/slides/${patch.id as string}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: patch.before }),
        });
      } else if (patch.type === 'update_theme' && themeId) {
        await fetch(`/api/themes/${themeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokens: patch.before }),
        });
      } else if (patch.type === 'delete_slide') {
        await fetch(`/api/decks/${deckId}/slides/${patch.id as string}`, { method: 'DELETE' });
      } else if (patch.type === 'reorder_slides') {
        await fetch(`/api/decks/${deckId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slideOrder: patch.previousOrder }),
        });
      }
      await invalidateAll();
    } catch {
      // Undo errors are non-fatal — user can retry manually
    }
  }

  function canUndo(undoPatch: unknown): boolean {
    if (!undoPatch || typeof undoPatch !== 'object') return false;
    const patch = undoPatch as Record<string, unknown>;
    if (patch.type === 'update_theme') return Boolean(themeId);
    return ['patch_slide', 'delete_slide', 'reorder_slides'].includes(patch.type as string);
  }
</script>

<div class="agent">
  <div class="header">
    <span class="title">Agent</span>
    <button class="close-btn" onclick={onclose} aria-label="Close agent panel">✕</button>
  </div>

  <div class="messages">
    {#each messages as msg}
      <div class="msg msg-{msg.role}">
        <span class="role-badge" class:you={msg.role === 'user'}>
          {msg.role === 'assistant' ? 'Agent' : 'You'}
        </span>
        {#if msg.content}
          <p class="content">{msg.content}</p>
        {/if}
        {#if msg.toolCalls && msg.toolCalls.length > 0}
          {#each msg.toolCalls as tc}
            <div class="tool-call">
              <div class="tool-header">
                <span class="tool-name">{tc.name}</span>
                {#if tc.result}
                  <span class="tool-status" class:ok={!tc.result.startsWith('error')}>
                    {tc.result.startsWith('error') ? 'failed' : 'done'}
                  </span>
                {:else}
                  <span class="tool-status running">running…</span>
                {/if}
                {#if tc.undoPatch && canUndo(tc.undoPatch)}
                  <button class="undo-btn" onclick={() => handleUndo(tc.undoPatch)}>
                    Undo
                  </button>
                {/if}
              </div>
              {#if tc.result && tc.result.startsWith('error')}
                <p class="tool-error">{tc.result}</p>
              {/if}
            </div>
          {/each}
        {/if}
        {#if msg.role === 'assistant' && !msg.content && (!msg.toolCalls || msg.toolCalls.length === 0) && sending}
          <p class="content thinking">Thinking…</p>
        {/if}
      </div>
    {/each}
  </div>

  {#if errorMsg}
    <div class="error-banner">{errorMsg}</div>
  {/if}

  <div class="input-area">
    <textarea
      bind:value={input}
      placeholder="Ask the agent… (Cmd+Enter to send)"
      rows="3"
      onkeydown={handleKeydown}
      disabled={sending}
    ></textarea>
    <button onclick={send} disabled={sending || !input.trim()}>Send</button>
  </div>
</div>

<style>
  .agent {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-size: 13px;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #444;
  }
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    font-size: 14px;
    padding: 2px 6px;
  }
  .close-btn:hover { color: #333; }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .msg { display: flex; flex-direction: column; gap: 4px; }
  .role-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #888;
  }
  .role-badge.you { color: #6e31ff; }
  .content {
    margin: 0;
    line-height: 1.55;
    white-space: pre-wrap;
    color: #222;
  }
  .thinking { color: #aaa; font-style: italic; }

  .tool-call {
    background: #f7f5ff;
    border: 1px solid #e2d9ff;
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .tool-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .tool-name {
    font-weight: 600;
    font-family: monospace;
    color: #6e31ff;
    font-size: 12px;
  }
  .tool-status {
    font-size: 11px;
    color: #888;
  }
  .tool-status.ok { color: #16a34a; }
  .tool-status.running { color: #f59e0b; }
  .tool-error { margin: 0; color: #dc2626; font-size: 11px; }
  .undo-btn {
    margin-left: auto;
    background: none;
    border: 1px solid #c4b5fd;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    color: #6e31ff;
    cursor: pointer;
    font-weight: 600;
  }
  .undo-btn:hover { background: #ede9fe; }

  .error-banner {
    background: #fef2f2;
    border-top: 1px solid #fca5a5;
    color: #dc2626;
    padding: 8px 12px;
    font-size: 12px;
  }

  .input-area {
    padding: 12px;
    border-top: 1px solid #eee;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .input-area textarea {
    resize: none;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }
  .input-area textarea:focus { outline: 2px solid #6e31ff; border-color: transparent; }
  .input-area button {
    background: #6e31ff;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-end;
  }
  .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
