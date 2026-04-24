<script lang="ts">
  import type { Field } from '../../renderer/types.ts';

  let { field, value, onchange }: {
    field: Field;
    value: unknown;
    onchange: (v: unknown) => void;
  } = $props();

  function defaultForField(f: Field): unknown {
    if (f.default !== undefined) return f.default;
    if (f.type === 'bool') return false;
    if (f.type === 'list') return [];
    if (f.type === 'group') {
      return Object.fromEntries((f.fields ?? []).map((sf) => [sf.name, defaultForField(sf)]));
    }
    return '';
  }
</script>

{#if field.type === 'text' || field.type === 'image'}
  <input
    type="text"
    value={value as string ?? ''}
    placeholder={field.type === 'image' ? '/api/assets/...' : ''}
    oninput={(e) => onchange((e.target as HTMLInputElement).value)}
  />

{:else if field.type === 'richtext' || field.type === 'markdown'}
  <textarea
    value={value as string ?? ''}
    rows={field.type === 'markdown' ? 6 : 3}
    oninput={(e) => onchange((e.target as HTMLTextAreaElement).value)}
  ></textarea>

{:else if field.type === 'bool'}
  <label class="bool-label">
    <input
      type="checkbox"
      checked={value as boolean ?? false}
      onchange={(e) => onchange((e.target as HTMLInputElement).checked)}
    />
    <span>{field.label ?? field.name}</span>
  </label>

{:else if field.type === 'select' && field.options}
  <select
    value={value as string ?? ''}
    onchange={(e) => onchange((e.target as HTMLSelectElement).value)}
  >
    <option value="">— select —</option>
    {#each field.options as opt}
      <option value={opt}>{opt}</option>
    {/each}
  </select>

{:else if field.type === 'list' && field.items}
  {@const items = Array.isArray(value) ? (value as unknown[]) : []}
  <div class="list-field">
    {#each items as item, i}
      <div class="list-row">
        <svelte:self
          field={field.items!}
          value={item}
          onchange={(v) => {
            const next = [...items];
            next[i] = v;
            onchange(next);
          }}
        />
        <button
          type="button"
          class="remove-btn"
          onclick={() => onchange(items.filter((_, idx) => idx !== i))}
          aria-label="Remove"
        >×</button>
      </div>
    {/each}
    <button
      type="button"
      class="add-item-btn"
      onclick={() => onchange([...items, defaultForField(field.items!)])}
    >
      + Add {field.items.label ?? field.items.name ?? 'item'}
    </button>
  </div>

{:else if field.type === 'group' && field.fields}
  {@const grp = (typeof value === 'object' && value !== null) ? (value as Record<string, unknown>) : {}}
  <div class="group-field">
    {#each field.fields as subField}
      <div class="group-row">
        <label class="sub-label">{subField.label ?? subField.name}</label>
        <svelte:self
          field={subField}
          value={grp[subField.name]}
          onchange={(v) => onchange({ ...grp, [subField.name]: v })}
        />
      </div>
    {/each}
  </div>
{/if}

<style>
  input[type="text"], select {
    width: 100%;
    padding: 8px 10px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    border-radius: 0;
    font: inherit;
    font-size: 14px;
  }
  input[type="text"]:focus, select:focus, textarea:focus {
    outline: 2px solid var(--st-cobalt);
    outline-offset: -2px;
    border-color: var(--st-ink);
  }
  textarea {
    width: 100%;
    padding: 8px 10px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    border-radius: 0;
    font: inherit;
    font-size: 14px;
    resize: vertical;
  }
  .bool-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--st-font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
  }
  .list-field { display: flex; flex-direction: column; gap: 8px; }
  .list-row { display: flex; gap: 8px; align-items: flex-start; }
  .list-row > :global(*:first-child) { flex: 1; }
  .remove-btn {
    flex-shrink: 0;
    background: var(--st-bg);
    border: 2px solid var(--st-ink);
    border-radius: 0;
    padding: 4px 10px;
    cursor: pointer;
    color: var(--st-ink-dim);
    line-height: 1;
    font-family: var(--st-font-mono);
    font-size: 14px;
  }
  .remove-btn:hover { color: var(--st-bg); background: var(--st-ink); }
  .add-item-btn {
    background: transparent;
    border: 2px dashed var(--st-ink-dim);
    border-radius: 0;
    padding: 8px 12px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--st-ink-dim);
    cursor: pointer;
    width: 100%;
  }
  .add-item-btn:hover { border-color: var(--st-cobalt); color: var(--st-cobalt); }
  .group-field {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    background: var(--st-bg-deep);
    border: 2px solid var(--st-ink);
    border-radius: 0;
  }
  .group-row { display: flex; flex-direction: column; gap: 6px; }
  .sub-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--st-ink-dim);
  }
</style>
