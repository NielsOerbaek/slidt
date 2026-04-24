<script lang="ts">
  import type { Snippet } from 'svelte';

  let { index = '00', children, right }: {
    index?: string;
    children: Snippet;
    right?: Snippet;
  } = $props();
</script>

<div class="st-meta">
  <div class="cell index">{index}</div>
  <div class="cell middle">
    {@render children()}
  </div>
  <div class="cell right">
    {#if right}{@render right()}{/if}
  </div>
</div>

<style>
  .st-meta {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    border-bottom: var(--st-rule-thick);
    background: var(--st-bg);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
  }
  .cell {
    padding: 14px;
    display: flex;
    align-items: center;
  }
  .index {
    border-right: var(--st-rule-thick);
    justify-content: center;
    color: var(--st-ink-dim);
  }
  .middle {
    gap: 16px;
  }
  .right {
    border-left: var(--st-rule-thin);
    color: var(--st-ink-dim);
  }
</style>
