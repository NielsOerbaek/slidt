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
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  input[type="text"]:focus, select:focus, textarea:focus {
    outline: 2px solid #6e31ff;
    border-color: transparent;
  }
  textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    resize: vertical;
    font-family: inherit;
  }
  .bool-label { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .list-field { display: flex; flex-direction: column; gap: 6px; }
  .list-row { display: flex; gap: 6px; align-items: flex-start; }
  .list-row > :global(*:first-child) { flex: 1; }
  .remove-btn {
    flex-shrink: 0;
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    color: #888;
    line-height: 1;
  }
  .remove-btn:hover { color: #e00; border-color: #fcc; }
  .add-item-btn {
    background: none;
    border: 1px dashed #ccc;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    width: 100%;
  }
  .add-item-btn:hover { border-color: #6e31ff; color: #6e31ff; }
  .group-field { display: flex; flex-direction: column; gap: 10px; padding: 12px; background: #f9f9fb; border-radius: 8px; border: 1px solid #eee; }
  .group-row { display: flex; flex-direction: column; gap: 4px; }
  .sub-label { font-size: 12px; font-weight: 500; color: #666; text-transform: capitalize; }
</style>
