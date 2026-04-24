<script lang="ts">
  import type { PageData } from './$types.js';
  import { t } from '$lib/i18n/index.ts';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>{t('templates.title')}</title></svelte:head>

<div class="head-band">
  <div class="head-index">§03</div>
  <div class="head-title">
    <div class="meta">{t('templates.items_label')} {String(data.slideTypes.length).padStart(2, '0')} {t('themes.items_suffix')}</div>
    <h1>{t('templates.headline')}</h1>
  </div>
</div>

<ul class="list">
  {#each data.slideTypes as st (st.id)}
    <li class="row">
      <a href="/templates/{st.id}" class="row-link">
        <span class="name">{st.label}</span>
        <span class="code">{st.name}</span>
      </a>
      <span class="scope-badge {st.scope}">{st.scope.toUpperCase()}</span>
    </li>
  {/each}
</ul>

<style>
  .head-band {
    display: grid;
    grid-template-columns: 80px 1fr;
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
  .head-title { padding: 32px 40px; }
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

  .list { list-style: none; padding: 0; margin: 0; }
  .row {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    border-bottom: var(--st-rule-thin);
    background: var(--st-bg);
  }
  .row::before {
    content: '';
    border-right: var(--st-rule-thick);
  }
  .row-link {
    padding: 20px;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-right: var(--st-rule-thin);
  }
  .row-link:hover { background: var(--st-bg-deep); }
  .name {
    font-family: var(--st-font-display);
    font-size: 24px;
    letter-spacing: -0.02em;
  }
  .code {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--st-ink-dim);
  }
  .scope-badge {
    align-self: center;
    margin-right: 22px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    padding: 4px 10px;
    border: 2px solid var(--st-ink);
  }
  .scope-badge.global { background: var(--st-bg); color: var(--st-ink); }
  .scope-badge.deck { background: var(--st-cobalt); color: var(--st-bg); border-color: var(--st-cobalt); }
</style>
