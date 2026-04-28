<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { parseFieldsJson } from '$lib/utils/fields-json.ts';
  import { buildDummyData } from '$lib/utils/field-defaults.ts';
  import type { SlideType, Theme } from '../../../renderer/types.ts';

  import STBtn from '$lib/components/st/STBtn.svelte';
  import STUnsavedGuard from '$lib/components/st/STUnsavedGuard.svelte';
  import STAgentDrawer from '$lib/components/st/STAgentDrawer.svelte';
  import STFace from '$lib/components/st/STFace.svelte';
  import { t } from '$lib/i18n/index.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // Persisted snapshot — refreshed on save so the dirty check resets.
  let savedLabel = $state(data.slideType.label);
  let savedFieldsJson = $state(JSON.stringify(data.slideType.fields, null, 2));
  let savedHtml = $state(data.slideType.htmlTemplate);
  let savedCss = $state(data.slideType.css);

  let label = $state(savedLabel);
  let fieldsJson = $state(savedFieldsJson);
  let htmlTemplate = $state(savedHtml);
  let css = $state(savedCss);
  let saved = $state(false);
  let promoted = $state(false);
  let fieldsError = $state('');
  let agentOpen = $state(false);

  const aiModel = $derived(data.user?.preferences?.aiModel ?? 'claude');
  const agentEnabled = $derived(
    data.slideType.scope === 'deck' && typeof data.slideType.deckId === 'string',
  );

  const dirty = $derived(
    label !== savedLabel ||
    fieldsJson !== savedFieldsJson ||
    htmlTemplate !== savedHtml ||
    css !== savedCss,
  );

  // Placeholder theme for preview — full token set matching the seeded theme
  const previewTheme: Theme = {
    name: 'preview',
    tokens: {
      '--ood-black': '#000000',
      '--ood-white': '#FFFFFF',
      '--ood-big-cloud': '#EDEDED',
      '--ood-barbie-pink': '#FF7FE9',
      '--ood-barbie-pink-light': '#FFB3F3',
      '--ood-barbie-pink-bright': '#FFE7FF',
      '--ood-deep-violet': '#6E31FF',
      '--ood-deep-violet-light': '#A783FF',
      '--ood-deep-violet-bright': '#E2D6FF',
      '--ood-dark-matter': '#363442',
      '--ood-dark-matter-light': '#807B95',
      '--ood-dark-matter-bright': '#D5D3DC',
      '--ood-wicked-matrix': '#54DE10',
      '--ood-wicked-matrix-light': '#9CED7C',
      '--ood-wicked-matrix-bright': '#CEF5BF',
    },
  };

  let parsedFields = $derived(parseFieldsJson(fieldsJson));

  let previewSlideType = $derived<SlideType | null>(
    parsedFields
      ? {
          name: data.slideType.name,
          label,
          fields: parsedFields,
          htmlTemplate,
          css,
        }
      : null,
  );

  let previewData = $derived(parsedFields ? buildDummyData(parsedFields) : {});

  function onFieldsInput(e: Event) {
    fieldsJson = (e.target as HTMLTextAreaElement).value;
    fieldsError = parsedFields === null && fieldsJson.trim() ? 'Invalid JSON array' : '';
  }
</script>

<svelte:head><title>{data.slideType.label} — Templates — slidt</title></svelte:head>

<STUnsavedGuard {dirty} />

<form
  method="POST"
  action="?/save"
  use:enhance={({ formData }) => {
    formData.set('fields', fieldsJson);
    formData.set('htmlTemplate', htmlTemplate);
    formData.set('css', css);
    return async ({ result, update }) => {
      if (result.type === 'success') {
        saved = true;
        savedLabel = label;
        savedFieldsJson = fieldsJson;
        savedHtml = htmlTemplate;
        savedCss = css;
        setTimeout(() => (saved = false), 2000);
      }
      await update();
    };
  }}
  class="page"
