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
              <div class="row">
                <div class="row-meta">
                  <span class="time">{timeOnly(e.at)}</span>
                  {#if e.userName}<span class="who">{e.userName}</span>{/if}
                </div>
                <div class="row-summary">{e.summary}</div>
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
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 14px;
    padding: 12px 18px;
    border-top: var(--st-rule-thin);
    align-items: center;
  }
  .row-meta {
    display: flex;
    gap: 10px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink-dim);
  }
  .row-summary {
    grid-column: 1 / 2;
    font-family: var(--st-font-display);
    font-size: 14px;
    line-height: 1.25;
    word-break: break-word;
  }
  .who { color: var(--st-cobalt); }
  .time { letter-spacing: 0.1em; }
  .revert {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
    align-self: center;
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
</style>
