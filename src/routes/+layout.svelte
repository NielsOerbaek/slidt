<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types.js';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

{#if data.user}
  <nav>
    <a href="/decks" class="brand">slidt</a>
    <a href="/decks">Decks</a>
    <a href="/themes">Themes</a>
    <a href="/templates">Templates</a>
    <span class="spacer"></span>
    <span class="user-name">{data.user.name}</span>
    <form method="POST" action="/logout">
      <button type="submit">Log out</button>
    </form>
  </nav>
{/if}

{@render children()}

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; }
  :global(body) { margin: 0; font-family: system-ui, sans-serif; background: #f9f9fb; color: #1a1a2e; }
  :global(a) { color: #6e31ff; }

  nav {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 24px;
    height: 52px;
    background: #1a1a2e;
    color: white;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .brand { font-weight: 700; font-size: 18px; letter-spacing: -0.5px; color: white; text-decoration: none; }
  nav a { color: #a783ff; text-decoration: none; font-size: 14px; }
  nav a:hover { color: white; }
  .spacer { flex: 1; }
  .user-name { font-size: 13px; opacity: 0.6; }
  nav button {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.7);
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }
  nav button:hover { border-color: white; color: white; }
</style>
