<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Field } from '../../renderer/types.ts';
  import { t } from '$lib/i18n/index.ts';

  let { field, value, onchange, deckId }: {
    field: Field;
    value: unknown;
    onchange: (v: unknown) => void;
    deckId: string;
  } = $props();

  type ImageValue = {
    id: string;
    cropX: number;
    cropY: number;
    cropW: number;
    cropH: number;
    rotate: number;
  };

  function parseValue(v: unknown): ImageValue | null {
    if (typeof v === 'string' && v) {
      return { id: v, cropX: 0, cropY: 0, cropW: 100, cropH: 100, rotate: 0 };
    }
    if (v !== null && typeof v === 'object') {
      const obj = v as Record<string, unknown>;
      if (typeof obj.id === 'string' && obj.id) {
        return {
          id: obj.id,
          cropX: typeof obj.cropX === 'number' ? obj.cropX : 0,
          cropY: typeof obj.cropY === 'number' ? obj.cropY : 0,
          cropW: typeof obj.cropW === 'number' && obj.cropW > 0 ? obj.cropW : 100,
          cropH: typeof obj.cropH === 'number' && obj.cropH > 0 ? obj.cropH : 100,
          rotate: typeof obj.rotate === 'number' ? obj.rotate : 0,
        };
      }
    }
    return null;
  }

  let imgValue = $derived(parseValue(value));
  let uploading = $state(false);
  let uploadError = $state('');
  let editorOpen = $state(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let CropperClass: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cropperInstance: any = null;
  let cropImgEl: HTMLImageElement | undefined = $state();
  // Track which image ID the Cropper was last initialized for. imgValue is a
  // $derived that produces a new object reference on every parent re-render
  // (even when the data is unchanged), which would cause the $effect to re-run
  // and destroy+recreate the Cropper — snapping the crop box back to its
  // default position mid-drag. The guard below prevents that.
  let lastCroppedId = '';

  $effect(() => {
    if (!editorOpen || !cropImgEl || !imgValue) return;

    // Cropper is already live for this image — don't reinitialize.
    if (cropperInstance && lastCroppedId === imgValue.id) return;

    let cancelled = false;
    const snapshot = { ...imgValue }; // plain copy; safe to use after awaits

    (async () => {
      if (!CropperClass) {
        const mod = await import('cropperjs');
        CropperClass = mod.default;
      }
      if (cancelled || !cropImgEl) return;

      cropperInstance?.destroy();
      lastCroppedId = snapshot.id;
      cropperInstance = new CropperClass(cropImgEl, {
        viewMode: 2,
        autoCrop: true,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: false,
        ready() {
          if (!cropImgEl || !snapshot) return;
          if (snapshot.cropW < 100 || snapshot.cropH < 100) {
            const nw = cropImgEl.naturalWidth;
            const nh = cropImgEl.naturalHeight;
            cropperInstance?.setData({
              x: (snapshot.cropX / 100) * nw,
              y: (snapshot.cropY / 100) * nh,
              width: (snapshot.cropW / 100) * nw,
              height: (snapshot.cropH / 100) * nh,
              rotate: snapshot.rotate,
            });
          } else if (snapshot.rotate) {
            cropperInstance?.rotate(snapshot.rotate);
          }
        },
      });
    })();

    return () => { cancelled = true; };
  });

  onDestroy(() => {
    cropperInstance?.destroy();
    cropperInstance = null;
  });

  function doneEditing() {
    if (!cropperInstance || !cropImgEl) { editorOpen = false; return; }
    const data = cropperInstance.getData();
    const nw = cropImgEl.naturalWidth || 1;
    const nh = cropImgEl.naturalHeight || 1;
    const next: ImageValue = {
      id: imgValue!.id,
      cropX: Math.round((data.x / nw) * 1000) / 10,
      cropY: Math.round((data.y / nh) * 1000) / 10,
      cropW: Math.round((data.width / nw) * 1000) / 10,
      cropH: Math.round((data.height / nh) * 1000) / 10,
      rotate: Math.round(data.rotate),
    };
    onchange(next);
    editorOpen = false;
    cropperInstance.destroy();
    cropperInstance = null;
    lastCroppedId = '';
  }

  function cancelEditing() {
    editorOpen = false;
    cropperInstance?.destroy();
    cropperInstance = null;
    lastCroppedId = '';
  }

  function setAspectRatio(ratio: number) { cropperInstance?.setAspectRatio(ratio); }
  function rotateCCW() { cropperInstance?.rotate(-90); }
  function rotateCW() { cropperInstance?.rotate(90); }
  function resetCrop() { cropperInstance?.reset(); }

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
      onchange({ id: asset.id, cropX: 0, cropY: 0, cropW: 100, cropH: 100, rotate: 0 });
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

{#if editorOpen && imgValue}
  <div class="img-editor-overlay" role="dialog" aria-modal="true" aria-label={t('imageEditor.title')}>
    <div class="img-editor-toolbar">
      <span class="editor-title">{t('imageEditor.title')}</span>
      <div class="toolbar-group">
        <button type="button" onclick={() => setAspectRatio(NaN)}>{t('imageEditor.cropFree')}</button>
        <button type="button" onclick={() => setAspectRatio(16 / 9)}>{t('imageEditor.crop16x9')}</button>
        <button type="button" onclick={() => setAspectRatio(4 / 3)}>{t('imageEditor.crop4x3')}</button>
        <button type="button" onclick={() => setAspectRatio(1)}>{t('imageEditor.crop1x1')}</button>
      </div>
      <div class="toolbar-group">
        <button type="button" onclick={rotateCCW} title={t('imageEditor.rotateCCW')}>↺</button>
        <button type="button" onclick={rotateCW} title={t('imageEditor.rotateCW')}>↻</button>
      </div>
      <div class="toolbar-group">
        <button type="button" onclick={resetCrop}>{t('imageEditor.reset')}</button>
      </div>
      <div class="toolbar-group">
        <button type="button" class="cancel-btn" onclick={cancelEditing}>✕</button>
        <button type="button" class="done-btn" onclick={doneEditing}>{t('imageEditor.done')}</button>
      </div>
    </div>
    <div class="img-editor-canvas">
      <img
        bind:this={cropImgEl}
        src="/api/assets/{imgValue.id}"
        alt=""
        crossorigin="anonymous"
      />
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
      <button type="button" onclick={() => { editorOpen = true; }}>{t('imageUpload.editButton')}</button>
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
  .done-btn { border-color: #005fff !important; color: #005fff !important; font-weight: 600; }
  .done-btn:hover { background: #005fff !important; color: #fff !important; }
  .cancel-btn { opacity: 0.6; }
  .img-editor-canvas {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .img-editor-canvas img {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  @media (max-width: 768px) {
    .drop-zone { padding: 16px 12px; }
    .drag-hint { display: none; }
    .img-actions { flex-direction: column; }
    .img-editor-toolbar { overflow-x: auto; flex-wrap: nowrap; padding: 8px 12px; }
    .editor-title { display: none; }
  }
</style>
