<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { isColorToken } from '$lib/utils/token-utils.ts';
  import type { Theme, SlideType } from '../../../renderer/types.ts';
  import { content as contentType } from '../../../slide-types/content.ts';

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

  const dirty = $derived(
    JSON.stringify(tokens) !== savedTokensJson ||
    name !== savedName ||
    systemPrompt !== savedSystemPrompt,
  );

  // Build a renderer Theme from current tokens
  let previewTheme = $derived<Theme>({ name, tokens });

  // Use the content slide type for live preview
  const previewSlideType: SlideType = contentType;
  const previewSlideData = {
    title: 'Sample heading',
    eyebrow: 'PREVIEW',
    bullets: ['First bullet point', 'Second bullet point', 'Third bullet point'],
  };
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

      <div class="token-list">
        {#each Object.entries(tokens) as [key, val]}
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
      <p class="preview-label">{t('theme_edit.preview_label')}</p>
      <SlidePreview slideType={previewSlideType} slideData={previewSlideData} theme={previewTheme} />
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
    .token-key { min-width: 0; width: 140px; font-size: 10px; }
    .token-row { flex-wrap: wrap; gap: 6px; }
    .token-text { min-width: 0; }
  }
</style>
