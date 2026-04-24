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
  type ThinkingPart = { kind: 'thinking'; text: string };
  type ToolPart = {
    kind: 'tool';
    toolUseId: string;
    name: string;
    input?: unknown;
    result?: string;
    undoPatch?: unknown;
    image?: { base64: string; mediaType: string };
  };
  type Part = TextPart | ThinkingPart | ToolPart;

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

  type UndoEntry = { tool: string; label: string; undoPatch: unknown };
  let undoStack = $state<UndoEntry[]>([]);

  function isThinking(m: Message): boolean {
    if (m.role !== 'assistant') return false;
    if (!sending) return false;
    if (m.parts.length === 0) return true;
    // Once any content (thinking, text, tools) has arrived, stop showing the spinner
    return m.parts.every((p) => p.kind === 'text' && !p.text);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const LINE_HEIGHT = 14 * 1.4; // font-size 14px × line-height 1.4
  const MAX_TEXTAREA_H = Math.round(LINE_HEIGHT * 2.5); // ~49px

  function growTextarea(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, MAX_TEXTAREA_H) + 'px';
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

  function appendThinking(m: Message, delta: string): Message {
    const last = m.parts[m.parts.length - 1];
    if (last && last.kind === 'thinking') {
      const updated = m.parts.slice(0, -1).concat({ kind: 'thinking', text: last.text + delta });
      return { ...m, parts: updated };
    }
    return { ...m, parts: [...m.parts, { kind: 'thinking', text: delta }] };
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
    if (composeEl) { composeEl.style.height = 'auto'; }
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

          if (event.type === 'thinking') {
            updateAssistant(assistantIdx, (m) => appendThinking(m, event.delta as string));
            scrollToBottom();
          } else if (event.type === 'text') {
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
            if (event.undoPatch && !(event.result as string).startsWith('error')) {
              const entry: UndoEntry = {
                tool: event.tool as string,
                label: buildUndoLabel(event.tool as string),
                undoPatch: event.undoPatch,
              };
              undoStack = [entry, ...undoStack].slice(0, 20);
            }
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

  function buildUndoLabel(tool: string): string {
    switch (tool) {
      case 'add_slide':    return 'added slide';
      case 'delete_slide': return 'deleted slide';
      case 'patch_slide':  return 'edited slide';
      case 'reorder_slides': return 'reordered slides';
      case 'update_theme': return 'changed theme';
      case 'create_slide_type': return 'created template';
      case 'patch_slide_type':  return 'edited template';
      case 'delete_slide_type': return 'deleted template';
      default: return tool.replace(/_/g, ' ');
    }
  }
</script>

<svelte:window onkeydown={handleGlobal} />

<div class="drawer" class:open>
  {#if open}
    <div class="panel-head">
      <STFace size={16} color="var(--st-cobalt)" />
      <span class="tag">{t('agent.tag')}</span>
      <span class="dot" class:live={sending} aria-hidden="true"></span>
      <span class="status">
        {sending ? t('agent.working') : t('agent.live')} · {turnCount} {turnCount === 1 ? t('agent.turn_singular') : t('agent.turn_plural')}
      </span>
      <span class="spacer"></span>
      <button class="panel-close" onclick={toggle} type="button" aria-label="Close agent">×</button>
    </div>
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
                    {#if part.kind === 'thinking' && part.text}
                      <details class="thinking-block">
                        <summary class="thinking-summary">thinking</summary>
                        <span class="thinking-content">{part.text}</span>
                      </details>
                    {:else if part.kind === 'text' && part.text}
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

      {#if undoStack.length > 0}
        <div class="undo-stack">
          <div class="undo-header">
            <span class="undo-title">↩ {undoStack.length} UNDOABLE</span>
          </div>
          <div class="undo-list">
            {#each undoStack as entry, i (i)}
              {#if canUndo(entry.undoPatch)}
                <button
                  class="undo-row"
                  type="button"
                  onclick={() => {
                    handleUndo(entry.undoPatch);
                    undoStack = undoStack.slice(i + 1);
                  }}
                >
                  <span class="undo-tool">{entry.tool}</span>
                  <span class="undo-label">{entry.label}</span>
                  <span class="undo-btn">UNDO</span>
                </button>
              {:else}
                <div class="undo-row undo-row-static">
                  <span class="undo-tool">{entry.tool}</span>
                  <span class="undo-label">{entry.label}</span>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <div class="footer">
        <div class="compose">
          <span class="compose-num">{String(messages.length + 1).padStart(2, '0')} ·</span>
          <textarea
            bind:this={composeEl}
            bind:value={input}
            placeholder={t('agent.compose_placeholder')}
            rows="1"
            disabled={sending}
            onkeydown={handleKeydown}
            oninput={(e) => growTextarea(e.currentTarget as HTMLTextAreaElement)}
          ></textarea>
          <span class="compose-cmd">⇧↵</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Drawer: hidden when closed, full overlay when open */
  .drawer {
    display: none;
  }
  .drawer.open {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 420px;
    z-index: 10;
    background: var(--st-bg);
    border-left: var(--st-rule-thick);
  }

  /* Panel header */
  .panel-head {
    padding: 12px 18px;
    border-bottom: var(--st-rule-medium);
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--st-font-mono);
    color: var(--st-ink);
    flex-shrink: 0;
  }
  .tag { font-size: 10px; letter-spacing: 0.28em; }
  .dot { width: 8px; height: 8px; background: var(--st-cobalt); }
  .dot.live { animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .status { font-size: 9px; letter-spacing: 0.2em; color: var(--st-ink-dim); }
  .spacer { flex: 1; }
  .panel-close {
    background: transparent;
    border: 0;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    color: var(--st-ink-dim);
    padding: 0 4px;
  }
  .panel-close:hover { color: var(--st-ink); }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
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

  .undo-stack {
    border-top: var(--st-rule-thin);
    max-height: 160px;
    display: flex;
    flex-direction: column;
  }
  .undo-header {
    padding: 4px 12px;
    display: flex;
    align-items: center;
  }
  .undo-title {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
  }
  .undo-list {
    overflow-y: auto;
    flex: 1;
  }
  .undo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    border-top: var(--st-rule-thin);
  }
  .undo-row:hover { background: var(--st-bg-deep); }
  .undo-row-static { cursor: default; opacity: 0.5; }
  .undo-row-static:hover { background: none; }
  .undo-tool {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.1em;
    color: var(--st-ink-dim);
    min-width: 100px;
    flex-shrink: 0;
  }
  .undo-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink);
    flex: 1;
  }
  .undo-btn {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.15em;
    color: var(--st-cobalt);
  }

  .footer {
    padding: 12px 18px;
    border-top: var(--st-rule-thin);
    display: flex;
    align-items: center;
    gap: 14px;
  }

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
    overflow: hidden;
    min-height: 20px;
  }
  .compose textarea:focus { outline: 0; }
  .compose-cmd {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
  }

  .thinking-block {
    border-left: 2px solid var(--st-ink-dim);
    padding-left: 10px;
  }
  .thinking-summary {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
    text-transform: uppercase;
    cursor: pointer;
    user-select: none;
  }
  .thinking-content {
    display: block;
    margin-top: 6px;
    font-size: 11px;
    color: var(--st-ink-dim);
    white-space: pre-wrap;
    line-height: 1.5;
  }
</style>
