<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import SlidePreview from '$lib/components/SlidePreview.svelte';
  import { isColorToken } from '$lib/utils/token-utils.ts';
  import type { Theme, SlideType } from '../../../renderer/types.ts';
  import { content as contentType } from '../../../slide-types/content.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let tokens = $state<Record<string, string>>({ ...data.theme.tokens });
  let name = $state(data.theme.name);
  let saved = $state(false);

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

<div class="page">
  <div class="breadcrumb"><a href="/themes">Themes</a> / {data.theme.name}</div>

  <div class="layout">
    <form
      method="POST"
      action="?/save"
      use:enhance={({ formData }) => {
        formData.set('tokens', JSON.stringify(tokens));
        return async ({ result, update }) => {
          if (result.type === 'success') { saved = true; setTimeout(() => saved = false, 2000); }
          await update();
        };
      }}
      class="token-form"
    >
      <div class="form-header">
        <input class="name-input" type="text" name="name" bind:value={name} />
        <button type="submit" class="btn-save">{saved ? '✓ Saved' : 'Save'}</button>
      </div>

      {#if form?.error}<p class="error">{form.error}</p>{/if}

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
      <p class="preview-label">Live preview</p>
      <SlidePreview slideType={previewSlideType} slideData={previewSlideData} theme={previewTheme} />
    </div>
  </div>
</div>

<style>
  .page { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
  .breadcrumb { font-size: 13px; color: #888; margin-bottom: 20px; }
  .breadcrumb a { color: #6e31ff; text-decoration: none; }
  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .form-header { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
  .name-input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 18px; font-weight: 600; }
  .btn-save { background: #6e31ff; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .error { color: #c00; font-size: 13px; margin-bottom: 12px; }
  .token-list { display: flex; flex-direction: column; gap: 8px; }
  .token-row { display: flex; align-items: center; gap: 8px; }
  .token-key { font-size: 12px; font-family: monospace; color: #555; min-width: 200px; flex-shrink: 0; }
  input[type="color"] { width: 40px; height: 32px; border: 1px solid #ddd; border-radius: 4px; padding: 2px; cursor: pointer; }
  .token-text { flex: 1; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; font-family: monospace; }
  .token-text.full { flex: 1; }
  .preview-col { display: flex; flex-direction: column; gap: 8px; }
  .preview-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
</style>
