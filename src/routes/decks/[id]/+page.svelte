<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import type { PageData } from './$types.js';
  import FieldEditor from '$lib/components/FieldEditor.svelte';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { debounce } from '$lib/utils/debounce.ts';
  import { buildDefaultData } from '$lib/utils/field-defaults.ts';
  import AgentPanel from '$lib/components/AgentPanel.svelte';

  let { data }: { data: PageData } = $props();

  // Local mutable slide data keyed by slide ID (initialized once from server)
  let slideDataMap = $state<Record<string, Record<string, unknown>>>(
    Object.fromEntries(
      data.slides.map((s) => [s.id, { ...(s.data as Record<string, unknown>) }]),
    ),
  );

  let selectedSlideId = $state<string | null>(data.slides[0]?.id ?? null);
  let saving = $state(false);
  let saveError = $state('');
  let showTypePicker = $state(false);
  let showAgent = $state(false);

  // When new slides arrive from server (after invalidateAll), add them to the map
  $effect(() => {
    for (const slide of data.slides) {
      if (!(slide.id in slideDataMap)) {
        slideDataMap[slide.id] = { ...(slide.data as Record<string, unknown>) };
      }
    }
  });

  let selectedSlide = $derived(data.slides.find((s) => s.id === selectedSlideId) ?? null);
  let selectedType = $derived(
    selectedSlide ? data.slideTypes.find((t) => t.id === selectedSlide!.typeId) ?? null : null,
  );
  let selectedData = $derived(
    selectedSlideId ? (slideDataMap[selectedSlideId] ?? {}) : {},
  );

  const autosave = debounce(async (slideId: string, slideData: Record<string, unknown>) => {
    saving = true;
    saveError = '';
    try {
      const res = await fetch(`/api/decks/${data.deck.id}/slides/${slideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: slideData }),
      });
      if (!res.ok) saveError = 'Save failed';
    } catch {
      saveError = 'Save failed';
    } finally {
      saving = false;
    }
  }, 500);

  function handleFieldChange(newData: Record<string, unknown>) {
    if (!selectedSlideId) return;
    slideDataMap[selectedSlideId] = newData;
    autosave(selectedSlideId, newData);
  }

  async function deleteSlide(slideId: string) {
    await fetch(`/api/decks/${data.deck.id}/slides/${slideId}`, { method: 'DELETE' });
    if (selectedSlideId === slideId) {
      const remaining = data.slides.filter((s) => s.id !== slideId);
      selectedSlideId = remaining[0]?.id ?? null;
    }
    await invalidateAll();
  }

  // Drag-reorder state
  let draggedId = $state<string | null>(null);

  function onDragStart(slideId: string) { draggedId = slideId; }
  function onDragOver(e: DragEvent) { e.preventDefault(); }

  async function onDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) { draggedId = null; return; }
    const order = [...data.deck.slideOrder];
    const from = order.indexOf(draggedId);
    const to = order.indexOf(targetId);
    if (from < 0 || to < 0) { draggedId = null; return; }
    order.splice(from, 1);
    order.splice(to, 0, draggedId);
    draggedId = null;
    await fetch(`/api/decks/${data.deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideOrder: order }),
    });
    await invalidateAll();
  }

  async function addSlide(typeId: string) {
    const type = data.slideTypes.find((t) => t.id === typeId);
    const defaults = type ? buildDefaultData(type.fields) : {};
    const res = await fetch(`/api/decks/${data.deck.id}/slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typeId, data: defaults }),
    });
    if (res.ok) {
      const { slide } = await res.json();
      slideDataMap[slide.id] = defaults;
      showTypePicker = false;
      await invalidateAll();
      selectedSlideId = slide.id;
    }
  }

  // ── Resizable panels ────────────────────────────────────────────
  let listWidth = $state(200);
  let formWidth = $state(300);
  let previewPct = $state(62); // % of right panel height for preview

  type ResizeKind = 'list' | 'form' | 'vertical';
  let resizing = $state<ResizeKind | null>(null);
  let resizeStart = $state({ mouse: 0, val: 0 });
  let rightPanel = $state<HTMLDivElement | undefined>(undefined);

  function startHResize(panel: 'list' | 'form', e: MouseEvent) {
    e.preventDefault();
    resizing = panel;
    resizeStart = { mouse: e.clientX, val: panel === 'list' ? listWidth : formWidth };
  }

  function startVResize(e: MouseEvent) {
    e.preventDefault();
    resizing = 'vertical';
    resizeStart = { mouse: e.clientY, val: previewPct };
  }

  function onMouseMove(e: MouseEvent) {
    if (!resizing) return;
    if (resizing === 'list') {
      listWidth = Math.max(140, Math.min(480, resizeStart.val + (e.clientX - resizeStart.mouse)));
    } else if (resizing === 'form') {
      formWidth = Math.max(180, Math.min(600, resizeStart.val + (e.clientX - resizeStart.mouse)));
    } else if (resizing === 'vertical' && rightPanel) {
      const h = rightPanel.clientHeight;
      previewPct = Math.max(20, Math.min(85, resizeStart.val + ((e.clientY - resizeStart.mouse) / h) * 100));
    }
  }

  function stopResize() { resizing = null; }
</script>

<svelte:head><title>{data.deck.title} — slidt</title></svelte:head>
<svelte:window onmousemove={onMouseMove} onmouseup={stopResize} />

<div class="editor" class:resizing-h={resizing === 'list' || resizing === 'form'} class:resizing-v={resizing === 'vertical'}>
  <!-- Toolbar -->
  <div class="toolbar">
    <a href="/decks" class="back">← Decks</a>
    <span class="deck-title">{data.deck.title}</span>
    <span class="save-status">
      {#if saving}Saving…{:else if saveError}<span class="err">{saveError}</span>{:else}Saved{/if}
    </span>
    <button class="agent-toggle" onclick={() => showAgent = !showAgent}>
      {showAgent ? 'Close agent' : 'Agent ✦'}
    </button>
  </div>

  <div class="editor-body">
    <!-- Slide list -->
    <aside class="slide-list" style="width: {listWidth}px">
      {#each data.slides as slide (slide.id)}
        {@const type = data.slideTypes.find((t) => t.id === slide.typeId)}
        <div
          class="slide-item {selectedSlideId === slide.id ? 'selected' : ''} {draggedId === slide.id ? 'dragging' : ''}"
          role="button"
          tabindex="0"
          onclick={() => selectedSlideId = slide.id}
          onkeydown={(e) => e.key === 'Enter' && (selectedSlideId = slide.id)}
          draggable="true"
          ondragstart={() => onDragStart(slide.id)}
          ondragover={onDragOver}
          ondrop={() => onDrop(slide.id)}
        >
          <span class="slide-label">{type?.label ?? 'Unknown type'}</span>
          <button
            class="del"
            onclick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }}
            aria-label="Delete slide"
          >×</button>
        </div>
      {/each}
      <button class="add-slide-btn" onclick={() => showTypePicker = true}>+ Add slide</button>
    </aside>

    <div class="resize-handle" class:active={resizing === 'list'} onmousedown={(e) => startHResize('list', e)} role="separator" aria-orientation="vertical"></div>

    <!-- Form editor -->
    <main class="form-panel" style="width: {formWidth}px">
      {#if selectedSlide && selectedType}
        <div class="form-type-label">{selectedType.label}</div>
        <div class="fields">
          {#each selectedType.fields as field}
            <div class="field-row">
              <label class="field-label">{field.label ?? field.name}</label>
              <FieldEditor
                {field}
                value={selectedData[field.name]}
                onchange={(v) => handleFieldChange({ ...selectedData, [field.name]: v })}
              />
            </div>
          {/each}
        </div>
      {:else}
        <div class="form-empty">
          {data.slides.length === 0 ? 'Add a slide to get started.' : 'Select a slide to edit.'}
        </div>
      {/if}
    </main>

    <div class="resize-handle" class:active={resizing === 'form'} onmousedown={(e) => startHResize('form', e)} role="separator" aria-orientation="vertical"></div>

    <!-- Right panel: preview on top, agent below -->
    <div class="right-panel" bind:this={rightPanel}>
      <section class="preview-panel" style="flex-basis: {showAgent ? previewPct + '%' : '100%'}">
        <SlidePreview
          slideType={selectedType}
          slideData={selectedData}
          theme={data.theme}
        />
      </section>

      {#if showAgent}
        <div class="resize-handle-h" class:active={resizing === 'vertical'} onmousedown={startVResize} role="separator" aria-orientation="horizontal"></div>
        <aside class="agent-panel">
          <div class="agent-header">
            <span>Agent</span>
            <button onclick={() => showAgent = false}>×</button>
          </div>
          <AgentPanel deckId={data.deck.id} themeId={data.deck.themeId} onclose={() => showAgent = false} />
        </aside>
      {/if}
    </div>
  </div>
</div>

<!-- Type picker overlay -->
{#if showTypePicker}
  <div class="overlay" role="dialog" aria-modal="true">
    <div class="picker-card">
      <div class="picker-header">
        <h3>Add slide</h3>
        <button onclick={() => showTypePicker = false}>×</button>
      </div>
      <div class="type-grid">
        {#each data.slideTypes.filter(t => t.scope === 'global' || t.deckId === data.deck.id) as type}
          <button class="type-tile" onclick={() => addSlide(type.id)}>
            <span class="type-tile-label">{type.label}</span>
            <span class="type-tile-name">{type.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .editor { display: flex; flex-direction: column; height: calc(100vh - 52px); overflow: hidden; }
  .editor.resizing-h { cursor: col-resize; user-select: none; }
  .editor.resizing-v { cursor: row-resize; user-select: none; }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 20px;
    height: 48px;
    background: white;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }
  .back { font-size: 13px; color: #6e31ff; text-decoration: none; }
  .deck-title { font-weight: 600; font-size: 15px; }
  .save-status { font-size: 12px; color: #aaa; margin-left: auto; }
  .err { color: #c00; }
  .agent-toggle { background: #6e31ff; color: white; border: none; border-radius: 6px; padding: 6px 14px; font-size: 13px; cursor: pointer; }

  /* ── Editor body ──────────────────────────────────────────────── */
  .editor-body { display: flex; flex: 1; overflow: hidden; }

  /* ── Vertical resize handles ────────────────────────────────── */
  .resize-handle {
    width: 4px;
    flex-shrink: 0;
    cursor: col-resize;
    background: #e8e8ee;
    transition: background 0.15s;
  }
  .resize-handle:hover, .resize-handle.active { background: #6e31ff; }

  /* ── Horizontal resize handle (preview / agent split) ──────── */
  .resize-handle-h {
    height: 4px;
    flex-shrink: 0;
    cursor: row-resize;
    background: #e8e8ee;
    transition: background 0.15s;
  }
  .resize-handle-h:hover, .resize-handle-h.active { background: #6e31ff; }

  /* ── Slide list ─────────────────────────────────────────────── */
  .slide-list {
    flex-shrink: 0;
    overflow-y: auto;
    background: #fafafc;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
  }
  .slide-item {
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid transparent;
    user-select: none;
  }
  .slide-item:hover { background: #ede8ff; }
  .slide-item.selected { background: #ede8ff; border-color: #6e31ff; }
  .slide-item.dragging { opacity: 0.4; }
  .slide-label { font-size: 13px; }
  .del { background: none; border: none; color: #ccc; font-size: 16px; cursor: pointer; padding: 0 4px; }
  .del:hover { color: #e00; }
  .add-slide-btn {
    margin-top: 8px;
    padding: 8px;
    background: none;
    border: 1px dashed #ccc;
    border-radius: 6px;
    font-size: 13px;
    color: #666;
    cursor: pointer;
  }
  .add-slide-btn:hover { border-color: #6e31ff; color: #6e31ff; }

  /* ── Form panel ─────────────────────────────────────────────── */
  .form-panel { flex-shrink: 0; overflow-y: auto; padding: 20px 24px; min-width: 180px; }
  .form-type-label { font-size: 11px; font-weight: 600; color: #6e31ff; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
  .fields { display: flex; flex-direction: column; gap: 16px; }
  .field-row { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 13px; font-weight: 500; color: #555; text-transform: capitalize; }
  .form-empty { display: flex; align-items: center; justify-content: center; height: 200px; color: #aaa; font-size: 14px; }

  /* ── Right panel (preview + agent) ─────────────────────────── */
  .right-panel {
    flex: 1;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .preview-panel {
    flex-shrink: 0;
    overflow-y: auto;
    padding: 16px;
    background: #f5f4fb;
  }

  /* ── Agent panel ────────────────────────────────────────────── */
  .agent-panel {
    flex: 1;
    min-height: 150px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: white;
    border-top: none;
  }
  .agent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid #eee;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
  }
  .agent-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: #888; }

  /* ── Type picker overlay ────────────────────────────────────── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }
  .picker-card {
    background: white;
    border-radius: 12px;
    width: 560px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 24px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.2);
  }
  .picker-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .picker-header h3 { margin: 0; font-size: 18px; }
  .picker-header button { background: none; border: none; font-size: 22px; cursor: pointer; color: #888; }
  .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .type-tile {
    padding: 12px;
    background: #f9f9fb;
    border: 1px solid #eee;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .type-tile:hover { border-color: #6e31ff; background: #f0eeff; }
  .type-tile-label { font-size: 13px; font-weight: 600; color: #1a1a2e; }
  .type-tile-name { font-size: 11px; color: #888; font-family: monospace; }
</style>
