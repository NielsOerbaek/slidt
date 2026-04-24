<script lang="ts">
  import '$lib/design/global.css';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types.js';
  import { page } from '$app/state';
  import STNav from '$lib/components/st/STNav.svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  type Tab = 'decks' | 'themes' | 'templates';
  function activeFromPath(pathname: string): Tab | null {
    if (pathname.startsWith('/decks')) return 'decks';
    if (pathname.startsWith('/themes')) return 'themes';
    if (pathname.startsWith('/templates')) return 'templates';
    return null;
  }
</script>

{#if data.user}
  <STNav active={activeFromPath(page.url.pathname)} user={data.user} />
{/if}

{@render children()}
