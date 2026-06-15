<script lang="ts">
  import type { Field } from '../../renderer/types.ts';
  import {
    FITS,
    MIN_ZOOM,
    MAX_ZOOM,
    toFitImage,
    serializeFit,
    fitDefaults,
    applyDrag,
    clamp,
    type FitImage,
    type ImageFit,
  } from '../../renderer/image-transform.ts';
  import { t } from '$lib/i18n/index.ts';

  let { field, value, onchange, deckId }: {
    field: Field;
    value: unknown;
    onchange: (v: unknown) => void;
    deckId: string;
  } = $props();

  // Suppress unused-prop lint; kept for API symmetry with other field editors.
  void field;

  let imgValue = $derived(toFitImage(value));
  let uploading = $state(false);
  let uploadError = $state('');
  let editorOpen = $state(false);

  // Working copy edited inside the modal; committed on "done".
  let work = $state<FitImage | null>(null);
  let frameEl: HTMLElement | undefined = $state();

  const fitLabels: Record<ImageFit, string> = {
    contain: 'imageEditor.fitContain',
    cover: 'imageEditor.fitCover',
    fill: 'imageEditor.fitFill',
  };

  let previewStyle = $derived(
    work
      ? `object-fit:${work.fit};object-position:${work.posX}% ${work.posY}%;` +
          `transform:scale(${work.zoom}) rotate(${work.rotate}deg);` +
          `transform-origin:${work.posX}% ${work.posY}%;`
      : '',
  );

  function openEditor() {
    if (!imgValue) return;
    work = { ...imgValue };
    editorOpen = true;
  }
  function cancelEditing() {
    editorOpen = false;
    work = null;
  }
  function doneEditing() {
    if (work) onchange(serializeFit(work));
    editorOpen = false;
    work = null;
  }

  function setFit(fit: ImageFit) { if (work) work = { ...work, fit }; }
  function setZoom(z: number) { if (work) work = { ...work, zoom: clamp(z, MIN_ZOOM, MAX_ZOOM) }; }
  function rotateBy(deg: number) { if (work) work = { ...work, rotate: work.rotate + deg }; }
  function resetTransform() { if (work) work = fitDefaults(work.id); }

  // --- drag-to-reposition ---
  let dragging = $state(false);
  let lastX = 0, lastY = 0;

  function onPointerDown(e: PointerEvent) {
    if (!work) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent) {
    if (!dragging || !work || !frameEl) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    const { posX, posY } = applyDrag(
      work.posX, work.posY, dx, dy, frameEl.clientWidth, frameEl.clientHeight,
    );
    work = { ...work, posX, posY };
  }
  function onPointerUp(e: PointerEvent) {
    dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0]!;
    uploadError = '';
    if (!file.type.startsWith('image/')) {
      uploadError = t('imageUpload.invalidType');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      uploadError = t('imageUpload.tooLarge');
      return;
    }
    uploading = true;
    try {
      const fd = new FormData();
      fd.set('deckId', deckId);
      fd.set('kind', 'image');
      fd.set('file', file);
      const res = await fetch('/api/assets', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const asset = (await res.json()) as { id: string };
      onchange(serializeFit(fitDefaults(asset.id)));
    } catch (e) {
      uploadError = String(e);
    } finally {
      uploading = false;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer?.files ?? null);
  }

  function removeImage() { onchange(''); }

  let fileInput: HTMLInputElement | undefined = $state();
</script>

