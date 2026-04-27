<script lang="ts">
  import type { PageData } from './$types.js';
  import { t } from '$lib/i18n/index.ts';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { buildDummyData } from '$lib/utils/field-defaults.ts';
  import type { SlideType } from '../../renderer/types.ts';

  let { data }: { data: PageData } = $props();

  let query = $state('');

  const filtered = $derived(
    data.slideTypes.filter((st) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        st.label.toLowerCase().includes(q) ||
        st.name.toLowerCase().includes(q)
      );
    }),
  );

  function previewType(st: typeof data.slideTypes[number]): SlideType {
    return {
      name: st.name,
      label: st.label,
      fields: st.fields,
      htmlTemplate: st.htmlTemplate,
      css: st.css,
    };
  }
</script>

<svelte:head><title>{t('templates.title')}</title></svelte:head>

<div class="head-band">
  <div class="head-index">§03</div>
  <div class="head-title">
    <div class="meta">{t('templates.items_label')} {String(data.slideTypes.length).padStart(2, '0')} {t('themes.items_suffix')}</div>
    <h1>{t('templates.headline')}</h1>
  </div>
</div>

<div class="search-row">
  <input
    type="search"
    class="search-input"
    placeholder={t('templates.search_placeholder')}
    bind:value={query}
  />
</div>

{#if filtered.length === 0}
  <p class="empty">{t('templates.empty_search')}</p>
{:else}
  <ul class="grid">
    {#each filtered as st (st.id)}
      <li class="card">
        <a href="/templates/{st.id}" class="card-link">
          <div class="card-preview">
            {#if data.previewTheme}
              <SlidePreview
                slideType={previewType(st)}
                slideData={buildDummyData(st.fields)}
                theme={data.previewTheme}
                label={st.label}
              />
            {/if}
          </div>
          <div class="card-meta">
            <span class="card-name">{st.label}</span>
            <span class="card-code">{st.name}</span>
          </div>
        </a>
        <span class="scope-badge {st.scope}">{st.scope.toUpperCase()}</span>
      </li>
    {/each}
  </ul>
{/if}

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

  .search-row {
    padding: 20px 40px;
    border-bottom: var(--st-rule-thin);
  }
  .search-input {
    width: 100%;
    padding: 12px 14px;
    border: var(--st-rule-medium);
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 13px;
    letter-spacing: 0.08em;
  }
  .search-input:focus {
    outline: 2px solid var(--st-cobalt);
    outline-offset: -2px;
  }

  .grid {
    list-style: none;
    margin: 0;
    padding: 24px 40px 40px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
  }
  .card {
    position: relative;
    border: var(--st-rule-medium);
    background: var(--st-bg);
    display: flex;
    flex-direction: column;
  }
  .card-link {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
  }
  .card-link:hover { background: var(--st-bg-deep); }
  .card-preview {
    aspect-ratio: 16 / 9;
    border-bottom: var(--st-rule-thin);
    overflow: hidden;
    background: var(--st-bg-deep);
  }
  .card-meta {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .card-name {
    font-family: var(--st-font-display);
    font-size: 20px;
    letter-spacing: -0.02em;
  }
  .card-code {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--st-ink-dim);
  }

  .scope-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.18em;
    padding: 3px 8px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
  }
  .scope-badge.deck {
    background: var(--st-cobalt);
    color: var(--st-bg);
    border-color: var(--st-cobalt);
  }

  .empty {
    padding: 40px;
    font-family: var(--st-font-mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    color: var(--st-ink-dim);
    text-align: center;
  }

  @media (max-width: 768px) {
    .head-band { grid-template-columns: 1fr; }
    .head-index { display: none; }
    .head-title { padding: 20px; }
    h1 { font-size: clamp(40px, 12vw, 76px); }
    .search-row { padding: 14px 16px; }
    .grid {
      padding: 16px;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
    }
    .card-meta { padding: 10px 12px; }
    .card-name { font-size: 17px; }
  }
</style>
