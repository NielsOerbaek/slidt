<script lang="ts">
  import type { PageData } from './$types.js';
  import { t } from '$lib/i18n/index.ts';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.deck.title} — slidt</title>
</svelte:head>

<div class="share-view">
  <div class="share-header">
    <span class="share-title">{data.deck.title}</span>
    <span class="share-badge">{t('share.view_only')}</span>
  </div>
  <div class="deck-wrap">
    <iframe
      srcdoc={data.renderedHtml}
      title={data.deck.title}
      sandbox="allow-same-origin"
      class="deck-frame"
    ></iframe>
  </div>
</div>

<style>
  :global(body) { margin: 0; background: var(--st-ink); }
  .share-view { display: flex; flex-direction: column; min-height: 100vh; }
  .share-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 24px;
    background: var(--st-ink);
    color: var(--st-bg);
    border-bottom: 3px solid var(--st-cobalt);
    font-family: var(--st-font-mono);
  }
  .share-title {
    font-family: var(--st-font-display);
    font-size: 22px;
    letter-spacing: -0.02em;
  }
  .share-badge {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    background: var(--st-cobalt);
    color: var(--st-bg);
    padding: 4px 10px;
  }
  .deck-wrap {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px;
    overflow-y: auto;
    background: var(--st-ink);
  }
  .deck-frame {
    border: none;
    width: 1920px;
    height: 100%;
    min-height: 1080px;
    transform-origin: top center;
    transform: scale(calc((100vw - 64px) / 1920));
    margin-bottom: calc((100vw - 64px) / 1920 * 1080px - 1080px);
  }
</style>
