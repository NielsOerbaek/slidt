<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { tick } from 'svelte';
  import STFace from './STFace.svelte';
  import STTurn from './STTurn.svelte';
  import { t } from '$lib/i18n/index.ts';

  let { deckId, themeId = null, open = $bindable(false) }: {
    deckId: string;
    themeId?: string | null;
    open?: boolean;
  } = $props();

  // ── Message model ────────────────────────────────────────────────────
  // Assistant turns interleave text deltas and tool calls in the order they
  // arrive over SSE. Storing them as an ordered `parts` array preserves that
  // sequence so the transcript reads top-to-bottom rather than dumping all
  // tool calls below all text.
  type TextPart = { kind: 'text'; text: string };
  type ToolPart = {
    kind: 'tool';
    toolUseId: string;
    name: string;
    input?: unknown;
    result?: string;
    undoPatch?: unknown;
    image?: { base64: string; mediaType: string };
  };
  type Part = TextPart | ToolPart;

  interface Message {
    role: 'user' | 'assistant';
    parts: Part[];
  }

  let messages = $state<Message[]>([]);
  let input = $state('');
  let sending = $state(false);
  let errorMsg = $state('');
  let composeEl = $state<HTMLTextAreaElement | undefined>(undefined);
  let transcriptEl = $state<HTMLDivElement | undefined>(undefined);

  const turnCount = $derived(messages.length);

  // The most recent successful tool call (any role), used by the footer chip.
  const lastAction = $derived.by<ToolPart | null>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]!;
      for (let j = m.parts.length - 1; j >= 0; j--) {
        const p = m.parts[j]!;
        if (p.kind === 'tool' && p.result && !p.result.startsWith('error')) return p;
      }
    }
    return null;
  });

  function isThinking(m: Message): boolean {
    if (m.role !== 'assistant') return false;
    if (!sending) return false;
    if (m.parts.length === 0) return true;
    const lastTextEmpty = m.parts.every((p) => p.kind === 'text' ? !p.text : false);
    return lastTextEmpty;
  }

  function plainText(m: Message): string {
    return m.parts
      .filter((p): p is TextPart => p.kind === 'text')
      .map((p) => p.text)
      .join('');
  }

  function toggle() {
    open = !open;
    if (open) {
      setTimeout(() => composeEl?.focus(), 50);
      scrollToBottom();
    }
  }

  async function scrollToBottom() {
    await tick();
    if (transcriptEl) transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  function handleGlobal(e: KeyboardEvent) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggle();
    }
  }

  // ── Message mutation helpers ─────────────────────────────────────────
  function updateAssistant(idx: number, fn: (m: Message) => Message) {
    messages = messages.map((m, i) => (i === idx ? fn(m) : m));
  }

  function appendText(m: Message, delta: string): Message {
    const last = m.parts[m.parts.length - 1];
    if (last && last.kind === 'text') {
      const updated = m.parts.slice(0, -1).concat({ kind: 'text', text: last.text + delta });
      return { ...m, parts: updated };
    }
    return { ...m, parts: [...m.parts, { kind: 'text', text: delta }] };
  }

  function pushTool(m: Message, tool: Omit<ToolPart, 'kind'>): Message {
    return { ...m, parts: [...m.parts, { kind: 'tool', ...tool }] };
  }

  function patchTool(
    m: Message,
    toolUseId: string,
    patch: Partial<Omit<ToolPart, 'kind' | 'toolUseId'>>,
  ): Message {
    return {
      ...m,
      parts: m.parts.map((p) =>
        p.kind === 'tool' && p.toolUseId === toolUseId ? { ...p, ...patch } : p,
      ),
    };
  }

  // ── Send ─────────────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    messages = [
      ...messages,
      { role: 'user', parts: [{ kind: 'text', text }] },
      { role: 'assistant', parts: [] },
    ];
    const assistantIdx = messages.length - 1;
    input = '';
    sending = true;
    errorMsg = '';
    scrollToBottom();

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
          try { event = JSON.parse(raw); } catch { continue; }

          if (event.type === 'text') {
            updateAssistant(assistantIdx, (m) => appendText(m, event.delta as string));
            scrollToBottom();
          } else if (event.type === 'tool_start') {
            updateAssistant(assistantIdx, (m) => pushTool(m, {
              name: event.tool as string,
              toolUseId: event.toolUseId as string,
              input: event.input,
            }));
            scrollToBottom();
          } else if (event.type === 'tool_done') {
            updateAssistant(assistantIdx, (m) => patchTool(m, event.toolUseId as string, {
              result: event.result as string,
              undoPatch: event.undoPatch,
              image: event.image as ToolPart['image'],
            }));
            const SLIDE_MUTATING = ['add_slide', 'patch_slide', 'delete_slide', 'reorder_slides'];
            if (SLIDE_MUTATING.includes(event.tool as string)) {
              await invalidateAll();
            }
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
      messages = messages.filter((_, i) => i !== assistantIdx);
    } finally {
      sending = false;
      scrollToBottom();
    }
  }

  // ── Undo ─────────────────────────────────────────────────────────────
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
    } catch { /* non-fatal */ }
  }

  function canUndo(undoPatch: unknown): boolean {
    if (!undoPatch || typeof undoPatch !== 'object') return false;
    const patch = undoPatch as Record<string, unknown>;
    if (patch.type === 'update_theme') return Boolean(themeId);
    return ['patch_slide', 'delete_slide', 'reorder_slides'].includes(patch.type as string);
  }

  function chipLabel(p: ToolPart): string {
    const id = (p.input as { id?: string } | undefined)?.id;
    return id ? `${p.name.toUpperCase()} · id=${id}` : p.name.toUpperCase();
  }
