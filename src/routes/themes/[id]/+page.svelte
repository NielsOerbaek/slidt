<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { isColorToken } from '$lib/utils/token-utils.ts';
  import type { Theme } from '../../../renderer/types.ts';
  import { BUILT_IN_SLIDE_TYPES } from '../../../slide-types/index.ts';
  import { buildDummyData } from '$lib/utils/field-defaults.ts';

  import STBtn from '$lib/components/st/STBtn.svelte';
  import STUnsavedGuard from '$lib/components/st/STUnsavedGuard.svelte';
  import { t } from '$lib/i18n/index.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let savedTokensJson = $state(JSON.stringify(data.theme.tokens));
  let savedName = $state(data.theme.name);
  let savedSystemPrompt = $state(data.theme.systemPrompt ?? '');

  let tokens = $state<Record<string, string>>({ ...data.theme.tokens });
  let name = $state(savedName);
  let systemPrompt = $state(savedSystemPrompt);
  let saved = $state(false);

  // Font picker helpers
  const FONT_STACKS: Record<string, string> = {
    Neureal: "'Neureal', 'Inter', sans-serif",
    Inter: "'Inter', sans-serif",
  };
  function parseFontPreset(val: string): { preset: string; customName: string } {
    if (!val) return { preset: 'Neureal', customName: '' };
    const first = val.split(',')[0].replace(/['"]/g, '').trim();
    if (first === 'Neureal') return { preset: 'Neureal', customName: '' };
    if (first === 'Inter') return { preset: 'Inter', customName: '' };
    return { preset: 'custom', customName: first };
  }
  function buildFontStack(preset: string, customName: string): string {
    if (preset in FONT_STACKS) return FONT_STACKS[preset];
    const n = customName.trim() || 'Inter';
    return `'${n}', sans-serif`;
  }

  let headerFont = $state(parseFontPreset(data.theme.tokens['--sl-font'] ?? ''));
  let bodyFont = $state(parseFontPreset(
    data.theme.tokens['--sl-body-font'] ?? data.theme.tokens['--sl-font'] ?? ''
  ));

  function applyHeaderFont() {
    tokens = { ...tokens, '--sl-font': buildFontStack(headerFont.preset, headerFont.customName) };
  }
  function applyBodyFont() {
    tokens = { ...tokens, '--sl-body-font': buildFontStack(bodyFont.preset, bodyFont.customName) };
  }

  /** Tokens shown in raw list — font tokens managed by the picker above. */
  const FONT_TOKENS = new Set(['--sl-font', '--sl-body-font']);
  let rawTokens = $derived(Object.entries(tokens).filter(([k]) => !FONT_TOKENS.has(k)));

  const dirty = $derived(
    JSON.stringify(tokens) !== savedTokensJson ||
    name !== savedName ||
    systemPrompt !== savedSystemPrompt,
  );

  // Build a renderer Theme from current tokens
  let previewTheme = $derived<Theme>({ name, tokens });

  // Slide type selector for preview
  let selectedSlideTypeName = $state(BUILT_IN_SLIDE_TYPES[0].name);
  let selectedSlideType = $derived(
    BUILT_IN_SLIDE_TYPES.find((t) => t.name === selectedSlideTypeName) ?? BUILT_IN_SLIDE_TYPES[0],
  );
  let previewData = $derived(buildDummyData(selectedSlideType.fields));
</script>

<svelte:head><title>{data.theme.name} — Themes — slidt</title></svelte:head>

<STUnsavedGuard {dirty} />

<div class="page">
  <div class="breadcrumb"><a href="/themes">{t('theme_edit.crumb')}</a> / {data.theme.name}</div>

  <div class="layout">
    <form
      method="POST"
      action="?/save"
      use:enhance={({ formData }) => {
        formData.set('tokens', JSON.stringify(tokens));
        formData.set('systemPrompt', systemPrompt);
        return async ({ result, update }) => {
          if (result.type === 'success') {
            saved = true;
            savedTokensJson = JSON.stringify(tokens);
            savedName = name;
            savedSystemPrompt = systemPrompt;
            setTimeout(() => (saved = false), 2000);
          }
          await update();
        };
      }}
      class="token-form"
    >
      <div class="form-header">
        <input class="name-input" type="text" name="name" bind:value={name} />
        <STBtn type="submit" variant="accent">{saved ? t('theme_edit.saved') : t('theme_edit.save')}</STBtn>
      </div>

      {#if form?.error}<p class="error">{form.error}</p>{/if}

      <div class="prompt-section">
        <label class="prompt-label" for="systemPrompt">{t('theme_edit.system_prompt_label')}</label>
        <p class="prompt-help">{t('theme_edit.system_prompt_help')}</p>
        <textarea
          id="systemPrompt"
          name="systemPrompt"
          bind:value={systemPrompt}
          placeholder={t('theme_edit.system_prompt_placeholder')}
          rows="6"
          class="prompt-textarea"
        ></textarea>
      </div>

      <!-- Font picker section -->
      {#if '--sl-font' in tokens}
        <div class="font-section">
          <div class="section-label">{t('theme_edit.fonts_label')}</div>
          <div class="font-row">
            <span class="font-row-label">{t('theme_edit.header_font_label')}</span>
            <select
              class="font-select"
              value={headerFont.preset}
              onchange={(e) => {
                headerFont = { ...headerFont, preset: (e.target as HTMLSelectElement).value };
                applyHeaderFont();
              }}
            >
              <option value="Neureal">{t('theme_edit.font_neureal')}</option>
              <option value="Inter">{t('theme_edit.font_inter')}</option>
              <option value="custom">{t('theme_edit.font_custom')}</option>
            </select>
            {#if headerFont.preset === 'custom'}
              <input
                type="text"
                class="font-custom-input"
                bind:value={headerFont.customName}
                placeholder={t('theme_edit.font_custom_placeholder')}
                oninput={applyHeaderFont}
              />
            {/if}
          </div>
          <div class="font-row">
            <span class="font-row-label">{t('theme_edit.body_font_label')}</span>
            <select
              class="font-select"
              value={bodyFont.preset}
              onchange={(e) => {
                bodyFont = { ...bodyFont, preset: (e.target as HTMLSelectElement).value };
                applyBodyFont();
              }}
            >
              <option value="Neureal">{t('theme_edit.font_neureal')}</option>
              <option value="Inter">{t('theme_edit.font_inter')}</option>
              <option value="custom">{t('theme_edit.font_custom')}</option>
            </select>
            {#if bodyFont.preset === 'custom'}
              <input
                type="text"
                class="font-custom-input"
                bind:value={bodyFont.customName}
                placeholder={t('theme_edit.font_custom_placeholder')}
                oninput={applyBodyFont}
              />
            {/if}
          </div>
        </div>
      {/if}

      <!-- Raw token list (excludes font tokens managed above) -->
      <div class="section-label">{t('theme_edit.tokens_label')}</div>
      <div class="token-list">
        {#each rawTokens as [key, val] (key)}
          <div class="token-row">
            <code class="token-key">{key}</code>
            {#if isColorToken(val)}
              <input
                type="color"
                value={val}
                oninput={(e) => { tokens = { ...tokens, [key]: (e.target as HTMLInputElement).value }; }}
              />
              <input
                type="text"
                class="token-text"
                value={val}
                oninput={(e) => { tokens = { ...tokens, [key]: (e.target as HTMLInputElement).value }; }}
              />
            {:else}
              <input
                type="text"
                class="token-text full"
                value={val}
                oninput={(e) => { tokens = { ...tokens, [key]: (e.target as HTMLInputElement).value }; }}
              />
            {/if}
          </div>
        {/each}
      </div>
    </form>

    <div class="preview-col">
      <div class="preview-header">
        <p class="preview-label">{t('theme_edit.preview_label')}</p>
        <label class="type-select-label" for="previewTypeSelect">
          {t('theme_edit.preview_type_label')}
          <select
            id="previewTypeSelect"
            class="type-select"
            bind:value={selectedSlideTypeName}
          >
            {#each BUILT_IN_SLIDE_TYPES as st}
              <option value={st.name}>{st.label}</option>
            {/each}
          </select>
        </label>
      </div>
      <SlidePreview slideType={selectedSlideType} slideData={previewData} theme={previewTheme} />
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
  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .form-header { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
  .name-input {
    flex: 1;
    padding: 10px 14px;
    border: 3px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    border-radius: 0;
    font-family: var(--st-font-display);
    font-size: 22px;
  }
  .error {
    color: var(--st-ink);
    background: var(--st-bg-deep);
    padding: 8px 12px;
    border-left: 3px solid var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 11px;
    margin-bottom: 12px;
  }
  .prompt-section { margin-bottom: 24px; }
  .prompt-label {
    display: block;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-bottom: 6px;
  }
  .prompt-help {
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink-dim);
    margin: 0 0 8px 0;
    line-height: 1.5;
  }
  .prompt-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg-deep);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 12px;
    line-height: 1.6;
    resize: vertical;
    border-radius: 0;
  }
  .prompt-textarea:focus { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }
  .font-section {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .section-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--st-ink-dim);
    margin-bottom: 6px;
    margin-top: 4px;
  }
  .font-section .section-label { margin-top: 0; }
  .font-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .font-row-label {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--st-ink);
    min-width: 100px;
    flex-shrink: 0;
  }
  .font-select {
    padding: 6px 10px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 12px;
    border-radius: 0;
    cursor: pointer;
  }
  .font-select:focus { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }
  .font-custom-input {
    flex: 1;
    min-width: 140px;
    padding: 6px 10px;
    border: 2px solid var(--st-ink);
    border-radius: 0;
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 12px;
  }
  .font-custom-input:focus { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }
  .token-list { display: flex; flex-direction: column; gap: 8px; }
  .token-row { display: flex; align-items: center; gap: 10px; }
  .token-key {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--st-ink);
    min-width: 200px;
    flex-shrink: 0;
  }
  input[type="color"] {
    width: 40px;
    height: 32px;
    border: 2px solid var(--st-ink);
    border-radius: 0;
    padding: 2px;
    cursor: pointer;
    background: var(--st-bg);
  }
  .token-text {
    flex: 1;
    padding: 6px 10px;
    border: 2px solid var(--st-ink);
    border-radius: 0;
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 12px;
  }
  .token-text:focus { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }
  .preview-col { display: flex; flex-direction: column; gap: 10px; }
  .preview-header {
    display: flex;
    align-items: baseline;
    gap: 16px;
    flex-wrap: wrap;
  }
  .preview-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin: 0;
    flex-shrink: 0;
  }
  .type-select-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--st-ink-dim);
    margin-left: auto;
  }
  .type-select {
    appearance: none;
    background: var(--st-bg-deep);
    color: var(--st-ink);
    border: 1px solid var(--st-ink-dim);
    border-radius: 0;
    font-family: var(--st-font-mono);
    font-size: 10px;
    padding: 3px 6px;
    cursor: pointer;
  }
  .type-select:focus { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }

  @media (max-width: 768px) {
    .page { padding: 16px 20px; }
    .layout { grid-template-columns: 1fr; }
    .token-key { min-width: 0; width: 140px; font-size: 10px; }
    .token-row { flex-wrap: wrap; gap: 6px; }
    .token-text { min-width: 0; }
    .preview-header { gap: 8px; }
    .type-select-label { margin-left: 0; }
    .font-row-label { min-width: 80px; }
    .font-custom-input { min-width: 100px; }
  }
</style>
