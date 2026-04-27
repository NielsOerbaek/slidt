<script lang="ts">
  import '$lib/design/global.css';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types.js';
  import { page } from '$app/state';
  import STNav from '$lib/components/st/STNav.svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  type Tab = 'decks' | 'themes' | 'templates' | 'docs' | 'admin' | 'settings';
  function activeFromPath(pathname: string): Tab | null {
    if (pathname.startsWith('/decks')) return 'decks';
    if (pathname.startsWith('/themes')) return 'themes';
    if (pathname.startsWith('/templates')) return 'templates';
    if (pathname.startsWith('/docs')) return 'docs';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/settings')) return 'settings';
    return null;
  }

  // Pages that fill the viewport themselves (workspaces, public viewers, docs
  // with sticky sidebar) skip the framed shell — they need full bleed.
  const fullBleedPaths = [
    /^\/decks\/[^/]+$/,
    /^\/themes\/[^/]+$/,
    /^\/share\//,
    /^\/docs(\/|$)/,
  ];
  const framed = $derived(
    !!data.user && !fullBleedPaths.some((re) => re.test(page.url.pathname)),
  );
</script>

{#if data.user}
  <STNav active={activeFromPath(page.url.pathname)} user={data.user} />
{/if}

{#if framed}
  <div class="page-shell">
    <div class="page-frame">
      {@render children()}
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .page-shell {
    background: var(--st-bg-deep);
    min-height: calc(100vh - 50px);
    padding: 32px;
  }
  .page-frame {
    max-width: 1280px;
    margin: 0 auto;
    background: var(--st-bg);
    box-shadow: 0 1px 2px rgba(8, 8, 7, 0.06), 0 8px 24px rgba(8, 8, 7, 0.08);
  }

  @media (max-width: 768px) {
    .page-shell {
      background: var(--st-bg);
      padding: 0;
      min-height: 0;
    }
    .page-frame {
      max-width: none;
      box-shadow: none;
    }
  }
</style>
