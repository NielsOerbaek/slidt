<script lang="ts">
  import STFace from './STFace.svelte';
  import { t } from '$lib/i18n/index.ts';

  type Tab = 'decks' | 'themes' | 'templates' | 'admin' | 'settings';

  let { active, user }: {
    active: Tab | null;
    user: { name: string; isAdmin?: boolean };
  } = $props();

  const items: { id: Tab; key: 'nav.decks' | 'nav.themes' | 'nav.templates' }[] = [
    { id: 'decks', key: 'nav.decks' },
    { id: 'themes', key: 'nav.themes' },
    { id: 'templates', key: 'nav.templates' },
  ];

  let menuOpen = $state(false);
  function closeMenu() { menuOpen = false; }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && closeMenu()} />

<nav class="st-nav">
  <div class="cell index">01</div>

  <div class="cell brand-row">
    <a class="brand" href="/decks" onclick={closeMenu}>
      <STFace size={18} />
      <span class="word">slidt</span>
    </a>
    {#each items as item, i (item.id)}
      <a class="tab" class:active={active === item.id} href="/{item.id}">
        <span class="tab-num">0{i + 2}</span>
        <span>{t(item.key)}</span>
        {#if active === item.id}<span class="dot" aria-hidden="true"></span>{/if}
      </a>
    {/each}
    {#if user.isAdmin}
      <a class="tab" class:active={active === 'admin'} href="/admin">
        <span class="tab-num">05</span>
        <span>{t('nav.admin')}</span>
        {#if active === 'admin'}<span class="dot" aria-hidden="true"></span>{/if}
      </a>
    {/if}
    <a class="tab" class:active={active === 'settings'} href="/settings">
      <span class="tab-num">⚙</span>
      <span>{t('nav.settings')}</span>
      {#if active === 'settings'}<span class="dot" aria-hidden="true"></span>{/if}
    </a>
  </div>

  <div class="cell right">
    <span class="user">
      <span class="user-prefix">{t('nav.user_prefix')}</span>
      <span class="user-name">{(user.name ?? '').toUpperCase()}</span>
    </span>
    <form method="POST" action="/logout" class="logout-form">
      <button type="submit" class="logout">{t('nav.logout')}</button>
    </form>
    <!-- Mobile hamburger -->
    <button
      class="mob-burger"
      type="button"
      onclick={() => menuOpen = !menuOpen}
      aria-label="Menu"
      aria-expanded={menuOpen}
    >
      <span class="burger-line" class:open={menuOpen}></span>
      <span class="burger-line mid" class:open={menuOpen}></span>
      <span class="burger-line" class:open={menuOpen}></span>
    </button>
  </div>
</nav>

<!-- Mobile menu overlay -->
{#if menuOpen}
  <div class="mob-menu">
    {#each items as item, i (item.id)}
      <a class="mob-link" class:active={active === item.id} href="/{item.id}" onclick={closeMenu}>
        <span class="mob-num">0{i + 2}</span>
        <span>{t(item.key)}</span>
        {#if active === item.id}<span class="mob-dot" aria-hidden="true"></span>{/if}
      </a>
    {/each}
    {#if user.isAdmin}
      <a class="mob-link" class:active={active === 'admin'} href="/admin" onclick={closeMenu}>
        <span class="mob-num">05</span>
        <span>{t('nav.admin')}</span>
        {#if active === 'admin'}<span class="mob-dot" aria-hidden="true"></span>{/if}
      </a>
    {/if}
    <a class="mob-link" class:active={active === 'settings'} href="/settings" onclick={closeMenu}>
      <span class="mob-num">⚙</span>
      <span>{t('nav.settings')}</span>
      {#if active === 'settings'}<span class="mob-dot" aria-hidden="true"></span>{/if}
    </a>
    <div class="mob-user">
      <span class="mob-user-name">{t('nav.user_prefix')}{(user.name ?? '').toUpperCase()}</span>
      <form method="POST" action="/logout">
        <button type="submit" class="mob-logout">{t('nav.logout')}</button>
      </form>
    </div>
  </div>
{/if}

<style>
  .st-nav {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    border-bottom: var(--st-rule-thick);
    background: var(--st-bg);
    position: relative;
    z-index: 40;
  }
  .cell { display: flex; align-items: stretch; }
  .index {
    border-right: var(--st-rule-thick);
    align-items: center;
    justify-content: center;
    padding: 16px 0;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
  }
  .brand-row { align-items: stretch; }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 24px;
    border-right: var(--st-rule-thin);
    color: var(--st-ink);
    text-decoration: none;
  }
  .brand .word {
    font-family: var(--st-font-display);
    font-size: 22px;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 22px;
    border-right: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--st-ink);
    text-decoration: none;
  }
  .tab:hover { background: var(--st-bg-deep); }
  .tab.active { color: var(--st-cobalt); }
  .tab-num { color: var(--st-ink-dim); }
  .dot {
    width: 8px;
    height: 8px;
    background: var(--st-cobalt);
    margin-left: 4px;
  }

  .right { align-items: stretch; }
  .user {
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-left: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
  }
  .user-prefix { color: var(--st-ink-dim); }
  .user-name { margin-left: 4px; }

  .logout-form { display: flex; align-items: stretch; }
  .logout {
    padding: 0 20px;
    border-left: var(--st-rule-thin);
    background: transparent;
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    cursor: pointer;
  }
  .logout:hover { background: var(--st-bg-deep); }

  /* ── Hamburger ── */
  .mob-burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 49px;
    height: 49px;
    background: none;
    border: 0;
    border-left: var(--st-rule-thin);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }
  .burger-line {
    display: block;
    width: 18px;
    height: 2px;
    background: var(--st-ink);
    transition: opacity 120ms, transform 120ms;
  }
  .burger-line.mid.open { opacity: 0; }
  .mob-burger:hover .burger-line { background: var(--st-cobalt); }

  /* ── Mobile menu ── */
  .mob-menu {
    position: fixed;
    top: 49px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--st-bg);
    z-index: 50;
    border-top: var(--st-rule-thick);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .mob-link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 24px;
    border-bottom: var(--st-rule-thin);
    text-decoration: none;
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .mob-link:hover { background: var(--st-bg-deep); }
  .mob-link.active { color: var(--st-cobalt); background: var(--st-bg-deep); }
  .mob-num { color: var(--st-ink-dim); width: 24px; flex-shrink: 0; }
  .mob-dot { width: 8px; height: 8px; background: var(--st-cobalt); margin-left: auto; }
  .mob-user {
    margin-top: auto;
    border-top: var(--st-rule-thick);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .mob-user-name {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--st-ink-dim);
  }
  .mob-logout {
    background: none;
    border: 0;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--st-ink);
    cursor: pointer;
    padding: 0;
  }
  .mob-logout:hover { color: var(--st-cobalt); }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .st-nav { grid-template-columns: 1fr auto; }
    .index { display: none; }
    .tab { display: none; }
    .user { display: none; }
    .logout-form { display: none; }
    .mob-burger { display: flex; }
  }
</style>
