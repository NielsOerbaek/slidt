<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { t } from '$lib/i18n/index.ts';

  let { deckId, open = $bindable(false) }: {
    deckId: string;
    open?: boolean;
  } = $props();

  interface EditRow {
    id: string;
    slideId: string | null;
    userId: string | null;
    userName: string | null;
    at: string;
    kind: string;
    summary: string;
    before: unknown;
    after: unknown;
  }

  type FieldKind = 'text' | 'color' | 'image';
  interface FieldDiff {
    field: string;
    kind: FieldKind;
    before: string;
    after: string;
  }

  function detectKind(field: string, value: string): FieldKind {
    if (/^#[0-9a-f]{3,8}$/i.test(value) || /^rgb/i.test(value)) return 'color';
    if (/(image|img|photo|src|url|path|logo)/i.test(field)) return 'image';
    return 'text';
  }

  function truncate(s: string, n = 80): string {
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  function extractDiff(e: EditRow): FieldDiff[] | null {
    if (e.kind === 'edit_title') {
      const b = e.before as { title?: string } | null;
      const a = e.after as { title?: string } | null;
      if (typeof b?.title !== 'string' || typeof a?.title !== 'string') return null;
      if (b.title === a.title) return null;
      return [{ field: 'title', kind: 'text', before: b.title, after: a.title }];
    }
    if (e.kind === 'edit_field') {
      const b = e.before as { data?: Record<string, unknown> } | null;
      const a = e.after as { data?: Record<string, unknown> } | null;
      if (!b?.data || !a?.data) return null;
      const diffs: FieldDiff[] = [];
      const allKeys = new Set([...Object.keys(b.data), ...Object.keys(a.data)]);
      for (const key of allKeys) {
        const bv = b.data[key];
        const av = a.data[key];
        if (bv === av) continue;
        if (typeof bv !== 'string' && typeof av !== 'string') continue;
        const bStr = typeof bv === 'string' ? bv : '';
        const aStr = typeof av === 'string' ? av : '';
        diffs.push({ field: key, kind: detectKind(key, aStr || bStr), before: bStr, after: aStr });
      }
      return diffs.length > 0 ? diffs : null;
    }
    return null;
  }

  let edits = $state<EditRow[]>([]);
  let loading = $state(false);
  let loadError = $state('');
  let nextCursor = $state<string | null>(null);
  let reverting = $state<string | null>(null);
  let revertError = $state('');

  async function load(opts: { append?: boolean } = {}) {
    loading = true;
    loadError = '';
    try {
      const params = new URLSearchParams({ limit: '60' });
      if (opts.append && nextCursor) params.set('before', nextCursor);
      const res = await fetch(`/api/decks/${deckId}/history?${params}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as { edits: EditRow[]; nextCursor: string | null };
      edits = opts.append ? [...edits, ...data.edits] : data.edits;
      nextCursor = data.nextCursor;
    } catch (err) {
      loadError = err instanceof Error ? err.message : String(err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (open) load();
  });

  async function revert(id: string, summary: string) {
    if (!confirm(t('history.revert_confirm').replace('{summary}', summary))) return;
    reverting = id;
    revertError = '';
    try {
      const res = await fetch(`/api/decks/${deckId}/history/${id}/revert`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.text();
        revertError = body || `${res.status}`;
        return;
      }
      await invalidateAll();
      await load();
    } catch (err) {
      revertError = err instanceof Error ? err.message : String(err);
    } finally {
      reverting = null;
    }
  }

  function dayKey(iso: string): string {
    return iso.slice(0, 10);
  }
  function timeOnly(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  function dayLabel(iso: string): string {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    });
  }

  // Group edits by day for the sidebar timeline; preserves the desc order
  // from the API so newest day appears first.
  const days = $derived.by(() => {
    const out: { day: string; rows: EditRow[] }[] = [];
    for (const e of edits) {
      const d = dayKey(e.at);
      const last = out[out.length - 1];
      if (last && last.day === d) last.rows.push(e);
      else out.push({ day: d, rows: [e] });
    }
    return out;
  });
</script>

{#if open}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    onclick={() => (open = false)}
    onkeydown={(e) => { if (e.key === 'Escape') open = false; }}
    transition:fly={{ duration: 0 }}
  >
    <aside
      class="drawer"
      role="document"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      transition:fly={{ x: 380, duration: 220, easing: cubicOut }}
    >
      <header class="drawer-head">
        <span class="tag">{t('history.title')}</span>
        <span class="spacer"></span>
        <button class="close" type="button" onclick={() => (open = false)} aria-label={t('history.close')}>×</button>
      </header>

      {#if loadError}
        <div class="error">{loadError}</div>
      {/if}
      {#if revertError}
        <div class="error">{t('history.revert_failed')}: {revertError}</div>
      {/if}

      <div class="body">
        {#if loading && edits.length === 0}
          <div class="empty">{t('history.loading')}</div>
        {:else if edits.length === 0}
          <div class="empty">{t('history.empty')}</div>
        {:else}
          {#each days as group (group.day)}
            <div class="day-head">{dayLabel(group.day)}</div>
            {#each group.rows as e (e.id)}
              {@const diff = extractDiff(e)}
              <div class="row">
                <div class="row-left">
                  <div class="row-meta">
                    <span class="time">{timeOnly(e.at)}</span>
                    {#if e.userName}<span class="who">{e.userName}</span>{/if}
                  </div>
                  <div class="row-summary">{e.summary}</div>
                  {#if diff}
                    <details class="diff-details">
                      <summary>{t('history.show_changes')}</summary>
                      <div class="diff-body">
                        {#each diff as fd}
                          <div class="diff-row">
                            <span class="diff-field">{fd.field}</span>
                            <span class="diff-before">
                              {#if fd.kind === 'color' && fd.before}
                                <span class="swatch" style="background:{fd.before}"></span>
                              {/if}
                              {truncate(fd.before) || '—'}
                            </span>
                            <span class="diff-arrow">→</span>
                            <span class="diff-after">
                              {#if fd.kind === 'color' && fd.after}
                                <span class="swatch" style="background:{fd.after}"></span>
                              {/if}
                              {truncate(fd.after) || '—'}
                            </span>
                          </div>
                        {/each}
                      </div>
                    </details>
                  {/if}
                </div>
                <button
                  type="button"
                  class="revert"
                  disabled={reverting === e.id}
                  onclick={() => revert(e.id, e.summary)}
                >{reverting === e.id ? t('history.reverting') : t('history.revert')}</button>
              </div>
            {/each}
          {/each}
          {#if nextCursor}
            <button type="button" class="load-more" onclick={() => load({ append: true })} disabled={loading}>
              {loading ? t('history.loading') : t('history.load_more')}
            </button>
          {/if}
        {/if}
      </div>
    </aside>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 8, 7, 0.4);
    display: flex;
    justify-content: flex-end;
    z-index: 1000;
  }
  .drawer {
    width: 420px;
    max-width: 100vw;
    height: 100%;
    background: var(--st-bg);
    border-left: var(--st-rule-thick);
    display: flex;
    flex-direction: column;
    box-shadow: -16px 0 40px rgba(8, 8, 7, 0.18);
  }
  .drawer-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: var(--st-rule-thick);
    flex-shrink: 0;
  }
  .tag {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--st-cobalt);
  }
  .spacer { flex: 1; }
  .close {
    background: transparent;
    border: 0;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    color: var(--st-ink);
  }

  .body {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0 16px;
  }
  .day-head {
    padding: 14px 18px 6px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--st-ink-dim);
    border-top: var(--st-rule-thin);
  }
  .day-head:first-child { border-top: 0; }

  .row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 12px 18px;
    border-top: var(--st-rule-thin);
  }
  .row-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .row-meta {
    display: flex;
    gap: 10px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink-dim);
  }
  .row-summary {
    font-family: var(--st-font-display);
    font-size: 14px;
    line-height: 1.25;
    word-break: break-word;
  }
  .who { color: var(--st-cobalt); }
  .time { letter-spacing: 0.1em; }
  .revert {
    flex-shrink: 0;
    padding: 6px 10px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    cursor: pointer;
    text-transform: uppercase;
  }
  .revert:hover { background: var(--st-ink); color: var(--st-bg); }
  .revert:disabled { color: var(--st-ink-dim); cursor: default; background: var(--st-bg); }

  /* ── Diff fold-out ──────────────────────────────────────── */
  .diff-details {
    margin-top: 2px;
  }
  .diff-details summary {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    color: var(--st-ink-dim);
    cursor: pointer;
    user-select: none;
    list-style: none; /* hide browser triangle — we rely on text */
    padding: 2px 0;
  }
  .diff-details summary::-webkit-details-marker { display: none; }
  .diff-details summary::before {
    content: '▸ ';
    font-size: 9px;
  }
  .diff-details[open] summary::before {
    content: '▾ ';
  }
  .diff-details summary:hover { color: var(--st-ink); }

  .diff-body {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .diff-row {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    align-items: baseline;
    gap: 4px 6px;
    font-family: var(--st-font-mono);
    font-size: 10px;
  }
  .diff-field {
    grid-column: 1 / -1;
    color: var(--st-ink-dim);
    letter-spacing: 0.1em;
    font-size: 9px;
    padding-top: 2px;
  }
  .diff-before {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--st-ink-dim);
    text-decoration: line-through;
    word-break: break-all;
    min-width: 0;
  }
  .diff-arrow {
    color: var(--st-ink-dim);
    flex-shrink: 0;
  }
  .diff-after {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--st-ink);
    word-break: break-all;
    min-width: 0;
  }
  .swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid rgba(0,0,0,0.15);
    flex-shrink: 0;
  }

  /* ── Load more / empty / error ─────────────────────────── */
  .load-more {
    margin: 18px 18px 0;
    display: block;
    padding: 10px;
    width: calc(100% - 36px);
    border: 2px dashed var(--st-ink-dim);
    background: transparent;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    cursor: pointer;
  }
  .load-more:hover { border-color: var(--st-cobalt); color: var(--st-cobalt); }

  .empty {
    padding: 40px 18px;
    text-align: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--st-ink-dim);
  }
  .error {
    padding: 10px 14px;
    margin: 10px 14px;
    border-left: 3px solid #b91c1c;
    background: var(--st-bg-deep);
    font-family: var(--st-font-mono);
    font-size: 11px;
    color: var(--st-ink);
  }

  @media (max-width: 768px) {
    .drawer { width: 100vw; }
  }
</style>
