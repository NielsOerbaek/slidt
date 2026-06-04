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
    <div class="share-actions">
      <span class="share-badge">{t('share.view_only')}</span>
      <a class="share-pdf-btn" href="/share/{data.token}/export" download="{data.deck.title}.pdf">
        {t('share.download_pdf')}
      </a>
    </div>
  </div>
  <div class="deck-wrap">
    <iframe
      srcdoc={data.renderedHtml}
      title={data.deck.title}
      sandbox="allow-same-origin allow-scripts"
      allowfullscreen
      class="deck-frame"
    ></iframe>
  </div>
</div>

<style>
  :global(body) { margin: 0; background: #000; }
  .share-view { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  .share-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: var(--st-ink);
    color: var(--st-bg);
    border-bottom: 3px solid var(--st-cobalt);
    font-family: var(--st-font-mono);
    flex-shrink: 0;
  }
  .share-title {
    font-family: var(--st-font-display);
    font-size: 18px;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  .share-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .share-badge {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    background: var(--st-cobalt);
    color: var(--st-bg);
    padding: 4px 10px;
  }
  .share-pdf-btn {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--st-bg);
    border: 1px solid rgba(255,255,255,.35);
    padding: 4px 12px;
    transition: border-color .15s, color .15s;
  }
  .share-pdf-btn:hover {
    border-color: rgba(255,255,255,.8);
    color: #fff;
  }

  .deck-wrap {
    flex: 1;
    overflow: hidden;
    background: #000;
  }
  .deck-frame {
    border: none;
    width: 100%;
    height: 100%;
    display: block;
  }

  @media (max-width: 768px) {
    .share-header { padding: 8px 14px; }
    .share-title { font-size: 15px; }
    .share-badge { display: none; }
  }
</style>
