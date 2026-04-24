<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types.js';
  import { t } from '$lib/i18n/index.ts';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let showCreate = $state(false);
  let resetTarget = $state<string | null>(null);
</script>

<svelte:head><title>{t('admin.title')}</title></svelte:head>

<div class="head-band">
  <div class="head-index">ADM</div>
  <div class="head-title">
    <div class="meta">{t('admin.meta', { n: String(data.users.length) })}</div>
    <h1>{t('admin.headline')}</h1>
  </div>
  <div class="head-cta">
    <button class="btn-accent" onclick={() => { showCreate = !showCreate; }}>{t('admin.new_user')}</button>
  </div>
</div>

{#if form?.error}
  <div class="flash error">{form.error}</div>
{:else if form?.success}
  <div class="flash ok">{t('admin.action_success')}</div>
{/if}

{#if showCreate}
  <form method="POST" action="?/createUser" use:enhance class="create-form">
    <div class="create-title">{t('admin.create_user')}</div>
    <div class="field-row">
      <label>{t('admin.form_email')}<input type="email" name="email" required autocomplete="off" /></label>
      <label>{t('admin.form_name')}<input type="text" name="name" required /></label>
      <label>{t('admin.form_password')}<input type="password" name="password" required minlength="8" /></label>
      <label class="checkbox-label">
        <input type="checkbox" name="isAdmin" />
        {t('admin.form_is_admin')}
      </label>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn-accent">{t('admin.form_create')}</button>
      <button type="button" class="btn" onclick={() => showCreate = false}>{t('admin.form_cancel')}</button>
    </div>
  </form>
{/if}

<table class="user-table">
  <thead>
    <tr>
      <th>{t('admin.col_name')}</th>
      <th>{t('admin.col_email')}</th>
      <th>{t('admin.col_role')}</th>
      <th>{t('admin.col_last_seen')}</th>
      <th>{t('admin.col_actions')}</th>
    </tr>
  </thead>
  <tbody>
    {#each data.users as user (user.id)}
      <tr>
        <td class="name">{user.name}</td>
        <td class="email">{user.email}</td>
        <td class="role">
          {#if user.isAdmin}
            <span class="badge admin">{t('admin.badge_admin')}</span>
          {:else}
            <span class="badge user">{t('admin.badge_user')}</span>
          {/if}
        </td>
        <td class="last-seen">
          {user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleDateString('da-DK') : '—'}
        </td>
        <td class="actions">
          <!-- Toggle admin -->
          <form method="POST" action="?/setAdmin" use:enhance class="inline-form">
            <input type="hidden" name="id" value={user.id} />
            <input type="hidden" name="isAdmin" value={user.isAdmin ? 'false' : 'true'} />
            <button type="submit" class="btn-sm">
              {user.isAdmin ? t('admin.remove_admin') : t('admin.make_admin')}
            </button>
          </form>

          <!-- Reset password inline -->
          {#if resetTarget === user.id}
            <form method="POST" action="?/resetPassword" use:enhance={{ onResult: () => { resetTarget = null; } }} class="inline-form">
              <input type="hidden" name="id" value={user.id} />
              <input type="password" name="password" placeholder={t('admin.pw_new_placeholder')} minlength="8" class="inline-pw" required />
              <button type="submit" class="btn-sm warn">{t('admin.pw_set')}</button>
              <button type="button" class="btn-sm" onclick={() => resetTarget = null}>✕</button>
            </form>
          {:else}
            <button class="btn-sm" onclick={() => resetTarget = user.id}>{t('admin.reset_pw')}</button>
          {/if}

          <!-- Delete user -->
          <form method="POST" action="?/deleteUser" use:enhance class="inline-form"
            onsubmit={(e) => { if (!confirm(t('admin.delete_user_confirm', { name: user.name }))) e.preventDefault(); }}>
            <input type="hidden" name="id" value={user.id} />
            <button type="submit" class="btn-sm danger">{t('admin.delete')}</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<!-- ── Issues ──────────────────────────────────────────────── -->
<div class="section-head">
  <span class="section-label">{t('admin.issues')}</span>
  <span class="section-count">{t('admin.issues_count', { total: String(data.issues.length), open: String(data.issues.filter(i => i.status === 'open').length) })}</span>
</div>

{#if data.issues.length === 0}
  <p class="empty">{t('admin.issues_empty')}</p>
{:else}
  {#each data.issues as issue (issue.id)}
    <div class="issue-row" class:resolved={issue.status === 'resolved'}>
      <div class="issue-meta">
        <span class="issue-sev sev-{issue.severity}">{issue.severity.toUpperCase()}</span>
        <span class="issue-status">{issue.status === 'open' ? t('admin.issue_status_open') : t('admin.issue_status_resolved')}</span>
        <span class="issue-date">{new Date(issue.createdAt).toLocaleDateString('da-DK')}</span>
        {#if issue.deckId}
          <a class="issue-deck" href="/decks/{issue.deckId}" target="_blank">{t('admin.issue_deck_link')}</a>
        {/if}
      </div>
      <div class="issue-title">{issue.title}</div>
      {#if issue.body}
        <div class="issue-body">{issue.body}</div>
      {/if}
      <div class="issue-actions">
        {#if issue.status === 'open'}
          <form method="POST" action="?/resolveIssue" use:enhance class="inline-form">
            <input type="hidden" name="id" value={issue.id} />
            <button type="submit" class="btn-sm">{t('admin.resolve')}</button>
          </form>
        {/if}
        <form method="POST" action="?/deleteIssue" use:enhance class="inline-form"
          onsubmit={(e) => { if (!confirm(t('admin.delete_issue_confirm'))) e.preventDefault(); }}>
          <input type="hidden" name="id" value={issue.id} />
          <button type="submit" class="btn-sm danger">{t('admin.delete')}</button>
        </form>
      </div>
    </div>
  {/each}
{/if}

<style>
  .head-band {
    display: grid;
    grid-template-columns: 80px 1fr auto;
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
  .head-title { padding: 32px 40px; border-right: var(--st-rule-thick); }
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
  .head-cta { padding: 32px 24px; display: flex; align-items: flex-end; justify-content: flex-end; }

  .flash {
    padding: 12px 40px;
    font-family: var(--st-font-mono);
    font-size: 11px;
    border-bottom: var(--st-rule-thin);
  }
  .flash.error { background: #2a0000; color: #ff9090; }
  .flash.ok { background: #001a00; color: #90ff90; }

  .create-form {
    padding: 24px 40px;
    border-bottom: var(--st-rule-thick);
    background: var(--st-bg-deep);
  }
  .create-title {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
    margin-bottom: 16px;
  }
  .field-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: flex-end;
    margin-bottom: 16px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--st-ink-dim);
  }
  input[type="email"], input[type="text"], input[type="password"] {
    padding: 8px 12px;
    border: 2px solid var(--st-ink);
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 13px;
    border-radius: 0;
    min-width: 180px;
  }
  .checkbox-label { flex-direction: row; align-items: center; gap: 8px; }
  .form-actions { display: flex; gap: 10px; }
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
  }
  .user-table {
    width: 100%;
    border-collapse: collapse;
  }
  thead tr {
    border-bottom: var(--st-rule-thick);
  }
  th {
    text-align: left;
    padding: 12px 20px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    font-weight: 400;
  }
  tbody tr { border-bottom: var(--st-rule-thin); }
  tbody tr:hover { background: var(--st-bg-deep); }
  td { padding: 14px 20px; }
  .name { font-family: var(--st-font-display); font-size: 20px; }
  .email { font-family: var(--st-font-mono); font-size: 12px; }
  .last-seen { font-family: var(--st-font-mono); font-size: 11px; color: var(--st-ink-dim); }
  .badge {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    padding: 3px 8px;
    border: 1px solid;
  }
  .badge.admin { border-color: var(--st-cobalt); color: var(--st-cobalt); }
  .badge.user { border-color: var(--st-ink-dim); color: var(--st-ink-dim); }
  .actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .inline-form { display: flex; gap: 6px; align-items: center; }
  .btn-sm {
    background: transparent;
    color: var(--st-ink);
    border: 1px solid var(--st-ink-dim);
    padding: 4px 10px;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-radius: 0;
    white-space: nowrap;
  }
  .btn-sm:hover { border-color: var(--st-ink); }
  .btn-sm.warn { border-color: orange; color: orange; }
  .btn-sm.danger { border-color: #ff6060; color: #ff6060; }
  .inline-pw {
    padding: 4px 8px;
    border: 1px solid var(--st-ink-dim);
    background: var(--st-bg);
    color: var(--st-ink);
    font-family: var(--st-font-mono);
    font-size: 12px;
    border-radius: 0;
    width: 140px;
  }

  /* ── Issues ── */
  .section-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 24px 20px 12px;
    border-top: var(--st-rule-thick);
  }
  .section-label {
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--st-ink-dim);
  }
  .section-count {
    font-family: var(--st-font-mono);
    font-size: 11px;
    color: var(--st-ink-dim);
  }
  .empty {
    padding: 24px 20px;
    font-family: var(--st-font-mono);
    font-size: 12px;
    color: var(--st-ink-dim);
  }
  .issue-row {
    padding: 16px 20px;
    border-bottom: var(--st-rule-thin);
  }
  .issue-row.resolved { opacity: 0.45; }
  .issue-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }
  .issue-sev {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    padding: 2px 7px;
    border: 1px solid;
  }
  .sev-low    { border-color: var(--st-ink-dim); color: var(--st-ink-dim); }
  .sev-medium { border-color: orange; color: orange; }
  .sev-high   { border-color: #ff6060; color: #ff6060; }
  .issue-status {
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink-dim);
    letter-spacing: 0.1em;
  }
  .issue-date {
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink-dim);
  }
  .issue-deck {
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-cobalt);
  }
  .issue-title {
    font-family: var(--st-font-display);
    font-size: 18px;
    margin-bottom: 4px;
  }
  .issue-body {
    font-family: var(--st-font-mono);
    font-size: 12px;
    color: var(--st-ink-dim);
    white-space: pre-wrap;
    margin-bottom: 8px;
  }
  .issue-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
</style>
