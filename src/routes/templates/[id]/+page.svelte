<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { parseFieldsJson } from '$lib/utils/fields-json.ts';
  import { buildDummyData } from '$lib/utils/field-defaults.ts';
  import type { SlideType, Theme } from '../../../renderer/types.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let label = $state(data.slideType.label);
  let fieldsJson = $state(JSON.stringify(data.slideType.fields, null, 2));
  let htmlTemplate = $state(data.slideType.htmlTemplate);
  let css = $state(data.slideType.css);
  let saved = $state(false);
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
  <div class="breadcrumb"><a href="/templates">Templates</a> / {data.slideType.name}</div>

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
        <button type="submit" class="btn-save">{saved ? '✓ Saved' : 'Save'}</button>
      </div>

      {#if form?.error}<p class="error">{form.error}</p>{/if}

      <div class="editors">
        <div class="editor-section">
          <label class="editor-label">Fields (JSON)</label>
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
          <label class="editor-label">Handlebars template</label>
          <textarea
            class="code-editor"
            bind:value={htmlTemplate}
            rows="12"
            spellcheck="false"
          ></textarea>
        </div>

        <div class="editor-section">
          <label class="editor-label">CSS (auto-scoped to .st-{data.slideType.name})</label>
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
      <p class="preview-label">Live preview (dummy data)</p>
      <SlidePreview
        slideType={previewSlideType}
        slideData={previewData}
        theme={previewTheme}
      />
    </div>
  </div>
</div>

<style>
  .page { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
  .breadcrumb { font-size: 13px; color: #888; margin-bottom: 20px; }
  .breadcrumb a { color: #6e31ff; text-decoration: none; }
  .layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
  .form-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
  .label-input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; font-weight: 600; }
  .type-name { font-family: monospace; font-size: 13px; color: #888; }
  .btn-save { background: #6e31ff; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .error, .inline-error { color: #c00; font-size: 12px; margin: 0 0 6px; }
  .editors { display: flex; flex-direction: column; gap: 16px; }
  .editor-section { display: flex; flex-direction: column; gap: 4px; }
  .editor-label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.06em; }
  .code-editor {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #1a1a2e;
    color: #e8e8f8;
    resize: vertical;
    width: 100%;
  }
  .code-editor:focus { outline: 2px solid #6e31ff; border-color: transparent; }
  .preview-col { display: flex; flex-direction: column; gap: 8px; position: sticky; top: 72px; }
  .preview-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
</style>
