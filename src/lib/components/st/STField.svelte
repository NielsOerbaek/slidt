<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    n,
    label,
    value = $bindable(''),
    big = false,
    multi = false,
    mono = false,
    placeholder = '',
    type = 'text',
    disabled = false,
    autocomplete,
    name,
    children,
    oninput,
  }: {
    n?: string;
    label: string;
    value?: string;
    big?: boolean;
    multi?: boolean;
    mono?: boolean;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    autocomplete?: string;
    name?: string;
    children?: Snippet;
    oninput?: (e: Event) => void;
  } = $props();
</script>

<label class="st-field" class:has-num={Boolean(n)}>
  {#if n}
    <div class="num">{n}</div>
  {/if}
  <div class="body">
    <div class="label">{label}</div>
    <div class="value-wrap" class:big class:mono>
      {#if children}
        {@render children()}
      {:else if multi}
        <textarea
          bind:value
          {placeholder}
          {disabled}
          {name}
          rows="2"
          oninput={oninput}
        ></textarea>
      {:else}
        <input
          bind:value
          {type}
          {placeholder}
          {disabled}
          {autocomplete}
          {name}
          oninput={oninput}
        />
      {/if}
    </div>
  </div>
</label>

<style>
  .st-field {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
    cursor: text;
  }
  .st-field.has-num {
    grid-template-columns: 32px 1fr;
  }
  .num {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
    padding-top: 6px;
  }
  .label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .value-wrap {
    border-bottom: var(--st-rule-thick);
    padding-bottom: 6px;
    font-family: var(--st-font-display);
    font-size: 15px;
    letter-spacing: 0;
  }
  .value-wrap.big {
    font-size: 28px;
    letter-spacing: -0.02em;
  }
  .value-wrap.mono {
    font-family: var(--st-font-mono);
  }
  .value-wrap input,
  .value-wrap textarea {
    width: 100%;
    background: transparent;
    border: 0;
    outline: 0;
    padding: 0;
    font: inherit;
    color: inherit;
    line-height: 1.4;
  }
  .value-wrap textarea { min-height: 40px; }
</style>
