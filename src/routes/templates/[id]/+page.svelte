<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { parseFieldsJson } from '$lib/utils/fields-json.ts';
  import { buildDummyData } from '$lib/utils/field-defaults.ts';
  import type { SlideType, Theme } from '../../../renderer/types.ts';

  import STBtn from '$lib/components/st/STBtn.svelte';
  import { t } from '$lib/i18n/index.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let label = $state(data.slideType.label);
  let fieldsJson = $state(JSON.stringify(data.slideType.fields, null, 2));
  let htmlTemplate = $state(data.slideType.htmlTemplate);
  let css = $state(data.slideType.css);
  let saved = $state(false);
  let promoted = $state(false);
  let fieldsError = $state('');

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

<div class="page">
  <div class="breadcrumb"><a href="/templates">{t('template_edit.crumb')}</a> / {data.slideType.name}</div>

  <div class="scope-bar">
    <span class="scope-label">{t('template_edit.scope_label')}</span>
    <span class="scope-pill {data.slideType.scope}">{data.slideType.scope.toUpperCase()}</span>
    {#if data.slideType.scope === 'deck' && data.deckTitle}
      <span class="scope-deck">{t('template_edit.from_deck')}: <strong>{data.deckTitle}</strong></span>
    {/if}
    {#if data.slideType.scope === 'deck'}
      <form
        method="POST"
        action="?/promote"
        class="promote-form"
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === 'success') {
              promoted = true;
              setTimeout(() => (promoted = false), 2500);
            }
            await update();
          };
        }}
      >
        <STBtn
          type="submit"
          variant="accent"
          disabled={!data.user?.isAdmin}
          onclick={(e: Event) => {
            if (!confirm(t('template_edit.promote_confirm'))) e.preventDefault();
          }}
        >{promoted ? t('template_edit.promoted') : t('template_edit.promote')}</STBtn>
        {#if !data.user?.isAdmin}
          <span class="promote-hint">{t('template_edit.promote_admin_only')}</span>
        {/if}
      </form>
    {/if}
  </div>

  <div class="layout">
    <form
      method="POST"
      action="?/save"
      use:enhance={({ formData }) => {
        formData.set('fields', fieldsJson);
        formData.set('htmlTemplate', htmlTemplate);
        formData.set('css', css);
        return async ({ result, update }) => {
          if (result.type === 'success') { saved = true; setTimeout(() => saved = false, 2000); }
          await update();
        };
      }}
      class="editor-form"
    >
      <div class="form-toolbar">
        <input class="label-input" type="text" name="label" bind:value={label} />
        <span class="type-name">{data.slideType.name}</span>
        <STBtn type="submit" variant="accent">{saved ? t('theme_edit.saved') : t('theme_edit.save')}</STBtn>
      </div>

      {#if form?.error}<p class="error">{form.error}</p>{/if}

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
    </form>

    <div class="preview-col">
      <p class="preview-label">{t('template_edit.preview_label')}</p>
      <SlidePreview
        slideType={previewSlideType}
        slideData={previewData}
        theme={previewTheme}
      />
    </div>
  </div>
</div>

<style>
  .page { padding: 32px 40px; }
  .breadcrumb {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--st-ink-dim);
    margin-bottom: 20px;
  }
  .breadcrumb a { color: var(--st-cobalt); text-decoration: none; }
  .scope-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 22px;
    padding: 12px 14px;
    border: var(--st-rule-medium);
    background: var(--st-bg-deep);
  }
  .scope-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
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
  .scope-deck strong {
    color: var(--st-ink);
    font-weight: 500;
  }
  .promote-form {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .promote-hint {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    color: var(--st-ink-dim);
  }
  .layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
  @media (min-width: 1200px) {
    .layout { grid-template-columns: 1fr 760px; }
  }
  .form-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
  .label-input {
    flex: 1;
    padding: 10px 14px;
    border: 3px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    border-radius: 0;
    font-family: var(--st-font-display);
    font-size: 22px;
  }
  .type-name {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--st-ink-dim);
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
    gap: 10px;
    position: sticky;
    top: 72px;
  }
  .preview-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin: 0;
  }

  @media (max-width: 768px) {
    .page { padding: 16px 20px; }
    .layout { grid-template-columns: 1fr; }
    .preview-col { position: static; }
    .form-toolbar { flex-wrap: wrap; }
    .label-input { width: 100%; }
    .scope-bar { padding: 10px 12px; gap: 10px; }
    .promote-form { margin-left: 0; width: 100%; }
  }
</style>
