<script lang="ts">
  import STFace from './STFace.svelte';
  import { t } from '$lib/i18n/index.ts';

  type Tab = 'decks' | 'themes' | 'templates';

  let { active, user }: {
    active: Tab | null;
    user: { name: string };
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
</style>
