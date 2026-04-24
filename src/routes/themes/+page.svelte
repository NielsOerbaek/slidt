<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import STBtn from '$lib/components/st/STBtn.svelte';
  import { t } from '$lib/i18n/index.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let creating = $state(false);
</script>

<svelte:head><title>{t('themes.title')}</title></svelte:head>

<div class="head-band">
  <div class="head-index">§02</div>
  <div class="head-title">
    <div class="meta">{t('themes.workspace')} {String(data.themes.length).padStart(2, '0')} {t('themes.items_suffix')}</div>
    <h1>{t('themes.headline')}</h1>
  </div>
  <div class="head-cta">
    <STBtn variant="accent" onclick={() => { creating = !creating; }}>{t('themes.new')}</STBtn>
  </div>
</div>

{#if creating}
  <form method="POST" action="?/create" use:enhance class="create-form">
    <span class="create-label">{t('themes.new_label')}</span>
    <input type="text" name="name" placeholder={t('themes.placeholder_name')} required autofocus />
    <STBtn type="submit" variant="accent">{t('decks.create')}</STBtn>
    <STBtn onclick={() => { creating = false; }}>{t('decks.cancel')}</STBtn>
  </form>
{/if}

{#if form?.error}<div class="error">{form.error}</div>{/if}

<ul class="list">
  {#each data.themes as theme (theme.id)}
    <li class="row">
      <a href="/themes/{theme.id}" class="row-link">
        <span class="name">{theme.name}</span>
        <span class="row-meta">
          {theme.isPreset ? t('themes.preset') : ''}{theme.scope.toUpperCase()}
        </span>
      </a>
      <div class="swatches">
        {#each Object.values(theme.tokens).slice(0, 8) as color}
          {#if color.startsWith('#')}
            <span class="sw" style="background:{color};" title={color}></span>
          {/if}
        {/each}
      </div>
    </li>
  {/each}
</ul>

<style>
  .head-band {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    border-bottom: var(--st-rule-thick);
  }
  .head-index {
    border-right: var(--st-rule-thick);
    padding: 36px 0;
    text-align: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
  }
  .head-title { padding: 32px 40px; border-right: var(--st-rule-thick); }
  .meta {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-bottom: 10px;
  }
  h1 {
    font-family: var(--st-font-display);
    font-weight: 400;
    font-size: 76px;
    line-height: 0.9;
    letter-spacing: -0.04em;
    margin: 0;
  }
  .head-cta {
    padding: 32px 24px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  }

  .create-form {
    border-bottom: var(--st-rule-thin);
    padding: 18px 40px;
    background: var(--st-bg-deep);
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .create-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
  }
  .create-form input {
    flex: 1;
    font-family: var(--st-font-display);
    font-size: 22px;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    padding: 10px 14px;
    color: var(--st-ink);
  }
  .error {
    padding: 14px 40px;
    color: var(--st-ink);
    background: var(--st-bg-deep);
    border-bottom: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 11px;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .row {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    border-bottom: var(--st-rule-thin);
    background: var(--st-bg);
  }
  .row::before {
    content: '';
    border-right: var(--st-rule-thick);
  }
  .row-link {
    padding: 22px 20px;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-right: var(--st-rule-thin);
  }
  .row-link:hover { background: var(--st-bg-deep); }
  .name {
    font-family: var(--st-font-display);
    font-size: 28px;
    letter-spacing: -0.02em;
  }
  .row-meta {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--st-ink-dim);
  }
  .swatches {
    display: flex;
    gap: 6px;
    padding: 22px 20px;
    align-items: center;
  }
  .sw {
    width: 22px;
    height: 22px;
    border: var(--st-rule-thin);
  }
</style>
