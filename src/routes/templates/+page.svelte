<script lang="ts">
  import type { PageData } from './$types.js';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Templates — slidt</title></svelte:head>

<div class="page">
  <div class="page-header">
    <h1>Templates</h1>
  </div>
  <ul class="list">
    {#each data.slideTypes as st (st.id)}
      <li class="item">
        <a href="/templates/{st.id}">
          <span class="name">{st.label}</span>
          <span class="code">{st.name}</span>
        </a>
        <span class="badge {st.scope}">{st.scope}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .page { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
  .page-header { margin-bottom: 24px; }
  h1 { font-size: 28px; font-weight: 700; margin: 0; }
  .list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  .item { background: white; border: 1px solid #eee; border-radius: 10px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
  .item a { display: flex; flex-direction: column; gap: 2px; text-decoration: none; color: inherit; }
  .name { font-size: 15px; font-weight: 600; color: #1a1a2e; }
  .code { font-size: 12px; color: #888; font-family: monospace; }
  .badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; }
  .badge.global { background: #e8f4ff; color: #0066cc; }
  .badge.deck { background: #f0eeff; color: #6e31ff; }
</style>
