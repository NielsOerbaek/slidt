<script lang="ts">
  import type { SlideType, Theme } from '../../renderer/types.ts';
  import { render } from '../../renderer/index.ts';

  let { slideType, slideData, theme, label = 'Slide preview' }: {
    slideType: SlideType | null;
    slideData: Record<string, unknown>;
    theme: Theme | null;
    label?: string;
  } = $props();

  let previewHtml = $state('');
  let container: HTMLDivElement | undefined = $state();
  let scale = $state(0.25);
  let renderTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    // Capture reactive dependencies
    const st = slideType;
    const sd = { ...slideData };
    const th = theme;

    if (!st || !th) { previewHtml = ''; return; }

    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(async () => {
      try {
        const deck = {
          title: 'Preview',
          lang: 'da',
          slides: [{ typeName: st.name, data: sd }],
        };
        previewHtml = await render(deck, th, [st], { skipAppendixList: true });
      } catch {
        previewHtml = '';
      }
      renderTimer = null;
    }, 100);

    return () => {
      if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
    };
  });

  $effect(() => {
    if (!container) return;
    const ro = new ResizeObserver(() => {
      if (container) scale = container.clientWidth / 1920;
    });
    ro.observe(container);
    // Initial scale
    scale = container.clientWidth / 1920;
    return () => ro.disconnect();
  });
</script>

<div class="preview-wrap" bind:this={container}>
  {#if previewHtml}
    <iframe
      srcdoc={previewHtml}
      title={label}
      sandbox="allow-same-origin"
      style="
        width: 1920px;
        height: 1080px;
        border: none;
        transform: scale({scale});
        transform-origin: top left;
        display: block;
      "
    ></iframe>
    <!-- Reserve height proportional to 1920x1080 -->
    <div style="height: {1080 * scale}px;"></div>
  {:else}
    <div class="empty">{slideType ? 'Rendering…' : 'Select a slide to preview'}</div>
  {/if}
</div>

<style>
  .preview-wrap {
    width: 100%;
    overflow: hidden;
    background: #e8e8f0;
    border-radius: 8px;
    min-height: 120px;
    position: relative;
  }
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #999;
    font-size: 14px;
  }
</style>
