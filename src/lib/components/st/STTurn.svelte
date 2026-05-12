<script lang="ts">
  import type { Snippet } from 'svelte';
  import STFace from './STFace.svelte';

  let { num, role, thinking = false, children }: {
    num: string;
    role: 'YOU' | '-_-';
    thinking?: boolean;
    children: Snippet;
  } = $props();

  const isAgent = $derived(role === '-_-');
</script>

<div class="st-turn">
  <div class="num">{num}</div>
  <div class="body">
    <div class="role" class:agent={isAgent}>
      {#if isAgent}
        <STFace size={9} color="var(--st-cobalt)" animated={thinking} />
      {:else}
        {role}
      {/if}
    </div>
    <div class="content" class:thinking>
      {@render children()}
    </div>
  </div>
</div>

<style>
  .st-turn {
    display: grid;
    grid-template-columns: 26px 1fr;
    gap: 10px;
  }
  .num {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    padding-top: 2px;
  }
  .role {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.28em;
    margin-bottom: 4px;
    color: var(--st-ink);
  }
  .role.agent { color: var(--st-cobalt); }
  .content { line-height: 1.55; color: var(--st-ink); }
  .content.thinking { color: var(--st-ink-dim); font-style: italic; }
</style>
