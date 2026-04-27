<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import type { PageData, ActionData } from './$types.js';
  import { enhance } from '$app/forms';
  import FieldEditor from '$lib/components/FieldEditor.svelte';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import STField from '$lib/components/st/STField.svelte';
  import STBtn from '$lib/components/st/STBtn.svelte';
  import STFace from '$lib/components/st/STFace.svelte';
  import STAgentDrawer from '$lib/components/st/STAgentDrawer.svelte';
  import { debounce } from '$lib/utils/debounce.ts';
  import { buildDefaultData, buildDummyData } from '$lib/utils/field-defaults.ts';
  import { slideSnippet } from '$lib/utils/slide-snippet.ts';
  import { t } from '$lib/i18n/index.ts';
  import { goto } from '$app/navigation';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let slideDataMap = $state<Record<string, Record<string, unknown>>>(
    Object.fromEntries(
      data.slides.map((s) => [s.id, { ...(s.data as Record<string, unknown>) }]),
    ),
  );

  let selectedSlideId = $state<string | null>(data.slides[0]?.id ?? null);
  let saving = $state(false);
  let saveError = $state('');
  let showTypePicker = $state(false);
  let showThemePicker = $state(false);
  let exporting = $state(false);
  let lastSavedAt = $state<number>(Date.now());
  let agentOpen = $state(false);
  let mobilePane = $state<'list' | 'edit' | 'preview' | 'agent'>('list');
  let shareUrl = $state('');
  let shareError = $state('');

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
  const selectedIdx = $derived(
    selectedSlideId
      ? data.slides.findIndex((s) => s.id === selectedSlideId)
      : -1,
  );
  const saveLabel = $derived(saving ? t('editor.save_busy') : saveError ? t('editor.save_error') : t('editor.save_idle'));

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
      else lastSavedAt = Date.now();
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

  // Edits that originate from the contenteditable preview iframe. The iframe
  // already shows the new value, so we just update local state + autosave;
  // SlidePreview will re-render after the debounce, putting the new value
  // through fmt() the same way the form-driven path does.
  function handleInlineEdit(field: string, value: string) {
    if (!selectedSlideId) return;
    const current = slideDataMap[selectedSlideId] ?? {};
    const parts = field.split('.');
    if (readDeep(current, parts) === value) return;
    const next = setDeep(current, parts, value);
    if (next === current) return;
    slideDataMap[selectedSlideId] = next as Record<string, unknown>;
    autosave(selectedSlideId, next as Record<string, unknown>);
  }

  function readDeep(obj: unknown, path: string[]): unknown {
    let cur: unknown = obj;
    for (const p of path) {
      if (cur == null) return undefined;
      cur = Array.isArray(cur) ? cur[Number(p)] : (cur as Record<string, unknown>)[p];
    }
    return cur;
  }

  // Immutable deep set — clones each container along the path so Svelte sees a
  // new reference. Returns the input unchanged if the path can't be walked.
  function setDeep(obj: unknown, path: string[], value: unknown): unknown {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    if (obj == null) return obj;
    if (Array.isArray(obj)) {
      const idx = Number(head);
      if (!Number.isInteger(idx) || idx < 0 || idx >= obj.length) return obj;
      const next = obj.slice();
      next[idx] = setDeep(obj[idx], rest, value);
      return next;
    }
    if (typeof obj === 'object') {
      const o = obj as Record<string, unknown>;
      if (!(head! in o)) return obj;
      return { ...o, [head!]: setDeep(o[head!], rest, value) };
    }
    return obj;
  }

  // ── Undo / redo ─────────────────────────────────────────────────────
  // Each user action that mutates the deck pushes an entry. Inverses are
  // expressed as fresh API calls so they run against current backend state.
  // Field-level edits (form/inline) are not stacked — the browser handles
  // input-level undo natively while the user is still in the field.
  interface UndoEntry { label: string; undo: () => Promise<void>; redo: () => Promise<void> }
  let undoStack = $state<UndoEntry[]>([]);
  let redoStack = $state<UndoEntry[]>([]);
  let undoToast = $state<string | null>(null);
  let undoBusy = $state(false);
  let undoToastTimer: ReturnType<typeof setTimeout> | null = null;

  function pushUndo(entry: UndoEntry) {
    undoStack = [...undoStack.slice(-49), entry];
    redoStack = [];
  }
  function flashUndoToast(msg: string) {
    undoToast = msg;
    if (undoToastTimer) clearTimeout(undoToastTimer);
    undoToastTimer = setTimeout(() => { undoToast = null; }, 1800);
  }
  async function runUndo() {
    if (undoBusy || undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1]!;
    undoBusy = true;
    try {
      await entry.undo();
      undoStack = undoStack.slice(0, -1);
      redoStack = [...redoStack, entry];
      flashUndoToast(`${t('editor.undo_label')}: ${entry.label}`);
    } catch (err) {
      console.error('undo failed', err);
      flashUndoToast(t('editor.undo_failed'));
    } finally {
      undoBusy = false;
    }
  }
  async function runRedo() {
    if (undoBusy || redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1]!;
    undoBusy = true;
    try {
      await entry.redo();
      redoStack = redoStack.slice(0, -1);
      undoStack = [...undoStack, entry];
      flashUndoToast(`${t('editor.redo_label')}: ${entry.label}`);
    } catch (err) {
      console.error('redo failed', err);
      flashUndoToast(t('editor.undo_failed'));
    } finally {
      undoBusy = false;
    }
  }

  async function deleteSlide(slideId: string, opts: { skipUndo?: boolean } = {}) {
    const slide = data.slides.find((s) => s.id === slideId);
    const prevIdx = data.deck.slideOrder.indexOf(slideId);
    const prevData = slide ? slideDataMap[slide.id] ?? (slide.data as Record<string, unknown>) : null;
    const prevTypeId = slide?.typeId ?? null;

    await fetch(`/api/decks/${data.deck.id}/slides/${slideId}`, { method: 'DELETE' });
    if (selectedSlideId === slideId) {
      const remaining = data.slides.filter((s) => s.id !== slideId);
      selectedSlideId = remaining[0]?.id ?? null;
    }
    await invalidateAll();

    if (opts.skipUndo || !prevTypeId || !prevData) return;
    let restoredId: string | null = null;
    pushUndo({
      label: t('editor.action_delete_slide'),
      undo: async () => {
        const res = await fetch(`/api/decks/${data.deck.id}/slides`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ typeId: prevTypeId, data: prevData }),
        });
        if (!res.ok) throw new Error('Re-create failed');
        const { slide: newSlide } = await res.json();
        restoredId = newSlide.id;
        // Server appends to slideOrder — move the new slide back to its old index.
        const order = [...data.deck.slideOrder.filter((id) => id !== newSlide.id), newSlide.id]
          .filter((id) => id !== newSlide.id);
        const cleanIdx = Math.max(0, Math.min(prevIdx, order.length));
        order.splice(cleanIdx, 0, newSlide.id);
        await fetch(`/api/decks/${data.deck.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slideOrder: order }),
        });
        slideDataMap[newSlide.id] = prevData;
        await invalidateAll();
        selectedSlideId = newSlide.id;
      },
      redo: async () => {
        if (!restoredId) return;
        await deleteSlide(restoredId, { skipUndo: true });
      },
    });
  }

  // ── Slide-list hover preview ───────────────────────────────────────
  let hoveredSlideId = $state<string | null>(null);
  let hoverTop = $state(0);
  let hoverLeft = $state(0);
  let hoverEnterTimer: ReturnType<typeof setTimeout> | null = null;

  function onSlideRowEnter(e: MouseEvent, slideId: string) {
    if (hoverEnterTimer) clearTimeout(hoverEnterTimer);
    if (draggedId) return; // don't preview while dragging
    const target = e.currentTarget as HTMLElement;
    hoverEnterTimer = setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const previewWidth = 360;
      const previewHeight = previewWidth * (1080 / 1920); // ≈ 202px
      hoverLeft = rect.right + 8;
      // Anchor centered vertically on the row, but clamp to viewport.
      let top = rect.top + rect.height / 2 - previewHeight / 2;
      if (top < 8) top = 8;
      if (top + previewHeight > window.innerHeight - 8) {
        top = window.innerHeight - previewHeight - 8;
      }
      hoverTop = top;
      hoveredSlideId = slideId;
    }, 220);
  }
  function onSlideRowLeave() {
    if (hoverEnterTimer) clearTimeout(hoverEnterTimer);
    hoverEnterTimer = null;
    hoveredSlideId = null;
  }

  const hoveredSlide = $derived(
    hoveredSlideId ? data.slides.find((s) => s.id === hoveredSlideId) ?? null : null,
  );
  const hoveredType = $derived(
    hoveredSlide ? data.slideTypes.find((t) => t.id === hoveredSlide.typeId) ?? null : null,
  );
  const hoveredData = $derived(
    hoveredSlideId ? slideDataMap[hoveredSlideId] ?? {} : {},
  );

  let draggedId = $state<string | null>(null);
  let dropTargetId = $state<string | null>(null);
  let dropPosition = $state<'before' | 'after'>('before');
  // Optimistic reorder: while a PATCH is in flight (or just landed but before
  // invalidateAll has refetched), display the local order so the UI doesn't
  // jump back to the old position.
  let localOrder = $state<string[] | null>(null);
  const displaySlides = $derived.by(() => {
    if (!localOrder) return data.slides;
    const map = new Map(data.slides.map((s) => [s.id, s]));
    const ordered = localOrder.map((id) => map.get(id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
    for (const s of data.slides) {
      if (!localOrder.includes(s.id)) ordered.push(s);
    }
    return ordered;
  });

  function onDragStart(e: DragEvent, slideId: string) {
    draggedId = slideId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      // Some browsers won't initiate a drag without setData.
      e.dataTransfer.setData('text/plain', slideId);
    }
  }

  function onDragOver(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dropPosition = (e.clientY - rect.top) < rect.height / 2 ? 'before' : 'after';
    dropTargetId = targetId;
  }

  function onDragLeave(slideId: string) {
    if (dropTargetId === slideId) dropTargetId = null;
  }

  function onDragEnd() {
    draggedId = null;
    dropTargetId = null;
  }

  async function applySlideOrder(order: string[]) {
    localOrder = order;
    try {
      await fetch(`/api/decks/${data.deck.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideOrder: order }),
      });
      await invalidateAll();
    } finally {
      localOrder = null;
    }
  }

  async function onDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      onDragEnd();
      return;
    }
    const baseOrder = localOrder ?? [...data.deck.slideOrder];
    const order = [...baseOrder];
    const from = order.indexOf(draggedId);
    let to = order.indexOf(targetId);
    if (from < 0 || to < 0) {
      onDragEnd();
      return;
    }
    const movedId = draggedId;
    const insertAfter = dropPosition === 'after';
    onDragEnd();
    order.splice(from, 1);
    if (from < to) to -= 1;
    if (insertAfter) to += 1;
    order.splice(to, 0, movedId);

    const previousOrder = [...baseOrder];
    await applySlideOrder(order);
    pushUndo({
      label: t('editor.action_reorder'),
      undo: async () => { await applySlideOrder(previousOrder); },
      redo: async () => { await applySlideOrder(order); },
    });
  }

  async function addSlide(typeId: string, opts: { skipUndo?: boolean } = {}) {
    const type = data.slideTypes.find((t) => t.id === typeId);
    const defaults = type ? buildDefaultData(type.fields) : {};
    const res = await fetch(`/api/decks/${data.deck.id}/slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typeId, data: defaults }),
    });
    if (!res.ok) return;
    const { slide } = await res.json();
    slideDataMap[slide.id] = defaults;
    showTypePicker = false;
    await invalidateAll();
    selectedSlideId = slide.id;

    if (opts.skipUndo) return;
    pushUndo({
      label: t('editor.action_add_slide'),
      undo: async () => {
        await deleteSlide(slide.id, { skipUndo: true });
      },
      redo: async () => {
        await addSlide(typeId, { skipUndo: true });
      },
    });
  }

  let shareCopied = $state(false);
  async function openShareDialog() {
    shareError = '';
    shareCopied = false;
    try {
      const res = await fetch(`/api/decks/${data.deck.id}/share`, { method: 'POST' });
      if (!res.ok) {
        shareError = `${res.status}`;
        shareUrl = '';
        return;
      }
      const link = await res.json();
      shareUrl = `${location.origin}/share/${link.token}`;
      // Try to copy automatically; the dialog stays so the user has the link
      // visible regardless of whether the clipboard write succeeds (it can
      // fail when the tab isn't focused or the browser blocks it).
      try {
        await navigator.clipboard.writeText(shareUrl);
        shareCopied = true;
      } catch { /* show URL for manual copy */ }
    } catch (err) {
      shareError = err instanceof Error ? err.message : 'failed';
      shareUrl = '';
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      shareCopied = true;
    } catch { /* user can select-and-copy from the field */ }
  }

  function closeShareDialog() {
    shareUrl = '';
    shareError = '';
    shareCopied = false;
  }

  async function setDeckTheme(themeId: string | null) {
    await fetch(`/api/decks/${data.deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeId }),
    });
    await invalidateAll();
  }
  async function applyTheme(themeId: string) {
    showThemePicker = false;
    const previousThemeId = data.deck.themeId ?? null;
    if (previousThemeId === themeId) return;
    await setDeckTheme(themeId);
    pushUndo({
      label: t('editor.action_apply_theme'),
      undo: async () => { await setDeckTheme(previousThemeId); },
      redo: async () => { await setDeckTheme(themeId); },
    });
  }

  async function deleteDeck() {
    if (!confirm(t('editor.confirm_delete'))) return;
    const res = await fetch(`/api/decks/${data.deck.id}`, { method: 'DELETE' });
    if (res.ok) await goto('/decks');
  }

  async function exportPdf() {
    exporting = true;
    try {
      const res = await fetch(`/api/decks/${data.deck.id}/export`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.deck.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      exporting = false;
    }
  }

  // Vim-style slide navigation
  // When switching to the agent tab, open the drawer; when closing via ×, go back to preview
  $effect(() => {
    if (mobilePane === 'agent') agentOpen = true;
  });
  $effect(() => {
    if (!agentOpen && mobilePane === 'agent') mobilePane = 'preview';
  });

  let gPressed = $state(false);
  let gTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;

    // Cmd/Ctrl + Z and Cmd/Ctrl + Shift + Z: deck-level undo/redo. Inside a
    // text input we let the browser handle native input undo instead so the
    // user doesn't lose finer-grained typing history.
    const editing = target?.matches('input, textarea, [contenteditable]');
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === 'z' || e.key === 'Z') && !editing) {
      e.preventDefault();
      if (e.shiftKey) runRedo(); else runUndo();
      return;
    }
    if (mod && e.key === 'y' && !editing) {
      e.preventDefault();
      runRedo();
      return;
    }

    // Escape: blur active input → back to normal mode
    if (e.key === 'Escape' && target?.matches('input, textarea, [contenteditable]')) {
      (target as HTMLElement).blur();
      e.preventDefault();
      return;
    }

    // Global shortcuts (always active when not editing text)
    if (!target?.matches('input, textarea, [contenteditable]') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (e.key === 'n') { e.preventDefault(); showTypePicker = true; return; }
    }

    // Vim bindings are opt-in via user preferences
    if (!data.vim) return;

    // All other vim bindings only fire when not editing text
    if (target?.matches('input, textarea, [contenteditable]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const slides = displaySlides;
    const idx = slides.findIndex((s) => s.id === selectedSlideId);

    switch (e.key) {
      case 'j': {
        // next slide
        e.preventDefault();
        const next = slides[idx + 1];
        if (next) { selectedSlideId = next.id; mobilePane = 'edit'; }
        break;
      }
      case 'k': {
        // previous slide
        e.preventDefault();
        const prev = slides[idx - 1];
        if (prev) { selectedSlideId = prev.id; mobilePane = 'edit'; }
        break;
      }
      case 'G': {
        // last slide
        e.preventDefault();
        const last = slides[slides.length - 1];
        if (last) { selectedSlideId = last.id; mobilePane = 'edit'; }
        break;
      }
      case 'g': {
        // gg → first slide (two consecutive g presses)
        e.preventDefault();
        if (gPressed) {
          if (gTimeout) clearTimeout(gTimeout);
          gPressed = false;
          const first = slides[0];
          if (first) { selectedSlideId = first.id; mobilePane = 'edit'; }
        } else {
          gPressed = true;
          gTimeout = setTimeout(() => { gPressed = false; }, 500);
        }
        break;
      }
      case 'n':
      case 'o': {
        // open type picker (add slide)
        e.preventDefault();
        showTypePicker = true;
        break;
      }
      case 'd': {
        // delete current slide
        e.preventDefault();
        if (selectedSlideId) deleteSlide(selectedSlideId);
        break;
      }
      case 'e': {
        // edit — focus first field in the form pane
        e.preventDefault();
        mobilePane = 'edit';
        const firstInput = document.querySelector<HTMLElement>('.form input, .form textarea');
        firstInput?.focus();
        break;
      }
      case 'p': {
        // preview pane
        e.preventDefault();
        mobilePane = 'preview';
        break;
      }
    }
  }
</script>

<svelte:head><title>{data.deck.title} — slidt</title></svelte:head>
<svelte:window onkeydown={handleKeydown} />

{#if undoToast}
  <div class="undo-toast" transition:fade={{ duration: 120 }}>
    {undoToast}
  </div>
{/if}

{#if hoveredSlide && hoveredType && data.theme}
  <div
    class="slide-hover-preview"
    style:top="{hoverTop}px"
    style:left="{hoverLeft}px"
    transition:fade={{ duration: 100 }}
  >
    <SlidePreview
      slideType={hoveredType}
      slideData={hoveredData}
      theme={data.theme}
      label="Slide hover preview"
    />
  </div>
{/if}

<div class="editor">
  <!-- Breadcrumb / actions row -->
  <div class="breadcrumb">
    <div class="cell index">§3</div>
    <div class="cell crumbs">
      <a href="/decks" class="crumb-link">{t('editor.crumb_decks')}</a>
      <span class="dim">/</span>
      <span class="dim">{String(data.deck.slideOrder.length).padStart(2, '0')}</span>
      <span class="dim">›</span>
      <span class="title" style:view-transition-name="deck-{data.deck.id}">{data.deck.title}</span>
      <span class="pill" class:pill-error={saveError} class:pill-saving={saving}>
        {saveLabel}
      </span>
    </div>
    <div class="cell actions">
      <a class="action" href="/api/decks/{data.deck.id}/present" target="_blank">{t('editor.action_present')}</a>
      <button class="action" onclick={exportPdf} disabled={exporting}>
        {exporting ? t('editor.action_export_busy') : t('editor.action_export')}
      </button>
      <button class="action" type="button" onclick={() => showThemePicker = true}>{t('editor.theme_button')}{data.theme ? ` · ${data.theme.name}` : ''}</button>
      <button class="action" type="button" onclick={openShareDialog}>{t('editor.action_share')}</button>
      <button class="action danger" type="button" onclick={deleteDeck}>{t('editor.action_delete')}</button>
      <button
        class="action accent"
        type="button"
        onclick={() => { agentOpen = !agentOpen; }}
        aria-pressed={agentOpen}
      >
        <STFace size={14} color="var(--st-bg)" mood={agentOpen ? 'happy' : 'idle'} />
        {agentOpen ? t('editor.agent_on') : t('editor.agent_off')}
      </button>
    </div>
  </div>

  <!-- Body -->
  <div class="body">
    <!-- Slide list -->
    <aside class="slide-list" class:mob-active={mobilePane === 'list'}>
      <div class="list-head">
        <span>{t('editor.slides_label')}</span>
        <span>{String(data.slides.length).padStart(2, '0')}</span>
      </div>
      <div class="list-body">
        {#each displaySlides as slide, i (slide.id)}
          {@const type = data.slideTypes.find((t) => t.id === slide.typeId)}
          {@const active = selectedSlideId === slide.id}
          {@const snippet = type ? slideSnippet(slideDataMap[slide.id], type.fields) : null}
          <div
            class="srow"
            class:active
            class:dragging={draggedId === slide.id}
            class:drop-before={dropTargetId === slide.id && dropPosition === 'before'}
            class:drop-after={dropTargetId === slide.id && dropPosition === 'after'}
            role="button"
            tabindex="0"
            onclick={() => { selectedSlideId = slide.id; mobilePane = 'edit'; }}
            onkeydown={(e) => e.key === 'Enter' && (selectedSlideId = slide.id, mobilePane = 'edit')}
            draggable="true"
            ondragstart={(e) => onDragStart(e, slide.id)}
            ondragover={(e) => onDragOver(e, slide.id)}
            ondragleave={() => onDragLeave(slide.id)}
            ondragend={onDragEnd}
            ondrop={(e) => onDrop(e, slide.id)}
            onmouseenter={(e) => onSlideRowEnter(e, slide.id)}
            onmouseleave={onSlideRowLeave}
          >
            <span class="srow-n">{String(i + 1).padStart(2, '0')}</span>
            <span class="srow-body">
              <span class="srow-title">{snippet ?? type?.label ?? t('editor.slide_unknown')}</span>
              {#if snippet && type}
                <span class="srow-type">{type.label.toUpperCase()}</span>
              {/if}
            </span>
            <button
              class="srow-del"
              type="button"
              onclick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }}
              title={t('editor.delete_slide')}
              aria-label={t('editor.delete_slide')}
            >×</button>
            <span class="srow-grip" aria-hidden="true">⋮⋮</span>
          </div>
        {/each}
      </div>
      <button class="list-foot" onclick={() => showTypePicker = true} type="button">
        <span>{t('editor.slides_add')}</span>
        <span class="key">n</span>
      </button>
    </aside>

    <!-- Form -->
    <section class="form" class:mob-active={mobilePane === 'edit'}>
      {#if selectedSlide && selectedType}
        <div class="form-head">
          {t('editor.form_head', { n: String(selectedIdx + 1).padStart(2, '0'), type: selectedType.name.toUpperCase() })}
        </div>
        <div class="fields">
          {#each selectedType.fields as field, i (field.name)}
            <STField n={String(i + 1).padStart(2, '0')} label={field.label ?? field.name} value="">
              <FieldEditor
                {field}
                value={selectedData[field.name]}
                onchange={(v) => handleFieldChange({ ...selectedData, [field.name]: v })}
              />
            </STField>
          {/each}
        </div>
      {:else}
        <div class="form-empty">
          {data.slides.length === 0 ? t('editor.form_empty_no_slides') : t('editor.form_empty_select')}
        </div>
      {/if}
    </section>

    <!-- Preview + Agent column -->
    <section class="right" class:mob-active={mobilePane === 'preview' || mobilePane === 'agent'} class:mob-agent={mobilePane === 'agent'}>
      <div class="preview-wrap">
        <div class="preview-meta">
          <span>{t('editor.preview_meta')}</span>
          {#if selectedSlideId}
            <span>{t('editor.preview_slide_of', { n: String(selectedIdx + 1).padStart(2, '0'), total: String(data.slides.length).padStart(2, '0') })}</span>
          {:else}
            <span>—</span>
          {/if}
        </div>
        <div class="preview-frame">
          <SlidePreview
            slideType={selectedType}
            slideData={selectedData}
            theme={data.theme}
            editable={data.canEdit}
            onedit={handleInlineEdit}
          />
        </div>
        <div class="thumbs">
          {#each displaySlides as slide, i (slide.id)}
            {@const active = selectedSlideId === slide.id}
            <button
              type="button"
              class="thumb"
              class:active
              onclick={() => selectedSlideId = slide.id}
              title={String(i + 1).padStart(2, '0')}
            >{String(i + 1).padStart(2, '0')}</button>
          {/each}
        </div>
      </div>

      <STAgentDrawer deckId={data.deck.id} themeId={data.deck.themeId} bind:open={agentOpen} />
    </section>
  </div>

  <!-- Mobile tab bar (hidden on desktop) -->
  <div class="mob-tabs">
    <button class:active={mobilePane === 'list'} onclick={() => mobilePane = 'list'}>{t('editor.slides_label')}</button>
    <button class:active={mobilePane === 'edit'} onclick={() => mobilePane = 'edit'}>{t('editor.mob_edit')}</button>
    <button class:active={mobilePane === 'preview'} onclick={() => mobilePane = 'preview'}>{t('editor.mob_preview')}</button>
    <button class:active={mobilePane === 'agent'} class="mob-agent-tab" onclick={() => mobilePane = 'agent'}>{t('editor.mob_agent')}</button>
  </div>
</div>

<!-- Share dialog -->
{#if shareUrl || shareError}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    onclick={closeShareDialog}
    onkeydown={(e) => e.key === 'Escape' && closeShareDialog()}
  >
    <div
      class="share-dialog"
      role="document"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="share-head">
        <span>{t('editor.share_dialog_label')}</span>
        <button onclick={closeShareDialog} aria-label={t('editor.share_dialog_close')}>×</button>
      </div>
      {#if shareUrl}
        <div class="share-body">
          <input class="share-url" type="text" readonly value={shareUrl} onclick={(e) => (e.currentTarget as HTMLInputElement).select()} />
          <STBtn variant="accent" onclick={copyShareUrl}>
            {shareCopied ? t('editor.action_share_done') : t('editor.share_dialog_copy')}
          </STBtn>
        </div>
      {:else if shareError}
        <div class="share-error">{t('editor.share_failed')} ({shareError})</div>
      {/if}

      {#if data.isOwner}
        <div class="collab-section">
          <div class="collab-label">{t('editor.collab_label')}</div>

          {#if form?.collabError}
            <p class="collab-error">{form.collabError}</p>
          {/if}

          {#each data.collaborators as c (c.userId)}
            <div class="collab-row">
              <span class="collab-name">{c.name}</span>
              <span class="collab-email">{c.email}</span>
              <span class="collab-role">{c.role.toUpperCase()}</span>
              <form method="POST" action="?/removeCollaborator" use:enhance>
                <input type="hidden" name="userId" value={c.userId} />
                <button type="submit" class="collab-remove">✕</button>
              </form>
            </div>
          {/each}

          <form method="POST" action="?/addCollaborator" use:enhance class="collab-add">
            <input type="email" name="email" placeholder="colleague@example.com" required />
            <select name="role">
              <option value="editor">{t('editor.collab_role_editor')}</option>
              <option value="viewer">{t('editor.collab_role_viewer')}</option>
            </select>
            <button type="submit" class="btn-sm">{t('editor.collab_add')}</button>
          </form>
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Type picker -->
{#if showTypePicker}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    onclick={() => showTypePicker = false}
    onkeydown={(e) => e.key === 'Escape' && (showTypePicker = false)}
    transition:fade={{ duration: 120 }}
  >
    <div
      class="picker"
      role="document"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
    >
      <div class="picker-head">
        <span>{t('editor.picker_head')}</span>
        <button onclick={() => showTypePicker = false} aria-label={t('editor.picker_close')}>×</button>
      </div>
      <div class="type-grid">
        {#each data.slideTypes.filter(t => t.scope === 'global' || t.deckId === data.deck.id) as type}
          <button class="type-tile" onclick={() => addSlide(type.id)}>
            <div class="tt-preview">
              <SlidePreview
                slideType={type}
                slideData={buildDummyData(type.fields)}
                theme={data.theme}
              />
              {#if type.scope === 'deck'}
                <span class="tt-scope">DECK</span>
              {/if}
            </div>
            <span class="tt-label">{type.label}</span>
            <span class="tt-name">{type.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<!-- Theme picker -->
{#if showThemePicker}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    onclick={() => showThemePicker = false}
    onkeydown={(e) => e.key === 'Escape' && (showThemePicker = false)}
    transition:fade={{ duration: 120 }}
  >
    <div
      class="picker"
      role="document"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
    >
      <div class="picker-head">
        <span>{t('editor.theme_picker_head')}</span>
        <button onclick={() => showThemePicker = false} aria-label={t('editor.picker_close')}>×</button>
      </div>
      <div class="theme-list">
        {#each data.availableThemes as theme (theme.id)}
          <button
            class="theme-row"
            class:active={data.deck.themeId === theme.id || (!data.deck.themeId && data.theme?.id === theme.id)}
            onclick={() => applyTheme(theme.id)}
          >
            <span class="theme-name">{theme.name}</span>
            {#if data.deck.themeId === theme.id || (!data.deck.themeId && data.theme?.id === theme.id)}
              <span class="theme-active">{t('editor.theme_active')}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .undo-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--st-ink);
    color: var(--st-bg);
    padding: 12px 18px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    z-index: 1100;
    box-shadow: 0 8px 24px rgba(8, 8, 7, 0.25);
  }
  .slide-hover-preview {
    position: fixed;
    width: 360px;
    background: var(--st-bg);
    border: var(--st-rule-medium);
    box-shadow: 0 16px 40px rgba(8, 8, 7, 0.18), 0 2px 6px rgba(8, 8, 7, 0.08);
    z-index: 1050;
    pointer-events: none;
  }
  .slide-hover-preview :global(.preview-wrap) { border-radius: 0; min-height: 0; }
  @media (max-width: 768px) {
    .slide-hover-preview { display: none; }
  }
  .editor {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 49px);
    background: var(--st-bg);
    overflow: hidden;
  }
  .dim { color: var(--st-ink-dim); }

  /* ── Breadcrumb ───────────────────────────────────────── */
  .breadcrumb {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    border-bottom: var(--st-rule-thick);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    flex-shrink: 0;
  }
  .cell { display: flex; align-items: center; }
  .cell.index {
    border-right: var(--st-rule-thick);
    padding: 12px 0;
    justify-content: center;
    color: var(--st-ink-dim);
  }
  .cell.crumbs { padding: 12px; gap: 16px; }
  .crumb-link { color: var(--st-ink-dim); text-decoration: none; }
  .crumb-link:hover { color: var(--st-ink); }
  .cell.crumbs .title {
    font-family: var(--st-font-display);
    font-size: 16px;
    letter-spacing: -0.01em;
    color: var(--st-ink);
  }
  .pill {
    padding: 3px 10px;
    background: var(--st-cobalt);
    color: var(--st-bg);
    font-size: 9px;
    letter-spacing: 0.22em;
  }
  .pill-saving { background: var(--st-ink-dim); }
  .pill-error { background: #b91c1c; }

  .cell.actions { display: flex; }
  .action {
    padding: 12px 20px;
    border-left: var(--st-rule-thin);
    background: transparent;
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-decoration: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .action:hover { background: var(--st-bg-deep); }
  .action:disabled { color: var(--st-ink-dim); cursor: default; }
  .action:disabled:hover { background: transparent; }
  .action.accent {
    background: var(--st-cobalt);
    color: var(--st-bg);
  }
  .action.accent:hover { background: #0e34b8; }
  .action.danger { color: var(--st-ink-dim); }
  .action.danger:hover { background: var(--st-ink); color: var(--st-bg); }

  /* ── Body ─────────────────────────────────────────────── */
  .body {
    display: grid;
    grid-template-columns: 240px minmax(340px, 420px) 1fr;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }
  @media (min-width: 1440px) {
    .body { grid-template-columns: 260px minmax(380px, 480px) 1fr; }
  }

  /* ── Slide list ───────────────────────────────────────── */
  .slide-list {
    border-right: var(--st-rule-medium);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .list-head {
    padding: 14px 22px;
    border-bottom: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    display: flex;
    justify-content: space-between;
  }
  .list-body { flex: 1; overflow-y: auto; }
  .srow {
    display: grid;
    grid-template-columns: 40px 1fr auto auto;
    align-items: center;
    border-bottom: var(--st-rule-thin);
    border-top: 2px solid transparent;
    background: transparent;
    color: var(--st-ink);
    cursor: pointer;
    user-select: none;
  }
  .srow:hover:not(.active) { background: var(--st-bg-deep); }
  .srow.active {
    background: var(--st-cobalt);
    color: var(--st-bg);
  }
  .srow.dragging { opacity: 0.4; }
  .srow.drop-before { border-top-color: var(--st-cobalt); }
  .srow.drop-after { border-bottom: 2px solid var(--st-cobalt); }
  .srow-n {
    padding: 14px 0;
    text-align: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--st-ink-dim);
  }
  .srow.active .srow-n { color: rgba(250,250,247,0.7); }
  .srow-body {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .srow-title {
    font-family: var(--st-font-display);
    font-size: 16px;
    letter-spacing: -0.01em;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .srow-type {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.18em;
    color: var(--st-ink-dim);
  }
  .srow.active .srow-type { color: rgba(250,250,247,0.7); }
  .srow-del {
    padding: 14px 10px;
    font-size: 16px;
    color: inherit;
    opacity: 0;
    background: transparent;
    border: 0;
    cursor: pointer;
    line-height: 1;
    transition: opacity 100ms ease;
  }
  .srow:hover .srow-del,
  .srow.active .srow-del { opacity: 0.6; }
  .srow .srow-del:hover { opacity: 1; }

  .srow-grip {
    padding: 14px 14px;
    font-family: var(--st-font-mono);
    font-size: 13px;
    line-height: 1;
    color: inherit;
    opacity: 0.35;
    cursor: grab;
    user-select: none;
  }
  .srow:hover .srow-grip,
  .srow.active .srow-grip { opacity: 0.7; }
  .srow.dragging .srow-grip { cursor: grabbing; }

  .list-foot {
    padding: 14px 22px;
    border-top: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    background: transparent;
    color: var(--st-ink);
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    border-radius: 0;
  }
  .list-foot:hover { background: var(--st-bg-deep); }
  .list-foot .key { color: var(--st-ink-dim); }

  /* ── Form ─────────────────────────────────────────────── */
  .form {
    border-right: var(--st-rule-medium);
    padding: 28px 32px 40px;
    overflow-y: auto;
    background: var(--st-bg);
  }
  .fields :global(.st-field) { margin-bottom: 28px; }
  .fields :global(.st-field:last-child) { margin-bottom: 0; }
  /* Soften STField bottom rule when it lives inside the editor — a stack of
     full-thickness rules reads as too many parallel lines. */
  .fields :global(.st-field .value-wrap) { border-bottom-width: 2px; }
  .form-head {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.28em;
    color: var(--st-cobalt);
    margin-bottom: 24px;
  }
  .fields { display: flex; flex-direction: column; }
  .form-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
  }

  /* ── Right column ─────────────────────────────────────── */
  .right {
    background: var(--st-bg-deep);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    position: relative;
  }
  .preview-wrap {
    flex: 1;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: hidden;
    min-height: 0;
  }
  .preview-meta {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    display: flex;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .preview-frame {
    background: var(--st-bg);
    border: var(--st-rule-thick);
    flex-shrink: 0;
    overflow: hidden;
  }
  .thumbs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .thumb {
    aspect-ratio: 16/9;
    width: 60px;
    background: var(--st-bg);
    border: 2px solid var(--st-ink);
    color: var(--st-ink-dim);
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 4px 6px;
  }
  .thumb.active { border-color: var(--st-cobalt); color: var(--st-cobalt); }
  .thumb:hover:not(.active) { background: var(--st-bg-deep); }

  /* ── Share dialog ─────────────────────────────────────── */
  .share-dialog {
    background: var(--st-bg);
    border: var(--st-rule-thick);
    width: 560px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
  }
  .share-head {
    padding: 14px 20px;
    border-bottom: var(--st-rule-medium);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
  }
  .share-head button {
    background: transparent;
    border: 0;
    font-size: 22px;
    cursor: pointer;
    color: var(--st-ink-dim);
  }
  .share-body {
    padding: 18px 20px;
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .share-url {
    flex: 1;
    font-family: var(--st-font-mono);
    font-size: 12px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    padding: 10px 12px;
    width: 100%;
  }
  .share-url:focus { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }
  .share-error {
    padding: 18px 20px;
    font-family: var(--st-font-mono);
    font-size: 12px;
    color: var(--st-ink);
    background: var(--st-bg-deep);
    border-left: 3px solid var(--st-ink);
  }

  /* ── Type picker overlay ──────────────────────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(8,8,7,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }
  .picker {
    background: var(--st-bg);
    border: var(--st-rule-thick);
    width: 640px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .picker-head {
    padding: 14px 20px;
    border-bottom: var(--st-rule-medium);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
  }
  .picker-head button {
    background: transparent;
    border: 0;
    font-size: 22px;
    cursor: pointer;
    color: var(--st-ink-dim);
  }
  .type-grid {
    padding: 14px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    overflow-y: auto;
    max-height: calc(80vh - 60px);
  }
  .type-tile {
    background: var(--st-bg);
    border: 2px solid var(--st-ink);
    padding: 0;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0;
    cursor: pointer;
    border-radius: 0;
    overflow: hidden;
  }
  .type-tile:hover { border-color: var(--st-cobalt); }
  .tt-preview {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    flex-shrink: 0;
    border-bottom: 2px solid inherit;
    position: relative;
  }
  .tt-preview :global(.preview-wrap) { border-radius: 0; min-height: 0; }
  .tt-scope {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 3px 8px;
    background: var(--st-cobalt);
    color: var(--st-bg);
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.18em;
    z-index: 1;
  }
  .tt-label {
    font-family: var(--st-font-display);
    font-size: 15px;
    letter-spacing: -0.01em;
    padding: 10px 12px 2px;
  }
  .tt-name {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.18em;
    color: var(--st-ink-dim);
    padding: 0 12px 10px;
  }

  /* ── Theme picker list ────────────────────────────────── */
  .theme-list { overflow-y: auto; max-height: calc(80vh - 60px); }
  .theme-row {
    width: 100%;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: transparent;
    border: none;
    border-bottom: var(--st-rule-thin);
    text-align: left;
    cursor: pointer;
  }
  .theme-row:hover { background: var(--st-bg-deep); }
  .theme-row.active { background: var(--st-cobalt); color: var(--st-bg); }
  .theme-name { font-family: var(--st-font-display); font-size: 22px; }
  .theme-active {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    opacity: 0.8;
  }

  /* ── Collaborators section ────────────────────────────── */
  .collab-section { margin-top: 20px; padding: 0 20px 20px; }
  .collab-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    margin-bottom: 10px;
  }
  .collab-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 11px;
  }
  .collab-name { font-weight: 500; }
  .collab-email { color: var(--st-ink-dim); flex: 1; }
  .collab-role { color: var(--st-cobalt); letter-spacing: 0.1em; font-size: 9px; }
  .collab-remove { background: none; border: none; color: var(--st-ink-dim); cursor: pointer; padding: 0 4px; }
  .collab-remove:hover { color: #ff6060; }
  .collab-add { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
  .collab-add input { flex: 1; padding: 6px 10px; border: 2px solid var(--st-ink); background: var(--st-bg); color: var(--st-ink); font-family: var(--st-font-mono); font-size: 12px; border-radius: 0; }
  .collab-add select { padding: 6px 8px; border: 2px solid var(--st-ink); background: var(--st-bg); color: var(--st-ink); font-family: var(--st-font-mono); font-size: 11px; border-radius: 0; }
  .collab-error { font-family: var(--st-font-mono); font-size: 11px; color: #ff6060; margin: 0 0 8px; }
  .btn-sm {
    padding: 6px 14px;
    background: var(--st-cobalt);
    color: var(--st-bg);
    border: none;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    cursor: pointer;
  }
  .btn-sm:hover { background: #0e34b8; }

  /* ── Mobile tab bar (desktop: hidden) ────────────────── */
  .mob-tabs { display: none; }

  /* ── Mobile responsive ────────────────────────────────── */
  @media (max-width: 768px) {
    .editor { height: calc(100vh - 42px); }

    /* Breadcrumb: collapse 3-col to title + scrolling actions */
    .breadcrumb { grid-template-columns: 1fr; }
    .cell.index { display: none; }
    .cell.crumbs {
      padding: 10px 14px;
      gap: 10px;
      overflow-x: auto;
      white-space: nowrap;
    }
    .cell.crumbs .title { font-size: 14px; }
    .cell.actions {
      overflow-x: auto;
      border-top: var(--st-rule-thin);
      /* hide scrollbar but keep scrollable */
      scrollbar-width: none;
    }
    .cell.actions::-webkit-scrollbar { display: none; }
    .action { padding: 10px 14px; font-size: 10px; flex-shrink: 0; }

    /* Body: single-column, each pane takes full height */
    .body {
      grid-template-columns: 1fr;
      position: relative;
    }

    /* All panes hidden by default on mobile */
    .slide-list,
    .form,
    .right {
      display: none;
      height: 100%;
    }

    /* Active pane shown */
    .slide-list.mob-active { display: flex; }
    .form.mob-active { display: block; overflow-y: auto; }
    .right.mob-active { display: flex; }

    /* Slide list: full width */
    .slide-list { border-right: none; }

    /* Form: reduce padding */
    .form { padding: 20px 18px 60px; }

    /* Right: preview adjust */
    .preview-wrap { padding: 16px 14px; }

    /* Agent tab: hide preview, make drawer fill the pane */
    .right.mob-agent .preview-wrap { display: none; }
    .right.mob-agent :global(.drawer.open) {
      position: relative;
      width: 100%;
      height: 100%;
      border-left: none;
    }


    /* Mobile tab bar */
    .mob-tabs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-top: var(--st-rule-thick);
      flex-shrink: 0;
    }
    .mob-tabs button {
      padding: 12px 0;
      background: var(--st-bg);
      color: var(--st-ink-dim);
      border: none;
      border-right: var(--st-rule-thin);
      font-family: var(--st-font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      cursor: pointer;
    }
    .mob-tabs button:last-child { border-right: none; }
    .mob-tabs button.active {
      background: var(--st-cobalt);
      color: var(--st-bg);
    }
    .mob-tabs button:hover:not(.active) { background: var(--st-bg-deep); }

    /* Picker/share dialogs: full width on small screens */
    .picker { width: 94vw; }
    .share-dialog { width: 94vw; }

    /* Type grid: 2 columns on mobile */
    .type-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .cell.actions { display: none; }
    .mob-tabs button { font-size: 9px; letter-spacing: 0.15em; padding: 10px 0; }
    .form { padding: 16px 14px 56px; }
    .type-grid { grid-template-columns: 1fr; }
  }
</style>
