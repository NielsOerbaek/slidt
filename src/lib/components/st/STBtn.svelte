<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'ghost' | 'primary' | 'accent';

  let {
    variant = 'ghost',
    href,
    type = 'button',
    disabled = false,
    onclick,
    children,
    block = false,
    size = 'md',
    title,
  }: {
    variant?: Variant;
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
    block?: boolean;
    size?: 'sm' | 'md' | 'lg';
    title?: string;
  } = $props();
</script>

{#if href}
  <a class="st-btn st-btn-{variant} st-btn-{size}" class:block {href} {title}>
    {@render children()}
  </a>
{:else}
  <button class="st-btn st-btn-{variant} st-btn-{size}" class:block {type} {disabled} {onclick} {title}>
    {@render children()}
  </button>
{/if}

<style>
  .st-btn {
    font-family: var(--st-font-mono);
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    border: 3px solid var(--st-ink);
    background: transparent;
    color: var(--st-ink);
    padding: 10px 18px;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 120ms ease;
    text-decoration: none;
  }
  .st-btn-sm { padding: 6px 12px; font-size: 10px; letter-spacing: 0.12em; border-width: 2px; }
  .st-btn-lg { padding: 16px 22px; font-size: 14px; }

  .st-btn-ghost:hover:not(:disabled) { background: var(--st-bg-deep); }

  .st-btn-primary {
    background: var(--st-ink);
    color: var(--st-bg);
  }
  .st-btn-primary:hover:not(:disabled) { background: #1a1a18; }

  .st-btn-accent {
    background: var(--st-cobalt);
    color: var(--st-bg);
    border-color: var(--st-cobalt);
  }
  .st-btn-accent:hover:not(:disabled) { background: #0e34b8; border-color: #0e34b8; }

  .st-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .block { display: flex; width: 100%; }
</style>
