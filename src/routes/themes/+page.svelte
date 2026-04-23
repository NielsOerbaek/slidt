<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let creating = $state(false);
</script>

<svelte:head><title>Themes — slidt</title></svelte:head>

<div class="page">
  <div class="page-header">
    <h1>Themes</h1>
    <button class="btn-primary" onclick={() => creating = !creating}>+ New theme</button>
  </div>

  {#if creating}
    <form method="POST" action="?/create" use:enhance class="create-form">
      <input type="text" name="name" placeholder="Theme name…" required autofocus />
      <button type="submit" class="btn-primary">Create</button>
      <button type="button" onclick={() => creating = false}>Cancel</button>
    </form>
  {/if}

  {#if form?.error}<p class="error">{form.error}</p>{/if}

  <ul class="list">
    {#each data.themes as theme (theme.id)}
      <li class="item">
        <a href="/themes/{theme.id}">
          <span class="name">{theme.name}</span>
          <span class="meta">{theme.isPreset ? 'preset · ' : ''}{theme.scope}</span>
        </a>
        <div class="swatches">
          {#each Object.values(theme.tokens).slice(0, 8) as color}
            {#if color.startsWith('#')}
              <span class="swatch" style="background:{color};" title={color}></span>
            {/if}
          {/each}
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .page { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  h1 { font-size: 28px; font-weight: 700; margin: 0; }
  .btn-primary { background: #6e31ff; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .create-form { display: flex; gap: 8px; margin-bottom: 24px; }
  .create-form input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; }
  .create-form button { padding: 10px 16px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer; background: white; font-size: 14px; }
  .error { color: #c00; font-size: 13px; margin-bottom: 16px; }
  .list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  .item { background: white; border: 1px solid #eee; border-radius: 10px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
  .item a { display: flex; flex-direction: column; gap: 4px; text-decoration: none; color: inherit; }
  .name { font-size: 16px; font-weight: 600; color: #1a1a2e; }
  .meta { font-size: 12px; color: #888; }
  .swatches { display: flex; gap: 4px; }
  .swatch { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }
</style>