</script>

<svelte:window onkeydown={handleGlobal} />

<div class="drawer" class:open>
  <button class="bar" onclick={toggle} type="button">
    <STFace size={18} color="var(--st-cobalt)" />
    <span class="tag">{t('agent.tag')}</span>
    <span class="dot" class:live={sending} aria-hidden="true"></span>
    <span class="status">
      {sending ? t('agent.working') : t('agent.live')} · {turnCount} {turnCount === 1 ? t('agent.turn_singular') : t('agent.turn_plural')}
    </span>
    <span class="spacer"></span>
    {#if !open}
      <span class="hint">{t('agent.hint')}</span>
    {/if}
    <span class="cmd">{open ? t('agent.collapse') : t('agent.expand')}</span>
  </button>

  {#if open}
    <div class="body">
      <div class="transcript" bind:this={transcriptEl}>
        {#if messages.length === 0}
          <div class="hello">
            <STFace size={32} color="var(--st-cobalt)" />
            <div class="hello-line">{t('agent.hello')}</div>
          </div>
        {:else}
          {#each messages as msg, i}
            <STTurn
              num={String(i + 1).padStart(2, '0')}
              role={msg.role === 'assistant' ? '-_-' : 'YOU'}
              thinking={isThinking(msg)}
            >
              {#if msg.role === 'user'}
                <span class="content">{plainText(msg)}</span>
              {:else}
                <div class="parts">
                  {#each msg.parts as part, j (j)}
                    {#if part.kind === 'text' && part.text}
                      <span class="content">{part.text}</span>
                    {:else if part.kind === 'tool'}
                      <div class="tool-line">
                        <span class="tool-marker">↳</span>
                        <span class="tool-name">{part.name}</span>
                        {#if !part.result}
                          <span class="tool-pending">{t('agent.tool_pending')}</span>
                        {:else if part.result.startsWith('error')}
                          <span class="tool-err">{t('agent.tool_failed')}</span>
                        {:else}
                          <span class="tool-ok">{t('agent.tool_ok')}</span>
                        {/if}
                      </div>
                      {#if part.result && part.result.startsWith('error')}
                        <div class="tool-err-msg">{part.result}</div>
                      {/if}
                      {#if part.image}
                        <img
                          class="tool-image"
                          src={`data:${part.image.mediaType};base64,${part.image.base64}`}
                          alt="Slide preview"
                          loading="lazy"
                        />
                      {/if}
                    {/if}
                  {/each}
                </div>
              {/if}
            </STTurn>
          {/each}
        {/if}
      </div>

      {#if errorMsg}
        <div class="error">{errorMsg}</div>
      {/if}

      <div class="footer">
        {#if lastAction && canUndo(lastAction.undoPatch)}
          <button class="chip" type="button" onclick={() => handleUndo(lastAction!.undoPatch)} title={t('agent.undo')}>
            <span class="chip-dot"></span>
            <span class="chip-label">{chipLabel(lastAction)}</span>
            <span class="chip-undo">{t('agent.undo')}</span>
          </button>
        {:else if lastAction}
          <span class="chip chip-static">
            <span class="chip-dot"></span>
            <span class="chip-label">{chipLabel(lastAction)}</span>
          </span>
        {/if}
        <div class="compose">
          <span class="compose-num">{String(messages.length + 1).padStart(2, '0')} ·</span>
          <textarea
            bind:this={composeEl}
            bind:value={input}
            placeholder={t('agent.compose_placeholder')}
            rows="1"
            disabled={sending}
            onkeydown={handleKeydown}
          ></textarea>
          <span class="compose-cmd">⌘↵</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .drawer {
    border-top: var(--st-rule-thick);
    background: var(--st-bg);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .bar {
    all: unset;
    cursor: pointer;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--st-font-mono);
    color: var(--st-ink);
  }
  .bar:hover { background: var(--st-bg-deep); }
  .drawer.open .bar { border-bottom: var(--st-rule-medium); }
  .tag { font-size: 10px; letter-spacing: 0.28em; }
  .dot { width: 8px; height: 8px; background: var(--st-cobalt); }
  .dot.live { animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .status { font-size: 9px; letter-spacing: 0.2em; color: var(--st-ink-dim); }
  .spacer { flex: 1; }
  .hint { font-size: 10px; letter-spacing: 0.22em; color: var(--st-ink-dim); }
  .cmd {
    font-size: 11px;
    letter-spacing: 0.2em;
    padding: 4px 10px;
    border: 1.5px solid var(--st-ink);
  }

  .body {
    height: 320px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  /* Single-column flow keeps reading order linear; rows separated by a thin
     rule so consecutive turns don't blur together. */
  .transcript {
    flex: 1;
    overflow-y: auto;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    font-size: 13px;
  }
  .transcript :global(.st-turn) {
    padding-bottom: 22px;
    border-bottom: var(--st-rule-thin);
  }
  .transcript :global(.st-turn:last-child) {
    border-bottom: 0;
    padding-bottom: 0;
  }
  .hello {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--st-ink-dim);
    padding: 24px 0;
  }
  .hello-line {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
  }
  .parts {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .content {
    white-space: pre-wrap;
    line-height: 1.55;
  }
  .tool-line {
    display: flex;
    gap: 10px;
    align-items: baseline;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .tool-marker { color: var(--st-ink-dim); }
  .tool-name { color: var(--st-cobalt); text-transform: uppercase; }
  .tool-pending { color: var(--st-ink-dim); }
  .tool-ok { color: var(--st-cobalt); }
  .tool-err { color: var(--st-ink); }
  .tool-err-msg {
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink);
    padding: 4px 8px;
    background: var(--st-bg-deep);
    border-left: 2px solid var(--st-ink);
  }
  .tool-image {
    display: block;
    width: 100%;
    max-width: 480px;
    aspect-ratio: 16/9;
    margin-top: 6px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    object-fit: contain;
  }

  .error {
    padding: 8px 22px;
    background: var(--st-bg-deep);
    border-top: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 11px;
    color: var(--st-ink);
  }

  .footer {
    padding: 12px 18px;
    border-top: var(--st-rule-thin);
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border: 2px solid var(--st-ink);
    background: transparent;
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    cursor: pointer;
  }
  .chip-static { cursor: default; }
  .chip:hover:not(.chip-static) { background: var(--st-bg-deep); }
  .chip-dot { width: 7px; height: 7px; background: var(--st-cobalt); }
  .chip-undo { color: var(--st-ink-dim); margin-left: 6px; }

  .compose {
    flex: 1;
    border: var(--st-rule-thick);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--st-bg);
  }
  .compose-num {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
  }
  .compose textarea {
    flex: 1;
    font-family: var(--st-font-display);
    font-size: 14px;
    line-height: 1.4;
    border: 0;
    background: transparent;
    color: var(--st-ink);
    resize: none;
  }
  .compose textarea:focus { outline: 0; }
  .compose-cmd {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
  }
</style>