{#if editorOpen && work}
  <div class="img-editor-overlay" role="dialog" aria-modal="true" aria-label={t('imageEditor.title')}>
    <div class="img-editor-toolbar">
      <span class="editor-title">{t('imageEditor.title')}</span>
      <div class="toolbar-group" role="group" aria-label={t('imageEditor.fit')}>
        {#each FITS as fit (fit)}
          <button
            type="button"
            class:active={work.fit === fit}
            onclick={() => setFit(fit)}
          >{t(fitLabels[fit])}</button>
        {/each}
      </div>
      <div class="toolbar-group zoom-group">
        <span class="zoom-label">{t('imageEditor.zoom')}</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step="0.1"
          value={work.zoom}
          oninput={(e) => setZoom(Number((e.currentTarget as HTMLInputElement).value))}
          aria-label={t('imageEditor.zoom')}
        />
        <span class="zoom-val">{Math.round(work.zoom * 100)}%</span>
      </div>
      <div class="toolbar-group">
        <button type="button" onclick={() => rotateBy(-90)} title={t('imageEditor.rotateCCW')}>↺</button>
        <button type="button" onclick={() => rotateBy(90)} title={t('imageEditor.rotateCW')}>↻</button>
      </div>
      <div class="toolbar-group">
        <button type="button" onclick={resetTransform}>{t('imageEditor.reset')}</button>
      </div>
      <div class="toolbar-group">
        <button type="button" class="cancel-btn" onclick={cancelEditing}>✕</button>
        <button type="button" class="done-btn" onclick={doneEditing}>{t('imageEditor.done')}</button>
      </div>
    </div>
    <div class="img-editor-canvas">
      <div
        class="preview-frame"
        class:dragging
        bind:this={frameEl}
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        role="application"
        aria-label={t('imageEditor.positionHint')}
      >
        <img src="/api/assets/{work.id}" alt="" style={previewStyle} draggable="false" />
      </div>
      <p class="position-hint">{t('imageEditor.positionHint')}</p>
    </div>
  </div>
{/if}

<div class="img-field" class:has-image={!!imgValue} class:is-uploading={uploading}>
  {#if imgValue}
    <div class="img-preview">
      <img src="/api/assets/{imgValue.id}" alt="" class="thumb" />
      {#if uploading}
        <div class="upload-overlay">{t('imageUpload.uploading')}</div>
      {/if}
      <button
        type="button"
        class="remove-btn"
        onclick={removeImage}
        aria-label={t('imageUpload.removeButton')}
      >×</button>
    </div>
    <div class="img-actions">
      <button type="button" onclick={() => fileInput?.click()}>{t('imageUpload.replaceButton')}</button>
      <button type="button" onclick={openEditor}>{t('imageUpload.editButton')}</button>
    </div>
  {:else}
    <div
      class="drop-zone"
      ondrop={handleDrop}
      ondragover={(e) => e.preventDefault()}
      role="button"
      tabindex="0"
      onclick={() => fileInput?.click()}
      onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
    >
      <span class="upload-icon">↑</span>
      <span class="upload-label">{t('imageUpload.uploadButton')}</span>
      <span class="drag-hint">{t('imageUpload.dragDrop')}</span>
    </div>
  {/if}

  {#if uploadError}
    <div class="upload-error">{uploadError}</div>
  {/if}
</div>

<input
  bind:this={fileInput}
  type="file"
  accept="image/*"
  style="display:none"
  onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
/>

<style>
  .img-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 2px dashed var(--st-ink);
    padding: 24px 16px;
    cursor: pointer;
    text-align: center;
    color: var(--st-dim, #666);
    font-size: 13px;
    transition: border-color 0.15s;
  }
  .drop-zone:hover { border-color: var(--st-cobalt, #005fff); color: var(--st-ink); }
  .upload-icon { font-size: 20px; opacity: 0.5; }
  .upload-label { font-weight: 500; color: var(--st-ink); }
  .drag-hint { font-size: 11px; opacity: 0.5; }

  .img-preview {
    position: relative;
    aspect-ratio: 16 / 9;
    background: var(--st-muted, #111);
    overflow: hidden;
  }
  .thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .upload-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
    color: #fff;
    font-size: 13px;
  }
  .remove-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    line-height: 1;
  }
  .remove-btn:hover { background: rgba(200,0,0,0.8); }

  .img-actions {
    display: flex;
    gap: 6px;
  }
  .img-actions button {
    flex: 1;
    padding: 6px 10px;
    border: 2px solid var(--st-ink);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .img-actions button:hover { background: var(--st-ink); color: var(--st-bg); }

  .upload-error {
    color: #c00;
    font-size: 12px;
    padding: 4px 0;
  }

  .img-editor-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #111;
    display: flex;
    flex-direction: column;
  }
  .img-editor-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .editor-title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-right: 8px;
  }
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .toolbar-group button {
    padding: 5px 10px;
    border: 1px solid #444;
    color: #ccc;
    font-size: 12px;
    cursor: pointer;
    background: transparent;
    transition: background 0.1s, color 0.1s;
  }
  .toolbar-group button:hover { background: #333; color: #fff; }
  .toolbar-group button.active {
    background: #005fff;
    border-color: #005fff;
    color: #fff;
  }
  .zoom-group { gap: 8px; }
  .zoom-label, .zoom-val {
    font-size: 12px;
    color: #ccc;
  }
  .zoom-val { min-width: 38px; text-align: right; }
  .zoom-group input[type="range"] { width: 120px; }
  .done-btn { border-color: #005fff !important; color: #005fff !important; font-weight: 600; }
  .done-btn:hover { background: #005fff !important; color: #fff !important; }
  .cancel-btn { opacity: 0.6; }
  .img-editor-canvas {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
  }
  .preview-frame {
    position: relative;
    aspect-ratio: 16 / 9;
    width: min(80vw, 1100px);
    max-height: 70vh;
    overflow: hidden;
    background:
      repeating-conic-gradient(#2a2a2a 0% 25%, #222 0% 50%) 50% / 24px 24px;
    border: 1px solid #333;
    cursor: grab;
    touch-action: none;
  }
  .preview-frame.dragging { cursor: grabbing; }
  .preview-frame img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    user-select: none;
    -webkit-user-drag: none;
  }
  .position-hint {
    font-size: 12px;
    color: #888;
    margin: 0;
  }

  @media (max-width: 768px) {
    .drop-zone { padding: 16px 12px; }
    .drag-hint { display: none; }
    .img-actions { flex-direction: column; }
    .img-editor-toolbar { overflow-x: auto; flex-wrap: nowrap; padding: 8px 12px; }
    .editor-title { display: none; }
    .zoom-group input[type="range"] { width: 80px; }
    .preview-frame { width: 92vw; max-height: 50vh; }
    .img-editor-canvas { padding: 12px; }
  }
</style>
