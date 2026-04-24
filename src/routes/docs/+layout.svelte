<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';

  let { children }: { children: Snippet } = $props();

  const sections = [
    { href: '/docs',           label: 'Overview' },
    { href: '/docs/agent',     label: 'Agent' },
    { href: '/docs/templates', label: 'Templates' },
    { href: '/docs/themes',    label: 'Themes' },
    { href: '/docs/cli',       label: 'CLI' },
    { href: '/docs/api',       label: 'API' },
  ];

  function isActive(href: string) {
    if (href === '/docs') return page.url.pathname === '/docs';
    return page.url.pathname.startsWith(href);
  }
</script>

<div class="docs-wrap">
  <div class="head-band">
    <div class="head-index">§5</div>
    <div class="head-title">
      <div class="meta">SLIDT / DOKUMENTATION</div>
      <h1>Docs</h1>
    </div>
  </div>

  <div class="docs-body">
    <aside class="sidebar">
      <nav class="sidebar-nav">
        {#each sections as s}
          <a class="sidebar-link" class:active={isActive(s.href)} href={s.href}>{s.label}</a>
        {/each}
      </nav>
    </aside>

    <main class="content">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .docs-wrap {
    min-height: calc(100vh - 49px);
    display: flex;
    flex-direction: column;
  }

  /* ── Head band ── */
  .head-band {
    display: grid;
    grid-template-columns: 80px 1fr;
    border-bottom: var(--st-rule-thick);
    flex-shrink: 0;
  }
  .head-index {
    border-right: var(--st-rule-thick);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
    padding: 36px 0;
  }
  .head-title { padding: 32px 40px; }
  .meta {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
    margin-bottom: 6px;
  }
  h1 {
    font-family: var(--st-font-display);
    font-size: 76px;
    line-height: 0.9;
    letter-spacing: -0.02em;
    margin: 0;
  }

  /* ── Body: sidebar + content ── */
  .docs-body {
    display: grid;
    grid-template-columns: 200px 1fr;
    flex: 1;
  }

  /* ── Sidebar ── */
  .sidebar {
    border-right: var(--st-rule-thick);
    position: sticky;
    top: 49px;
    height: calc(100vh - 49px);
    overflow-y: auto;
    flex-shrink: 0;
  }
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    padding: 24px 0;
  }
  .sidebar-link {
    display: block;
    padding: 10px 24px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--st-ink-dim);
    border-left: 3px solid transparent;
  }
  .sidebar-link:hover { color: var(--st-ink); background: var(--st-bg-deep); }
  .sidebar-link.active {
    color: var(--st-cobalt);
    border-left-color: var(--st-cobalt);
    background: var(--st-bg-deep);
  }

  /* ── Content ── */
  .content {
    padding: 48px 56px;
    max-width: 900px;
    min-width: 0;
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .head-band { grid-template-columns: 1fr; }
    .head-index { display: none; }
    .head-title { padding: 20px 20px; }
    h1 { font-size: clamp(40px, 12vw, 76px); }

    .docs-body { grid-template-columns: 1fr; }

    .sidebar {
      position: static;
      height: auto;
      border-right: none;
      border-bottom: var(--st-rule-thick);
    }
    .sidebar-nav {
      flex-direction: row;
      flex-wrap: wrap;
      padding: 0;
      gap: 0;
    }
    .sidebar-link {
      border-left: none;
      border-bottom: 3px solid transparent;
      padding: 12px 16px;
    }
    .sidebar-link.active { border-bottom-color: var(--st-cobalt); border-left-color: transparent; }

    .content { padding: 28px 20px; }
  }
</style>
