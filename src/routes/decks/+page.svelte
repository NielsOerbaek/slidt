<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import { formatRelativeDate } from '$lib/utils/date-utils.ts';
  import STBtn from '$lib/components/st/STBtn.svelte';
  import STFace from '$lib/components/st/STFace.svelte';
  import { t, decksHeadline } from '$lib/i18n/index.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let creating = $state(false);
  let newTitle = $state('');

  const empty = $derived(data.decks.length === 0 && !creating && !(data.sharedDecks?.length > 0));
  const headline = $derived(decksHeadline(data.decks.length));
</script>

<svelte:head><title>{t('decks.title')}</title></svelte:head>

{#if empty}
  <div class="empty-shell">
    <aside class="gutter">
      <span>§0</span>
    </aside>

    <section class="empty-hero">
      <div class="tag">{t('empty.tag')}</div>
      <div class="headline">{@html t('empty.headline').replace(/\n/g, '<br />')}</div>
      <p class="empty-copy">{t('empty.copy')}</p>
      <div class="empty-cta">
        <STBtn variant="accent" onclick={() => { creating = true; }}>{t('decks.new')}</STBtn>
        <STBtn href="/templates">{t('empty.from_template')}</STBtn>
        <STBtn disabled>{t('empty.draft_with_agent')}</STBtn>
      </div>
    </section>

    <aside class="empty-aside">
      <STFace size={200} mood="sleep" />
      <div class="off-duty">{t('empty.off_duty')}</div>
    </aside>
  </div>
{:else}
  <div class="decks">
    <div class="head-band">
      <div class="head-index">§02</div>
      <div class="head-title">
        <div class="meta">{t('decks.workspace')} {(data.user?.name ?? '').toUpperCase()}</div>
        <h1>{headline}</h1>
      </div>
      <div class="head-stat">
        <div class="stat-label">{t('decks.last_week')}</div>
        <div class="stat-num">{data.agentEditsLastWeek}</div>
        <div class="stat-label">{t('decks.agent_edits')}</div>
        <div class="stat-cta">
          <STBtn variant="accent" onclick={() => { creating = true; }}>{t('decks.new')}</STBtn>
        </div>
      </div>
    </div>

    {#if creating}
      <form method="POST" action="?/create" use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type !== 'redirect') {
            creating = false;
            newTitle = '';
          }
          await update();
        };
      }} class="create-form">
        <div class="create-row">
          <span class="create-label">{t('decks.new_label')}</span>
          <input type="text" name="title" bind:value={newTitle} required placeholder={t('decks.new_placeholder')} autofocus />
          <STBtn type="submit" variant="accent">{t('decks.create')}</STBtn>
          <STBtn onclick={() => { creating = false; newTitle = ''; }}>{t('decks.cancel')}</STBtn>
        </div>
      </form>
    {/if}

    {#if form?.error}
      <div class="error">{form.error}</div>
    {/if}

    <div class="table">
      <div class="table-head">
        <div class="th n">{t('decks.col_n')}</div>
        <div class="th title">{t('decks.col_title')}</div>
        <div class="th slides">{t('decks.col_slides')}</div>
        <div class="th upd">{t('decks.col_updated')}</div>
        <div class="th actions">{t('decks.col_actions')}</div>
        <div class="th arrow"></div>
      </div>

      {#each data.decks as deck, i (deck.id)}
        <a class="row" href="/decks/{deck.id}">
          <div class="cell n">{String(i + 1).padStart(2, '0')}</div>
          <div class="cell title">
            {#if i === 0}<span class="dot" aria-hidden="true"></span>{/if}
            <span class="t">{deck.title}</span>
          </div>
          <div class="cell slides">{String(deck.slideOrder.length).padStart(2, '0')}</div>
          <div class="cell upd">{formatRelativeDate(deck.updatedAt).toUpperCase()}</div>
          <div class="cell actions">
            <span class="chip">{t('decks.action_open')}</span>
            <span class="chip">{t('decks.action_pdf')}</span>
            <form method="POST" action="?/duplicate" use:enhance onclick={(e) => e.stopPropagation()}>
              <input type="hidden" name="id" value={deck.id} />
              <button type="submit" class="chip">DUP</button>
            </form>
          </div>
          <div class="cell arrow">→</div>
        </a>
      {/each}
    </div>

    {#if data.sharedDecks?.length > 0}
      <h2 class="section-label">SHARED WITH ME</h2>
      <div class="table">
        <div class="table-head">
          <div class="th n">{t('decks.col_n')}</div>
          <div class="th title">{t('decks.col_title')}</div>
          <div class="th slides">{t('decks.col_slides')}</div>
          <div class="th upd">{t('decks.col_updated')}</div>
          <div class="th actions">{t('decks.col_actions')}</div>
          <div class="th arrow"></div>
        </div>
        {#each data.sharedDecks as deck, i (deck.id)}
          <a class="row" href="/decks/{deck.id}">
            <div class="cell n">{String(i + 1).padStart(2, '0')}</div>
            <div class="cell title">
              <span class="t">{deck.title}</span>
            </div>
            <div class="cell slides">{String(deck.slideOrder.length).padStart(2, '0')}</div>
            <div class="cell upd">{formatRelativeDate(deck.updatedAt).toUpperCase()}</div>
            <div class="cell actions">
              <span class="chip">{t('decks.action_open')}</span>
              <span class="chip">SHARED</span>
            </div>
            <div class="cell arrow">→</div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ── decks list ───────────────────────────────────────── */
  .decks { background: var(--st-bg); }

  .head-band {
    display: grid;
    grid-template-columns: 80px 1fr 280px;
    border-bottom: var(--st-rule-thick);
  }
  .head-index {
    border-right: var(--st-rule-thick);
    padding: 36px 0;
    text-align: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
  }
  .head-title {
    padding: 32px 40px;
    border-right: var(--st-rule-thick);
  }
  .meta {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-bottom: 10px;
  }
  h1 {
    font-family: var(--st-font-display);
    font-weight: 400;
    font-size: 76px;
    line-height: 0.9;
    letter-spacing: -0.04em;
    margin: 0;
  }
  .head-stat {
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
    line-height: 1.6;
  }
  .stat-label { color: var(--st-ink-dim); }
  .stat-num {
    color: var(--st-ink);
    font-family: var(--st-font-display);
    font-size: 38px;
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 4px 0;
  }
  .stat-cta { margin-top: auto; padding-top: 14px; }

  /* ── create form ──────────────────────────────────────── */
  .create-form {
    border-bottom: var(--st-rule-thin);
    padding: 18px 40px;
    background: var(--st-bg-deep);
  }
  .create-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .create-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
  }
  .create-row input {
    flex: 1;
    font-family: var(--st-font-display);
    font-size: 22px;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    padding: 10px 14px;
    color: var(--st-ink);
  }
  .error {
    padding: 14px 40px;
    color: var(--st-ink);
    background: var(--st-bg-deep);
    border-bottom: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
  }

  /* ── table ────────────────────────────────────────────── */
  .table {
    display: grid;
    grid-template-columns: 80px 1fr 100px 180px 160px 60px;
  }
  .table-head, .row { display: contents; }

  .th {
    padding: 12px 20px;
    border-bottom: var(--st-rule-medium);
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
    border-right: var(--st-rule-thin);
    text-align: left;
  }
  .th.n { border-right: var(--st-rule-thick); text-align: center; }
  .th.slides { text-align: right; }
  .th.arrow { border-right: 0; }

  .cell {
    padding: 22px 20px;
    border-bottom: var(--st-rule-thin);
    border-right: var(--st-rule-thin);
    display: flex;
    align-items: center;
    background: var(--st-bg);
  }
  .cell.n {
    border-right: var(--st-rule-thick);
    text-align: center;
    justify-content: center;
    font-family: var(--st-font-mono);
    font-size: 13px;
    color: var(--st-ink-dim);
    padding: 28px 0;
  }
  .cell.title { gap: 16px; }
  .cell.title .dot {
    width: 8px;
    height: 8px;
    background: var(--st-cobalt);
    flex-shrink: 0;
  }
  .cell.title .t {
    font-family: var(--st-font-display);
    font-size: 28px;
    letter-spacing: -0.02em;
  }
  .cell.slides {
    font-family: var(--st-font-mono);
    font-size: 16px;
    justify-content: flex-end;
  }
  .cell.upd {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--st-ink-dim);
  }
  .cell.actions { gap: 6px; padding: 16px 20px; }
  .cell.arrow {
    border-right: 0;
    justify-content: center;
    font-size: 20px;
    color: var(--st-ink);
  }
  .chip {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    padding: 4px 8px;
    border: var(--st-rule-medium);
  }
  button.chip {
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .row { text-decoration: none; color: inherit; }
  .row:hover .cell { background: var(--st-bg-deep); }

  /* ── empty state ──────────────────────────────────────── */
  .empty-shell {
    display: grid;
    grid-template-columns: 80px 1fr 420px;
    min-height: calc(100vh - 60px);
    background: var(--st-bg);
  }
  .gutter {
    border-right: var(--st-rule-thick);
    padding: 40px 0;
    text-align: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
  }
  .empty-hero {
    padding: 60px 48px;
    border-right: var(--st-rule-thick);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 40px;
  }
  .empty-hero .tag {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--st-cobalt);
    margin-bottom: 14px;
  }
  .empty-hero .headline {
    font-family: var(--st-font-display);
    font-size: 104px;
    line-height: 0.88;
    letter-spacing: -0.04em;
  }
  .empty-copy {
    font-family: var(--st-font-mono);
    font-size: 12px;
    color: var(--st-ink-dim);
    margin-top: 28px;
    letter-spacing: 0.08em;
    max-width: 480px;
    line-height: 1.7;
  }
  .empty-cta { display: flex; gap: 12px; flex-wrap: wrap; }
  .empty-aside {
    padding: 40px;
    background: var(--st-bg-deep);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }
  .off-duty {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    text-align: center;
  }

  .section-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    margin: 24px 0 8px;
    padding: 0 40px;
  }
</style>
