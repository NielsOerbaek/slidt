<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types.js';
  import STMetaBar from '$lib/components/st/STMetaBar.svelte';
  import STBtn from '$lib/components/st/STBtn.svelte';
  import STFace from '$lib/components/st/STFace.svelte';
  import { t } from '$lib/i18n/index.ts';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>{t('login.title')}</title></svelte:head>

<div class="login">
  <STMetaBar index="00">
    <span>{t('meta.product')}</span>
    <span class="dim">·</span>
    <span class="dim">{t('meta.internal')}</span>
    <span class="dim">·</span>
    <span class="dim">{t('meta.version')}</span>
    {#snippet right()}<span>{t('meta.cph')}</span>{/snippet}
  </STMetaBar>

  <div class="body">
    <aside class="gutter">
      <span>A</span>
      <span>B</span>
      <span>C</span>
      <span class="spacer"></span>
      <span>—</span>
    </aside>

    <section class="hero">
      <div class="tag">{t('login.tag')}</div>
      <div class="word">slidt</div>
      <div class="mark">-_-</div>
    </section>

    <aside class="form-side">
      <div class="form-tag">{t('login.form_tag')}</div>

      {#if form?.error}
        <div class="error" role="alert">{form.error}</div>
      {/if}

      <form method="POST" use:enhance>
        <label class="field">
          <span class="label">{t('login.email_label')}</span>
          <span class="value">
            <input type="email" name="email" required autocomplete="email" />
          </span>
        </label>

        <label class="field">
          <span class="label">{t('login.password_label')}</span>
          <span class="value">
            <input type="password" name="password" required autocomplete="current-password" />
          </span>
        </label>

        <STBtn type="submit" variant="accent" size="lg" block>
          {t('login.submit')}
        </STBtn>
      </form>

      <div class="agent-row">
        <STFace size={22} color="var(--st-cobalt)" />
        <span class="agent-line">{t('login.agent_ready')}</span>
      </div>

      <div class="footer">{t('login.help')}</div>
    </aside>
  </div>
</div>

<style>
  .login {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--st-bg);
  }
  .dim { color: var(--st-ink-dim); }

  .body {
    display: grid;
    grid-template-columns: 80px 1fr 440px;
    flex: 1;
    min-height: 0;
  }

  .gutter {
    border-right: var(--st-rule-thick);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
    gap: 80px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
  }
  .gutter .spacer { flex: 1; }

  .hero {
    padding: 48px;
    border-right: var(--st-rule-thick);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .tag {
    font-family: var(--st-font-mono);
    font-size: 12px;
    letter-spacing: 0.3em;
    color: var(--st-cobalt);
    margin-bottom: 20px;
  }
  .word {
    font-family: var(--st-font-display);
    font-size: clamp(120px, 18vw, 240px);
    line-height: 0.9;
    letter-spacing: -0.05em;
  }
  .mark {
    font-family: var(--st-font-mono);
    font-size: clamp(100px, 15vw, 200px);
    line-height: 1;
    letter-spacing: 0.02em;
    color: var(--st-ink-dim);
    margin-top: 12px;
  }

  .form-side {
    padding: 44px;
    background: var(--st-bg-deep);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .form-tag {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--st-cobalt);
    margin-bottom: 32px;
  }
  .error {
    border: var(--st-rule-thin);
    padding: 10px 14px;
    margin-bottom: 16px;
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    background: var(--st-bg);
  }
  .field {
    display: block;
    margin-bottom: 24px;
  }
  .label {
    display: block;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-bottom: 8px;
  }
  .value {
    display: block;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    padding: 12px 14px;
  }
  .value input {
    font: inherit;
    font-size: 18px;
    width: 100%;
    background: transparent;
    border: 0;
    outline: 0;
    color: var(--st-ink);
    letter-spacing: 0;
  }
  .value input[type="password"] { letter-spacing: 0.3em; }

  .agent-row {
    margin-top: 36px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .agent-line {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
  }

  .footer {
    margin-top: 24px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--st-ink-dim);
  }

  @media (max-width: 768px) {
    .body {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
    .gutter { display: none; }
    .hero {
      padding: 40px 28px 32px;
      border-right: none;
      border-bottom: var(--st-rule-thick);
    }
    .word { font-size: clamp(72px, 18vw, 140px) !important; }
    .mark { font-size: clamp(32px, 8vw, 56px) !important; }
    .form-side {
      padding: 32px 28px 40px;
      border-left: none;
    }
  }

  @media (max-width: 480px) {
    .hero { padding: 28px 20px 24px; }
    .form-side { padding: 24px 20px 32px; }
  }
</style>
