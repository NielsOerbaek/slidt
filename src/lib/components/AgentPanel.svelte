<script lang="ts">
  let { deckId, onclose }: { deckId: string; onclose: () => void } = $props();

  interface Message {
    role: 'user' | 'assistant';
    content: string;
    toolCalls?: { name: string; result?: string }[];
  }

  let messages = $state<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you edit this deck — rewrite content, tweak the theme, or create new slide types. Agent functionality will be wired up in Plan 5.',
    },
  ]);
  let input = $state('');
  let sending = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  function send() {
    const text = input.trim();
    if (!text || sending) return;
    messages = [...messages, { role: 'user', content: text }];
    input = '';
    sending = true;
    // Plan 5 will implement real SSE streaming here.
    setTimeout(() => {
      messages = [
        ...messages,
        {
          role: 'assistant',
          content: `(Agent not yet wired up — Plan 5 will connect to Claude API for deck ${deckId})`,
        },
      ];
      sending = false;
    }, 400);
  }
</script>

<div class="agent">
  <div class="messages">
    {#each messages as msg}
      <div class="msg msg-{msg.role}">
        {#if msg.role === 'assistant'}
          <span class="role-badge">Agent</span>
        {:else}
          <span class="role-badge you">You</span>
        {/if}
        <p class="content">{msg.content}</p>
        {#if msg.toolCalls}
          {#each msg.toolCalls as tc}
            <div class="tool-call">
              <span class="tool-name">{tc.name}</span>
              {#if tc.result}<span class="tool-result">{tc.result}</span>{/if}
            </div>
          {/each}
        {/if}
      </div>
    {/each}
    {#if sending}
      <div class="msg msg-assistant">
        <span class="role-badge">Agent</span>
        <p class="content thinking">Thinking…</p>
      </div>
    {/if}
  </div>

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
  .agent { display: flex; flex-direction: column; height: 100%; }
  .messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }
  .msg { display: flex; flex-direction: column; gap: 4px; }
  .role-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
  .role-badge.you { color: #6e31ff; }
  .content { margin: 0; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
  .thinking { color: #aaa; font-style: italic; }
  .tool-call {
    background: #f0eeff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
    display: flex;
    gap: 8px;
    align-items: baseline;
  }
  .tool-name { font-weight: 600; font-family: monospace; color: #6e31ff; }
  .tool-result { color: #555; }

  .input-area { padding: 12px; border-top: 1px solid #eee; display: flex; flex-direction: column; gap: 6px; }
  .input-area textarea {
    resize: none;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;
    width: 100%;
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
