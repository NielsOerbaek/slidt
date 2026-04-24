<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showCreate = $state(false);
  let newToken = $state<string | null>(form?.token ?? null);
</script>

<svelte:head><title>Settings — slidt</title></svelte:head>

<div class="head-band">
  <div class="head-index">SET</div>
  <div class="head-title">
    <div class="meta">SETTINGS</div>
    <h1>API Keys</h1>
  </div>
  <div class="head-cta">
    <button class="btn-accent" onclick={() => { showCreate = !showCreate; newToken = null; }}>+ New Key</button>
  </div>
</div>

{#if newToken}
  <div class="token-reveal">
    <div class="token-label">NEW KEY — COPY NOW, IT WILL NOT BE SHOWN AGAIN</div>
    <code class="token-value">{newToken}</code>
    <div class="token-hint">Set as: <code>SLIDT_API_KEY={newToken}</code></div>
    <button class="btn" onclick={() => { newToken = null; }}>Dismiss</button>
  </div>
{/if}

{#if showCreate}
  <form method="POST" action="?/createKey"
    use:enhance={({ }) => {
      return async ({ result, update }) => {
        await update({ reset: false });
        if (result.type === 'success' && result.data?.token) {
          newToken = result.data.token as string;
          showCreate = false;
        }
      };
    }}
    class="create-form"
  >
    <span class="create-label">KEY NAME</span>
    <input type="text" name="name" placeholder="e.g. my-agent, ci-pipeline" required autofocus />
    <button type="submit" class="btn-accent">Create</button>
    <button type="button" class="btn" onclick={() => showCreate = false}>Cancel</button>
  </form>
{/if}

{#if data.keys.length === 0}
  <p class="empty">No API keys yet. Create one to allow CLI or agent access.</p>
{:else}
  <table class="key-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Created</th>
        <th>Last used</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each data.keys as key (key.id)}
        <tr>
          <td class="key-name">{key.name}</td>
          <td class="meta-cell">{new Date(key.createdAt).toLocaleDateString('da-DK')}</td>
          <td class="meta-cell">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('da-DK') : '—'}</td>
          <td>
            <form method="POST" action="?/revokeKey" use:enhance
              onsubmit={(e) => { if (!confirm('Revoke this key?')) e.preventDefault(); }}>
              <input type="hidden" name="id" value={key.id} />
              <button type="submit" class="btn-sm danger">Revoke</button>
            </form>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

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
  .head-cta { padding: 32px 24px; display: flex; align-items: flex-end; }

  .token-reveal {
    padding: 20px 40px;
    background: #001a00;
    border-bottom: var(--st-rule-thick);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .token-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #90ff90;
  }
  .token-value {
    font-family: var(--st-font-mono);
    font-size: 14px;
    background: #002200;
    padding: 10px 16px;
    color: #90ff90;
    border: 1px solid #90ff90;
    word-break: break-all;
  }
  .token-hint {
    font-family: var(--st-font-mono);
    font-size: 11px;
    color: #60cc60;
  }
  .token-hint code { font-size: 12px; }

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
    flex-shrink: 0;
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
  .btn-accent {
    background: var(--st-ink);
    color: var(--st-bg);
    border: 2px solid var(--st-ink);
    padding: 8px 20px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
  }
  .btn {
    background: transparent;
    color: var(--st-ink);
    border: 2px solid var(--st-ink);
    padding: 8px 20px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
  }
  .empty {
    padding: 40px;
    font-family: var(--st-font-mono);
    font-size: 12px;
    color: var(--st-ink-dim);
  }
  .key-table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: var(--st-rule-thick); }
  th {
    text-align: left;
    padding: 12px 40px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    font-weight: 400;
  }
  tbody tr { border-bottom: var(--st-rule-thin); }
  tbody tr:hover { background: var(--st-bg-deep); }
  td { padding: 16px 40px; }
  .key-name { font-family: var(--st-font-display); font-size: 22px; }
  .meta-cell { font-family: var(--st-font-mono); font-size: 11px; color: var(--st-ink-dim); }
  .btn-sm {
    background: transparent;
    color: #ff6060;
    border: 1px solid #ff6060;
    padding: 4px 12px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 0;
  }
  .btn-sm.danger:hover { background: #2a0000; }
</style>