>
  <div class="topbar">
    <div class="topbar-left">
      <a class="crumb" href="/templates">{t('template_edit.crumb')}</a>
      <span class="dim">/</span>
      <input class="label-input" type="text" name="label" bind:value={label} />
      <span class="type-name">{data.slideType.name}</span>
    </div>
    <div class="topbar-right">
      <span class="scope-pill {data.slideType.scope}">{data.slideType.scope.toUpperCase()}</span>
      {#if data.slideType.scope === 'deck' && data.deckTitle}
        <span class="scope-deck">{t('template_edit.from_deck')}: <strong>{data.deckTitle}</strong></span>
      {/if}
      <STBtn type="submit" variant="accent">{saved ? t('theme_edit.saved') : t('theme_edit.save')}</STBtn>
      {#if agentEnabled}
        <button
          type="button"
          class="agent-toggle"
          onclick={(e) => { e.preventDefault(); agentOpen = !agentOpen; }}
          aria-pressed={agentOpen}
          title={t('template_edit.agent_open')}
        >
          <STFace size={14} color="var(--st-bg)" mood={agentOpen ? 'happy' : 'idle'} />
          <span>{agentOpen ? t('editor.agent_on') : t('editor.agent_off')}</span>
        </button>
      {/if}
    </div>
  </div>

  {#if data.slideType.scope === 'deck'}
    <!-- Promote action lives in its own (sibling) form so it doesn't submit the editor. -->
    <div class="promote-bar">
      <span class="promote-info">{t('template_edit.promote_admin_only_intro')}</span>
      <button
        type="button"
        class="promote-btn"
        disabled={!data.user?.isAdmin}
        onclick={async (e) => {
          e.preventDefault();
          if (!data.user?.isAdmin) return;
          if (!confirm(t('template_edit.promote_confirm'))) return;
          const fd = new FormData();
          const res = await fetch('?/promote', { method: 'POST', body: fd });
          if (res.ok) {
            promoted = true;
            setTimeout(() => (promoted = false), 2500);
            location.reload();
          }
        }}
      >{promoted ? t('template_edit.promoted') : t('template_edit.promote')}</button>
      {#if !data.user?.isAdmin}
        <span class="promote-hint">{t('template_edit.promote_admin_only')}</span>
      {/if}
    </div>
  {/if}

  {#if form?.error}<p class="error">{form.error}</p>{/if}

  <div class="layout">
    <div class="editor-form">
      <div class="editors">
        <div class="editor-section">
          <label class="editor-label">{t('template_edit.fields_label')}</label>
          {#if fieldsError}<p class="inline-error">{fieldsError}</p>{/if}
          <textarea
            class="code-editor"
            value={fieldsJson}
            oninput={onFieldsInput}
            rows="12"
            spellcheck="false"
          ></textarea>
        </div>

        <div class="editor-section">
          <label class="editor-label">{t('template_edit.template_label')}</label>
          <textarea
            class="code-editor"
            bind:value={htmlTemplate}
            rows="12"
            spellcheck="false"
          ></textarea>
        </div>

        <div class="editor-section">
          <label class="editor-label">{t('template_edit.css_label', { name: data.slideType.name })}</label>
          <textarea
            class="code-editor"
            bind:value={css}
            rows="10"
            spellcheck="false"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="preview-col">
      <p class="preview-label">{t('template_edit.preview_label')}</p>
      <SlidePreview
        slideType={previewSlideType}
        slideData={previewData}
        theme={previewTheme}
      />
    </div>
  </div>
</form>

{#if agentEnabled && data.slideType.deckId}
  <STAgentDrawer
    deckId={data.slideType.deckId}
    aiModel={aiModel}
    bind:open={agentOpen}
  />
{/if}

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 49px);
    background: var(--st-bg);
    /* Relative so the absolute-positioned agent drawer attaches inside the
       editor surface (below the nav) instead of overlaying the whole viewport
       and hiding its close × behind the global navigation. */
    position: relative;
  }

  /* Full-width top bar: breadcrumb + label + slug on the left,
     scope pill + parent deck + Save on the right. */
  .topbar {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 14px 32px;
    border-bottom: var(--st-rule-thick);
    background: var(--st-bg);
    flex-shrink: 0;
  }
  .topbar-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0;
  }
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .crumb {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--st-cobalt);
    text-decoration: none;
  }
  .dim {
    font-family: var(--st-font-mono);
    font-size: 11px;
    color: var(--st-ink-dim);
  }
  .label-input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 8px 12px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    border-radius: 0;
    font-family: var(--st-font-display);
    font-size: 20px;
  }
  .type-name {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--st-ink-dim);
    flex-shrink: 0;
  }

  .scope-pill {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    padding: 4px 10px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
  }
  .scope-pill.deck {
    background: var(--st-cobalt);
    color: var(--st-bg);
    border-color: var(--st-cobalt);
  }
  .scope-deck {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--st-ink-dim);
  }
  .scope-deck strong { color: var(--st-ink); font-weight: 500; }

  .agent-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border: 2px solid var(--st-cobalt);
    background: var(--st-cobalt);
    color: var(--st-bg);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    cursor: pointer;
  }
  .agent-toggle[aria-pressed="true"] {
    background: var(--st-ink);
    border-color: var(--st-ink);
  }
  .agent-toggle:hover { background: #0e34b8; }

  .promote-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 32px;
    border-bottom: var(--st-rule-thin);
    background: var(--st-bg-deep);
  }
  .promote-info {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--st-ink-dim);
  }
  .promote-btn {
    padding: 6px 14px;
    border: 2px solid var(--st-ink);
    background: var(--st-cobalt);
    color: var(--st-bg);
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    cursor: pointer;
  }
  .promote-btn:disabled { background: var(--st-bg); color: var(--st-ink-dim); cursor: not-allowed; }
  .promote-hint {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    color: var(--st-ink-dim);
  }

  /* Full-width grid below the bar. */
  .layout {
    display: grid;
    grid-template-columns: minmax(420px, 1fr) minmax(520px, 1fr);
    gap: 0;
    flex: 1;
    min-height: 0;
  }
  .editor-form {
    padding: 24px 32px;
    border-right: var(--st-rule-medium);
    overflow-y: auto;
  }
  .error, .inline-error {
    color: var(--st-ink);
    background: var(--st-bg-deep);
    padding: 6px 10px;
    border-left: 3px solid var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 11px;
    margin: 0 0 6px;
  }
  .editors { display: flex; flex-direction: column; gap: 18px; }
  .editor-section { display: flex; flex-direction: column; gap: 6px; }
  .editor-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--st-ink-dim);
  }
  .code-editor {
    font-family: var(--st-font-mono);
    font-size: 13px;
    line-height: 1.5;
    padding: 12px;
    border: 3px solid var(--st-ink);
    border-radius: 0;
    background: var(--st-ink);
    color: var(--st-bg);
    resize: vertical;
    width: 100%;
  }
  .code-editor:focus { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }
  .preview-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px 32px;
    overflow-y: auto;
    background: var(--st-bg-deep);
  }
  .preview-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin: 0;
  }

  @media (max-width: 768px) {
    .topbar {
      flex-wrap: wrap;
      padding: 12px 16px;
      gap: 10px;
    }
    .topbar-left, .topbar-right { flex-wrap: wrap; gap: 8px; }
    .label-input { width: 100%; flex: 1 0 100%; }
    .layout { grid-template-columns: 1fr; }
    .editor-form { border-right: 0; border-bottom: var(--st-rule-medium); padding: 16px; }
    .preview-col { padding: 16px; }
    .promote-bar { padding: 10px 16px; flex-wrap: wrap; }
  }
</style>
