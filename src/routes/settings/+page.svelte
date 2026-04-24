<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import { t } from '$lib/i18n/index.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showCreate = $state(false);
  let newToken = $state<string | null>(form?.token ?? null);
</script>

<svelte:head><title>{t('settings.title')}</title></svelte:head>

<div class="page-wrap">
<div class="head-band">
  <div class="head-index">SET</div>
  <div class="head-title">
    <div class="meta">{t('settings.meta')}</div>
    <h1>{t('settings.headline')}</h1>
  </div>
</div>

<!-- ── Profile ──────────────────────────────────────────────── -->
<section class="section">
  <div class="section-label">{t('settings.profile')}</div>
  <div class="section-body">

    <form method="POST" action="?/updateProfile" use:enhance class="form-row">
      <label class="field-label" for="profile-name">{t('settings.display_name')}</label>
      <input id="profile-name" type="text" name="name" value={data.user.name} required />
      <button type="submit" class="btn-accent">{t('settings.save')}</button>
      {#if form?.profileSuccess}<span class="ok">{t('settings.saved')}</span>{/if}
      {#if form?.profileError}<span class="err">{form.profileError}</span>{/if}
    </form>

    <div class="divider"></div>

    <form method="POST" action="?/changePassword" use:enhance class="form-stack">
      <div class="form-row">
        <label class="field-label" for="pw-current">{t('settings.current_password')}</label>
        <input id="pw-current" type="password" name="current" autocomplete="current-password" required />
      </div>
      <div class="form-row">
        <label class="field-label" for="pw-next">{t('settings.new_password')}</label>
        <input id="pw-next" type="password" name="next" autocomplete="new-password" minlength="8" required />
      </div>
      <div class="form-row">
        <label class="field-label" for="pw-confirm">{t('settings.confirm_password')}</label>
        <input id="pw-confirm" type="password" name="confirm" autocomplete="new-password" required />
      </div>
      <div class="form-row">
        <span class="field-label"></span>
        <button type="submit" class="btn-accent">{t('settings.change_password')}</button>
        {#if form?.pwSuccess}<span class="ok">{t('settings.password_changed')}</span>{/if}
        {#if form?.pwError}<span class="err">{form.pwError}</span>{/if}
      </div>
    </form>

  </div>
</section>

<!-- ── Preferences ──────────────────────────────────────────── -->
<section class="section">
  <div class="section-label">{t('settings.preferences')}</div>
  <div class="section-body">

    <form method="POST" action="?/updatePreferences" use:enhance class="form-stack">
      <div class="pref-row">
        <div class="pref-info">
          <span class="pref-name">{t('settings.vim_name')}</span>
          <span class="pref-desc">{t('settings.vim_desc')}</span>
        </div>
        <label class="toggle">
          <input type="checkbox" name="vim" role="switch"
            checked={data.user.preferences?.vim ?? false} />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </label>
      </div>

      <div class="pref-row">
        <div class="pref-info">
          <span class="pref-name">{t('settings.language_name')}</span>
          <span class="pref-desc">{t('settings.language_desc')}</span>
        </div>
        <select name="locale">
          <option value="da" selected={!data.user.preferences?.locale || data.user.preferences.locale === 'da'}>Dansk</option>
          <option value="en" selected={data.user.preferences?.locale === 'en'}>English</option>
        </select>
      </div>

      <div class="pref-row">
        <div class="pref-info">
          <span class="pref-name">{t('settings.agent_model_name')}</span>
          <span class="pref-desc">{t('settings.agent_model_desc')}</span>
          {#if data.ollamaModels.length === 0}
            <span class="pref-desc">{t('settings.agent_model_unavailable')}</span>
          {/if}
        </div>
        <select name="aiModel">
          <option
            value="claude"
            selected={!data.user.preferences?.aiModel || data.user.preferences.aiModel === 'claude'}
          >
            Claude (Sonnet 4.6)
          </option>
          {#each data.ollamaModels as model}
            <option
              value="ollama:{model}"
              selected={data.user.preferences?.aiModel === `ollama:${model}`}
            >
              {model}
            </option>
          {/each}
        </select>
      </div>

      <div class="form-row pref-save">
        <button type="submit" class="btn-accent">{t('settings.save_prefs')}</button>
        {#if form?.prefsSuccess}<span class="ok">{t('settings.saved')}</span>{/if}
      </div>
    </form>

  </div>
</section>

<!-- ── API Keys ──────────────────────────────────────────────── -->
<section class="section">
  <div class="section-label">{t('settings.api_keys')}</div>
  <div class="section-body">

    {#if newToken}
      <div class="token-reveal">
        <div class="token-label">{t('settings.key_new_label')}</div>
        <code class="token-value">{newToken}</code>
        <div class="token-hint">Set as: <code>SLIDT_API_KEY={newToken}</code></div>
        <button class="btn" onclick={() => { newToken = null; }}>{t('settings.key_dismiss')}</button>
      </div>
    {/if}

    {#if showCreate}
      <form method="POST" action="?/createKey"
        use:enhance={({ }) => {
          return async ({ result, update }) => {
            await update({ reset: false });
            if (result.type === 'success' && result.data?.token) {
              newToken = result.data.token as string;
              showCreate = false;
            }
          };
        }}
        class="create-form"
      >
        <span class="create-label">{t('settings.key_name_label')}</span>
        <input type="text" name="name" placeholder="e.g. my-agent, ci-pipeline" required autofocus />
        <button type="submit" class="btn-accent">{t('settings.save')}</button>
        <button type="button" class="btn" onclick={() => showCreate = false}>{t('settings.key_cancel')}</button>
      </form>
    {:else}
      <div class="keys-toolbar">
        <button class="btn-accent" onclick={() => { showCreate = true; newToken = null; }}>{t('settings.key_create')}</button>
      </div>
    {/if}

    {#if data.keys.length === 0}
      <p class="empty">{t('settings.key_empty')}</p>
    {:else}
      <table class="key-table">
        <thead>
          <tr>
            <th>{t('settings.col_name')}</th>
            <th>{t('settings.col_created')}</th>
            <th>{t('settings.col_last_used')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each data.keys as key (key.id)}
            <tr>
              <td class="key-name">{key.name}</td>
              <td class="meta-cell">{new Date(key.createdAt).toLocaleDateString('da-DK')}</td>
              <td class="meta-cell">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('da-DK') : '—'}</td>
              <td>
                <form method="POST" action="?/revokeKey" use:enhance
                  onsubmit={(e) => { if (!confirm(t('settings.key_revoke_confirm'))) e.preventDefault(); }}>
                  <input type="hidden" name="id" value={key.id} />
                  <button type="submit" class="btn-sm danger">{t('settings.key_revoke')}</button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

  </div>
</section>
</div>

<style>
  /* ── Page wrapper ─────────────────────────────────────────── */
  .page-wrap {
    max-width: 960px;
    margin: 0 auto;
    border-left: var(--st-rule-thick);
    border-right: var(--st-rule-thick);
    min-height: 100vh;
  }

  /* ── Header ───────────────────────────────────────────────── */
  .head-band {
    display: grid;
    grid-template-columns: 80px 1fr;
    border-bottom: var(--st-rule-thick);
  }
  .head-index {
    border-right: var(--st-rule-thick);
    padding: 36px 0;
    text-align: center;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
  }
  .head-title { padding: 32px 40px; }
  .meta {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-bottom: 10px;
  }
  h1 {
    font-family: var(--st-font-display);
    font-weight: 400;
    font-size: 76px;
    line-height: 0.9;
    letter-spacing: -0.04em;
    margin: 0;
  }

  /* ── Sections ─────────────────────────────────────────────── */
  .section {
    display: grid;
    grid-template-columns: 80px 1fr;
    border-bottom: var(--st-rule-thick);
  }
  .section-label {
    border-right: var(--st-rule-thick);
    padding: 32px 0;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    text-align: center;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
  }
  .section-body { padding: 32px 40px; display: flex; flex-direction: column; gap: 0; }
  .divider { border-top: var(--st-rule-thin); margin: 28px 0; }

  /* ── Form rows ────────────────────────────────────────────── */
  .form-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }
  .form-row:last-child { margin-bottom: 0; }
  .form-stack { display: flex; flex-direction: column; }
  .field-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    width: 180px;
    flex-shrink: 0;
  }
  input[type="text"],
  input[type="password"] {
    flex: 1;
    max-width: 400px;
    font-family: var(--st-font-display);
    font-size: 18px;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    padding: 8px 12px;
    color: var(--st-ink);
  }
  .ok {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    color: #60cc60;
  }
  .err {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #ff6060;
  }

  /* ── Preferences ──────────────────────────────────────────── */
  .pref-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 0;
    border-bottom: var(--st-rule-thin);
    gap: 24px;
  }
  .pref-row:first-child { padding-top: 0; }
  .pref-info { display: flex; flex-direction: column; gap: 4px; }
  .pref-name {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--st-ink);
  }
  .pref-desc {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--st-ink-dim);
  }
  select {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    color: var(--st-ink);
    padding: 8px 12px;
    border-radius: 0;
    cursor: pointer;
  }
  .pref-save { margin-top: 24px; }

  /* Toggle switch */
  .toggle { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; }
  .toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
  .toggle-track {
    width: 44px;
    height: 24px;
    background: var(--st-bg-deep);
    border: var(--st-rule-thick);
    position: relative;
    transition: background 120ms;
  }
  .toggle input:checked ~ .toggle-track { background: var(--st-cobalt); }
  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    background: var(--st-ink-dim);
    transition: left 120ms, background 120ms;
  }
  .toggle input:checked ~ .toggle-track .toggle-thumb {
    left: 23px;
    background: var(--st-bg);
  }

  /* ── API Keys ─────────────────────────────────────────────── */
  .keys-toolbar { margin-bottom: 20px; }
  .token-reveal {
    padding: 20px;
    background: #001a00;
    border: 1px solid #90ff90;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .token-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #90ff90;
  }
  .token-value {
    font-family: var(--st-font-mono);
    font-size: 14px;
    background: #002200;
    padding: 10px 16px;
    color: #90ff90;
    border: 1px solid #90ff90;
    word-break: break-all;
  }
  .token-hint { font-family: var(--st-font-mono); font-size: 11px; color: #60cc60; }
  .token-hint code { font-size: 12px; }

  .create-form {
    border-bottom: var(--st-rule-thin);
    padding: 0 0 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .create-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    flex-shrink: 0;
  }
  .create-form input {
    flex: 1;
    max-width: 320px;
    font-family: var(--st-font-display);
    font-size: 22px;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    padding: 10px 14px;
    color: var(--st-ink);
  }

  .btn-accent {
    background: var(--st-ink);
    color: var(--st-bg);
    border: 2px solid var(--st-ink);
    padding: 8px 20px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
  }
  .btn {
    background: transparent;
    color: var(--st-ink);
    border: 2px solid var(--st-ink);
    padding: 8px 20px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
  }
  .empty {
    font-family: var(--st-font-mono);
    font-size: 12px;
    color: var(--st-ink-dim);
  }
  .key-table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: var(--st-rule-thick); }
  th {
    text-align: left;
    padding: 12px 0;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    font-weight: 400;
    padding-right: 40px;
  }
  tbody tr { border-bottom: var(--st-rule-thin); }
  tbody tr:hover { background: var(--st-bg-deep); }
  td { padding: 14px 0; padding-right: 40px; }
  .key-name { font-family: var(--st-font-display); font-size: 20px; }
  .meta-cell { font-family: var(--st-font-mono); font-size: 11px; color: var(--st-ink-dim); }
  .btn-sm {
    background: transparent;
    color: #ff6060;
    border: 1px solid #ff6060;
    padding: 4px 12px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 0;
  }
  .btn-sm.danger:hover { background: #2a0000; }

  /* ── Mobile ───────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .page-wrap { border-left: none; border-right: none; }
    .head-band { grid-template-columns: 1fr; }
    .head-index { display: none; }
    .head-title { padding: 20px 20px; }
    h1 { font-size: 48px; }
    .section { grid-template-columns: 1fr; }
    .section-label {
      writing-mode: horizontal-tb;
      transform: none;
      padding: 12px 20px;
      text-align: left;
      border-right: none;
      border-bottom: var(--st-rule-thin);
      background: var(--st-bg-deep);
    }
    .section-body { padding: 20px; }
    .form-row { flex-wrap: wrap; }
    .field-label { width: 100%; margin-bottom: 4px; }
    input[type="text"],
    input[type="password"] { max-width: 100%; }
    .pref-row { gap: 12px; }
  }
</style>
