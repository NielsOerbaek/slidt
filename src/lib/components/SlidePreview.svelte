<script lang="ts">
  import type { SlideType, Theme } from '../../renderer/types.ts';
  import { render } from '../../renderer/index.ts';

  let { slideType, slideData, theme, label = 'Slide preview', editable = false, onedit }: {
    slideType: SlideType | null;
    slideData: Record<string, unknown>;
    theme: Theme | null;
    label?: string;
    editable?: boolean;
    onedit?: (field: string, value: string) => void;
  } = $props();

  let previewHtml = $state('');
  let container: HTMLDivElement | undefined = $state();
  let iframe: HTMLIFrameElement | undefined = $state();
  let scale = $state(0.25);
  let renderTimer: ReturnType<typeof setTimeout> | null = null;

  // Attach contenteditable + listeners to data-slidt-field nodes inside the
  // iframe directly from the parent. This relies on the iframe having
  // allow-same-origin — and it lets us avoid `allow-scripts`, which combined
  // with allow-same-origin would otherwise let the iframe escape the sandbox.
  function attachEditors() {
    if (!editable || !iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const nodes = doc.querySelectorAll<HTMLElement>('[data-slidt-field]');
    nodes.forEach((el) => {
      if (el.dataset.slidtAttached) return;
      el.dataset.slidtAttached = '1';
      el.contentEditable = 'true';
      el.spellcheck = true;
      el.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter' && !(e as KeyboardEvent).shiftKey) {
          e.preventDefault();
          el.blur();
        }
        if ((e as KeyboardEvent).key === 'Escape') {
          e.preventDefault();
          el.blur();
        }
      });
      el.addEventListener('blur', () => {
        const field = el.dataset.slidtField;
        if (typeof field !== 'string') return;
        onedit?.(field, el.innerText);
      });
    });
  }

  function onIframeLoad() {
    attachEditors();
  }

  $effect(() => {
    // Capture reactive dependencies
    const st = slideType;
    const sd = { ...slideData };
    const th = theme;
    const isEditable = editable;

    if (!st || !th) { previewHtml = ''; return; }

    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(async () => {
      try {
        const deck = {
          title: 'Preview',
          lang: 'da',
          slides: [{ typeName: st.name, data: sd }],
        };
        const html = await render(deck, th, [st], {
          skipAppendixList: true,
          skipValidation: true,
          editable: isEditable,
        });
        // Inject font-face rules (iframe has allow-same-origin so it can load from /fonts/)
        previewHtml = html.replace('<style>', `<style>
@font-face{font-family:'Neureal';font-weight:400;font-style:normal;src:url('/fonts/Neureal-Regular.woff2') format('woff2')}
@font-face{font-family:'Neureal Mono';font-weight:400;font-style:normal;src:url('/fonts/NeurealMono-Regular.woff2') format('woff2')}
@font-face{font-family:'Inter';font-weight:300;font-style:normal;src:url('/fonts/inter/inter-latin-300-normal.woff2') format('woff2')}
@font-face{font-family:'Inter';font-weight:400;font-style:normal;src:url('/fonts/inter/inter-latin-400-normal.woff2') format('woff2')}
@font-face{font-family:'Inter';font-weight:500;font-style:normal;src:url('/fonts/inter/inter-latin-500-normal.woff2') format('woff2')}
@font-face{font-family:'Inter';font-weight:600;font-style:normal;src:url('/fonts/inter/inter-latin-600-normal.woff2') format('woff2')}
`);
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
      bind:this={iframe}
      srcdoc={previewHtml}
      title={label}
      sandbox="allow-same-origin"
      onload={onIframeLoad}
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 1920px;
        height: 1080px;
        border: none;
        transform: scale({scale});
        transform-origin: top left;
        display: block;
      "
    ></iframe>
    <!-- Reserve height proportional to 1920x1080 (iframe is absolute → doesn't contribute) -->
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
