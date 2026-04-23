<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import { formatRelativeDate } from '$lib/utils/date-utils.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let creating = $state(false);
  let newTitle = $state('');
</script>

<svelte:head><title>Decks — slidt</title></svelte:head>

<div class="page">
  <div class="page-header">
    <h1>Decks</h1>
    <button onclick={() => creating = true} class="btn-primary">+ New deck</button>
  </div>

  {#if creating}
    <form method="POST" action="?/create" use:enhance class="create-form">
      <input
        type="text"
        name="title"
        placeholder="Deck title…"
        bind:value={newTitle}
        required
        autofocus
      />
      <button type="submit" class="btn-primary">Create</button>
      <button type="button" onclick={() => { creating = false; newTitle = ''; }}>Cancel</button>
    </form>
  {/if}

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  {#if data.decks.length === 0 && !creating}
    <p class="empty">No decks yet. Create your first one!</p>
  {:else}
    <ul class="deck-list">
      {#each data.decks as deck (deck.id)}
        <li class="deck-card">
          <a href="/decks/{deck.id}" class="deck-link">
            <span class="deck-title">{deck.title}</span>
            <span class="deck-meta">
              {deck.slideOrder.length} slides · Updated {formatRelativeDate(deck.updatedAt)}
            </span>
          </a>
          <form method="POST" action="?/delete" use:enhance>
            <input type="hidden" name="id" value={deck.id} />
            <button type="submit" class="btn-delete" aria-label="Delete deck">×</button>
          </form>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .page { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  h1 { font-size: 28px; font-weight: 700; margin: 0; }
  .btn-primary { background: #6e31ff; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-primary:hover { background: #5a28d4; }
  .create-form { display: flex; gap: 8px; margin-bottom: 24px; }
  .create-form input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; }
  .create-form input:focus { outline: 2px solid #6e31ff; border-color: transparent; }
  .create-form button { padding: 10px 16px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer; font-size: 14px; background: white; }
  .error { color: #c00; font-size: 13px; margin-bottom: 16px; }
  .empty { color: #888; text-align: center; padding: 60px 0; }
  .deck-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  .deck-card { display: flex; align-items: center; background: white; border-radius: 10px; border: 1px solid #eee; transition: box-shadow 0.15s; }
  .deck-card:hover { box-shadow: 0 2px 12px rgba(110,49,255,0.1); }
  .deck-link { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 16px 20px; text-decoration: none; color: inherit; }
  .deck-title { font-size: 16px; font-weight: 600; color: #1a1a2e; }
  .deck-meta { font-size: 12px; color: #888; }
  .btn-delete { background: transparent; border: none; color: #ccc; font-size: 20px; padding: 16px; cursor: pointer; line-height: 1; }
  .btn-delete:hover { color: #e00; }
</style>
