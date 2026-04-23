<script lang="ts">
  import type { PageData } from './$types.js';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.deck.title} — slidt</title>
</svelte:head>

<div class="share-view">
  <div class="share-header">
    <span class="share-title">{data.deck.title}</span>
    <span class="share-badge">View only</span>
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
  :global(body) { margin: 0; background: #1a1a2e; }
  .share-view { display: flex; flex-direction: column; min-height: 100vh; }
  .share-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 24px;
    background: rgba(255,255,255,0.05);
    color: white;
  }
  .share-title { font-weight: 600; font-size: 15px; }
  .share-badge { font-size: 11px; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px; color: rgba(255,255,255,0.6); }
  .deck-wrap {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px;
    overflow-y: auto;
  }
  .deck-frame {
    border: none;
    width: 1920px;
    /* Height is set to auto-expand via content but we give a tall default */
    height: 100%;
    min-height: 1080px;
    transform-origin: top center;
    /* Scale to fit viewport width */
    transform: scale(calc((100vw - 64px) / 1920));
    margin-bottom: calc((100vw - 64px) / 1920 * 1080px - 1080px);
  }
</style>
