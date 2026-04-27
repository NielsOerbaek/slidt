<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { t } from '$lib/i18n/index.ts';

  let { dirty }: { dirty: boolean } = $props();

  let showPrompt = $state(false);
  let pendingUrl: URL | null = $state(null);
  let bypass = false;

  beforeNavigate((nav) => {
    if (bypass) { bypass = false; return; }
    if (!dirty) return;
    if (!nav.to || nav.type === 'leave') return;
    pendingUrl = nav.to.url;
    nav.cancel();
    showPrompt = true;
  });

  $effect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        // Required for some browsers — the message itself is ignored.
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  });

  function confirmLeave() {
    const url = pendingUrl;
    pendingUrl = null;
    showPrompt = false;
    bypass = true;
    if (url) goto(url);
  }

  function stay() {
    pendingUrl = null;
    showPrompt = false;
  }

  function onBackdropKey(e: KeyboardEvent) {
    if (e.key === 'Escape') stay();
  }
</script>

{#if showPrompt}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="unsaved-title"
    onclick={stay}
    onkeydown={onBackdropKey}
    transition:fade={{ duration: 120 }}
  >
    <div
      class="modal"
      role="document"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
    >
      <div class="head">
        <span id="unsaved-title">{t('unsaved.title')}</span>
      </div>
      <div class="body">
        <p>{t('unsaved.body')}</p>
      </div>
      <div class="actions">
        <button type="button" class="btn stay" onclick={stay} autofocus>
          {t('unsaved.stay')}
        </button>
        <button type="button" class="btn leave" onclick={confirmLeave}>
          {t('unsaved.leave')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 8, 7, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
  }
  .modal {
    background: var(--st-bg);
    border: var(--st-rule-thick);
    max-width: 460px;
    width: 100%;
    box-shadow: 0 16px 40px rgba(8, 8, 7, 0.25);
  }
  .head {
    padding: 18px 22px;
    border-bottom: var(--st-rule-thick);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--st-cobalt);
    text-transform: uppercase;
  }
  .body {
    padding: 22px;
    font-family: var(--st-font-display);
    font-size: 22px;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .body p { margin: 0; }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: var(--st-rule-thick);
  }
  .btn {
    padding: 16px 20px;
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    border: 0;
    cursor: pointer;
  }
  .btn:focus-visible { outline: 2px solid var(--st-cobalt); outline-offset: -2px; }
  .btn.stay:hover { background: var(--st-bg-deep); }
  .btn.leave {
    border-left: var(--st-rule-thick);
    background: var(--st-ink);
    color: var(--st-bg);
  }
  .btn.leave:hover { background: #2a0000; }

  @media (max-width: 480px) {
    .body { font-size: 18px; padding: 18px; }
    .head { padding: 14px 18px; }
    .btn { padding: 14px 16px; }
  }
</style>
