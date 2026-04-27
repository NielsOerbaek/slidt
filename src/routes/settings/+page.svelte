<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import { t } from '$lib/i18n/index.ts';
  import STUnsavedGuard from '$lib/components/st/STUnsavedGuard.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showCreate = $state(false);
  let newToken = $state<string | null>(form?.token ?? null);

  // Per-form dirty trackers — set on first input, reset on successful submit.
  // (Password form is excluded: incomplete entries shouldn't trigger a prompt.)
  let profileDirty = $state(false);
  let prefsDirty = $state(false);
  const dirty = $derived(profileDirty || prefsDirty);
</script>

<svelte:head><title>{t('settings.title')}</title></svelte:head>

<STUnsavedGuard {dirty} />

<!-- ── Page wrapper ───────────────────────────────────────── -->
<div class="page-wrap">

<!-- ── Header ─────────────────────────────────────────────── -->
<div class="head-band">
  <div class="head-index">SET</div>
  <div class="head-title">
    <div class="meta">{t('settings.meta')}</div>
    <h1>{t('settings.headline')}</h1>
  </div>
</div>

<!-- ── 3-column grid ──────────────────────────────────────── -->
<div class="settings-cols">

  <!-- ── Profile ──────────────────────────────────────────── -->
  <div class="settings-col">
    <div class="col-head">{t('settings.profile')}</div>
    <div class="col-body">

      <form
        method="POST"
        action="?/updateProfile"
        use:enhance={() => async ({ result, update }) => {
          if (result.type === 'success') profileDirty = false;
          await update();
        }}
        oninput={() => (profileDirty = true)}
        class="stack"
      >
        <label class="field-label" for="profile-name">{t('settings.display_name')}</label>
        <input id="profile-name" type="text" name="name" value={data.user.name} required />
        <div class="row-actions">
          <button type="submit" class="btn-accent">{t('settings.save')}</button>
          {#if form?.profileSuccess}<span class="ok">{t('settings.saved')}</span>{/if}
          {#if form?.profileError}<span class="err">{form.profileError}</span>{/if}
        </div>
      </form>

      <div class="divider"></div>

      <form method="POST" action="?/changePassword" use:enhance class="stack">
        <label class="field-label" for="pw-current">{t('settings.current_password')}</label>
        <input id="pw-current" type="password" name="current" autocomplete="current-password" required />
        <label class="field-label" for="pw-next">{t('settings.new_password')}</label>
        <input id="pw-next" type="password" name="next" autocomplete="new-password" minlength="8" required />
        <label class="field-label" for="pw-confirm">{t('settings.confirm_password')}</label>
        <input id="pw-confirm" type="password" name="confirm" autocomplete="new-password" required />
        <div class="row-actions">
          <button type="submit" class="btn-accent">{t('settings.change_password')}</button>
          {#if form?.pwSuccess}<span class="ok">{t('settings.password_changed')}</span>{/if}
          {#if form?.pwError}<span class="err">{form.pwError}</span>{/if}
        </div>
      </form>

    </div>
  </div>

  <!-- ── Preferences ──────────────────────────────────────── -->
  <div class="settings-col">
    <div class="col-head">{t('settings.preferences')}</div>
    <div class="col-body">

      <form
        method="POST"
        action="?/updatePreferences"
        use:enhance={() => async ({ result, update }) => {
          if (result.type === 'success') prefsDirty = false;
          await update();
        }}
        oninput={() => (prefsDirty = true)}
        onchange={(e) => {
          prefsDirty = true;
          // Auto-save toggle/select changes — these are atomic and there's no
          // reason to make the user hunt for a Save button after every flip.
          // The Save button still exists below as a fallback / a11y entry.
          const t = e.target as HTMLElement;
          if (t.matches('input[type="checkbox"], select')) {
            (e.currentTarget as HTMLFormElement).requestSubmit();
          }
        }}
        class="stack"
      >
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
            {#if data.ollamaModels.length > 0}
              <optgroup label={t('settings.agent_model_local')}>
                {#each data.ollamaModels as model}
                  <option value="ollama:{model}" selected={data.user.preferences?.aiModel === `ollama:${model}`}>
                    {model}
                  </option>
                {/each}
              </optgroup>
            {/if}
            <optgroup label={t('settings.agent_model_api')}>
              <option value="claude" selected={!data.user.preferences?.aiModel || data.user.preferences.aiModel === 'claude'}>
                {t('settings.agent_model_claude')}
              </option>
            </optgroup>
          </select>
          <span class="pref-meter">{t('settings.agent_model_meter')}</span>
        </div>

        <div class="row-actions">
          <button type="submit" class="btn-accent">{t('settings.save_prefs')}</button>
          {#if form?.prefsSuccess}<span class="ok">{t('settings.saved')}</span>{/if}
        </div>
      </form>

    </div>
  </div>

  <!-- ── API Keys ──────────────────────────────────────────── -->
  <div class="settings-col">
    <div class="col-head">{t('settings.api_keys')}</div>
    <div class="col-body">

      {#if newToken}
        <div class="token-reveal">
          <div class="token-label">{t('settings.key_new_label')}</div>
          <code class="token-value">{newToken}</code>
          <div class="token-hint">{t('settings.key_set_as')} <code>SLIDT_API_KEY={newToken}</code></div>
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
          class="stack create-form"
        >
          <label class="field-label">{t('settings.key_name_label')}</label>
          <input type="text" name="name" placeholder="e.g. my-agent, ci-pipeline" required autofocus />
          <div class="row-actions">
            <button type="submit" class="btn-accent">{t('settings.save')}</button>
            <button type="button" class="btn" onclick={() => showCreate = false}>{t('settings.key_cancel')}</button>
          </div>
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
              <th>{t('settings.col_last_used')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each data.keys as key (key.id)}
              <tr>
                <td class="key-name">{key.name}</td>
                <td class="meta-cell">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString(data.user.preferences?.locale === 'en' ? 'en-GB' : 'da-DK') : '—'}</td>
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
  </div>

</div><!-- settings-cols -->
</div><!-- page-wrap -->

<style>
  /* ── Page wrapper ─────────────────────────────────────────── */
  /* Outer max-width / side borders come from the global frame in +layout.svelte */
  .page-wrap { min-height: 100vh; }

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

  /* ── 3-column grid ────────────────────────────────────────── */
  .settings-cols {
    display: grid;
    grid-template-columns: 1fr 1fr 1.2fr;
    min-height: calc(100vh - 160px);
    align-items: start;
  }
  .settings-col {
    border-right: var(--st-rule-thick);
  }
  .settings-col:last-child {
    border-right: none;
  }
  .col-head {
    padding: 16px 32px;
    border-bottom: var(--st-rule-thick);
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    background: var(--st-bg-deep);
  }
  .col-body {
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
  }

  /* ── Forms ────────────────────────────────────────────────── */
  .stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .field-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-top: 6px;
  }
  .field-label:first-child { margin-top: 0; }
  input[type="text"],
  input[type="password"] {
    width: 100%;
    font-family: var(--st-font-display);
    font-size: 18px;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    padding: 8px 12px;
    color: var(--st-ink);
  }
  .row-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }
  .divider { border-top: var(--st-rule-thin); margin: 24px 0; }
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
    padding: 16px 0;
    border-bottom: var(--st-rule-thin);
    gap: 16px;
  }
  .pref-row:first-child { padding-top: 0; }
  .pref-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
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
  .pref-meter {
    display: block;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--st-ink-dim);
    margin-top: 6px;
    text-align: right;
  }
  select {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    background: var(--st-bg);
    border: var(--st-rule-thick);
    color: var(--st-ink);
    padding: 6px 10px;
    border-radius: 0;
    cursor: pointer;
    flex-shrink: 0;
    max-width: 140px;
  }

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
    padding: 16px;
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
    font-size: 12px;
    background: #002200;
    padding: 8px 12px;
    color: #90ff90;
    border: 1px solid #90ff90;
    word-break: break-all;
    display: block;
  }
  .token-hint { font-family: var(--st-font-mono); font-size: 10px; color: #60cc60; }
  .token-hint code { font-size: 11px; }
  .create-form { margin-bottom: 20px; }
  .key-table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: var(--st-rule-thick); }
  th {
    text-align: left;
    padding: 10px 0;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    font-weight: 400;
    padding-right: 16px;
  }
  tbody tr { border-bottom: var(--st-rule-thin); }
  tbody tr:hover { background: var(--st-bg-deep); }
  td { padding: 12px 0; padding-right: 16px; }
  .key-name { font-family: var(--st-font-display); font-size: 18px; }
  .meta-cell { font-family: var(--st-font-mono); font-size: 10px; color: var(--st-ink-dim); }
  .empty { font-family: var(--st-font-mono); font-size: 12px; color: var(--st-ink-dim); }

  /* ── Buttons ──────────────────────────────────────────────── */
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
  .btn-sm {
    background: transparent;
    color: #ff6060;
    border: 1px solid #ff6060;
    padding: 4px 10px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 0;
  }
  .btn-sm.danger:hover { background: #2a0000; }

  /* ── Mobile ───────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .head-band { grid-template-columns: 1fr; }
    .head-index { display: none; }
    .head-title { padding: 20px; }
    h1 { font-size: 48px; }
    .settings-cols { grid-template-columns: 1fr; }
    .settings-col { border-right: none; border-bottom: var(--st-rule-thick); }
    .settings-col:last-child { border-bottom: none; }
    .col-head { padding: 12px 20px; }
    .col-body { padding: 20px; }
    select { max-width: 160px; }
  }
</style>
