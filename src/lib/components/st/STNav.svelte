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
</script>

<nav class="st-nav">
  <div class="cell index">01</div>

  <div class="cell brand-row">
    <a class="brand" href="/decks">
      <STFace size={18} />
      <span class="word">slidt</span>
    </a>
    {#each items as item, i (item.id)}
      <a
        class="tab"
        class:active={active === item.id}
        href="/{item.id}"
      >
        <span class="tab-num">0{i + 2}</span>
        <span>{t(item.key)}</span>
        {#if active === item.id}
          <span class="dot" aria-hidden="true"></span>
        {/if}
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
  </div>
</nav>

<style>
  .st-nav {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    border-bottom: var(--st-rule-thick);
    background: var(--st-bg);
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

  @media (max-width: 768px) {
    .st-nav {
      grid-template-columns: 1fr auto;
      flex-wrap: wrap;
    }
    .index { display: none; }
    .brand-row {
      grid-column: 1;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .brand-row::-webkit-scrollbar { display: none; }
    .right { grid-column: 2; }
    .user-prefix { display: none; }
    .tab-num { display: none; }
    .tab { padding: 0 14px; font-size: 10px; letter-spacing: 0.15em; }
    .brand { padding: 0 16px; }
  }

  @media (max-width: 480px) {
    /* On very small screens: brand + icon-only tabs */
    .tab span:not(.dot) { display: none; }
    /* Show only the first letter of each tab via pseudo — simpler: just keep the dot indicator */
    .tab { padding: 0 10px; min-width: 36px; justify-content: center; }
    .brand .word { font-size: 18px; }
    .user-name { display: none; }
  }
</style>
