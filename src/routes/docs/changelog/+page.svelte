<script lang="ts">
  import type { PageData } from './$types.js';
  let { data }: { data: PageData } = $props();

  function formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }

  function dayNumber(iso: string): string {
    return iso.slice(8, 10);
  }
</script>

<svelte:head><title>Changelog — Docs — slidt</title></svelte:head>

<div class="doc changelog">
  <h2>Changelog</h2>
  <p class="lede">
    Auto-generated from <code>git log</code>. Features get a full entry; smaller fixes
    are collapsed below each day.
  </p>

  {#each data.days as day}
    <section class="day">
      <header class="day-head">
        <span class="day-num">{dayNumber(day.date)}</span>
        <span class="day-name">{formatDate(day.date)}</span>
      </header>

      {#each day.features as commit}
        <article class="entry feat">
          <div class="entry-meta">
            <span class="tag tag-feat">FEATURE{#if commit.scope} · {commit.scope}{/if}</span>
            <code class="hash" title={commit.hash}>{commit.shortHash}</code>
          </div>
          <h3 class="entry-subject">{commit.subject}</h3>
          {#if commit.body}
            <pre class="entry-body">{commit.body}</pre>
          {/if}
        </article>
      {/each}

      {#if day.fixes.length > 0}
        <details class="fixes">
          <summary>{day.fixes.length} fix{day.fixes.length === 1 ? '' : 'es'} & polish</summary>
          <ul>
            {#each day.fixes as commit}
              <li>
                {#if commit.scope}<span class="scope">{commit.scope}</span>{/if}
                <span>{commit.subject}</span>
                <code class="hash hash-mini" title={commit.hash}>{commit.shortHash}</code>
              </li>
            {/each}
          </ul>
        </details>
      {/if}
    </section>
  {/each}

  {#if data.days.length === 0}
    <p>No entries yet.</p>
  {/if}

  <p class="footer">Generated {new Date(data.generatedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC</p>
</div>

<style>
  @import '../doc.css';

  .lede { color: var(--st-ink-dim); margin-bottom: 32px; }

  .day {
    border-top: var(--st-rule-thin);
    padding: 28px 0 8px;
  }
  .day:first-of-type { border-top: 0; padding-top: 12px; }
  .day-head {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 18px;
  }
  .day-num {
    font-family: var(--st-font-display);
    font-size: 44px;
    line-height: 1;
    color: var(--st-cobalt);
  }
  .day-name {
    font-family: var(--st-font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--st-ink-dim);
  }

  .entry {
    margin-bottom: 22px;
    padding: 16px 18px;
    background: var(--st-bg-deep);
    border-left: 3px solid var(--st-cobalt);
  }
  .entry-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }
  .tag {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.22em;
    padding: 3px 8px;
    background: var(--st-cobalt);
    color: var(--st-bg);
  }
  .hash {
    font-family: var(--st-font-mono);
    font-size: 10px;
    color: var(--st-ink-dim);
  }
  .entry-subject {
    font-family: var(--st-font-display);
    font-size: 22px;
    line-height: 1.25;
    margin: 0 0 8px;
    letter-spacing: -0.01em;
  }
  .entry-body {
    font-family: var(--st-font-mono);
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
    color: var(--st-ink);
    margin: 0;
    background: transparent;
    padding: 0;
    border: 0;
  }

  .fixes {
    margin: 14px 0 22px;
    padding: 10px 14px;
    border: var(--st-rule-thin);
  }
  .fixes summary {
    cursor: pointer;
    font-family: var(--st-font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--st-ink-dim);
  }
  .fixes ul { list-style: none; padding: 12px 0 4px; margin: 0; }
  .fixes li {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 6px 0;
    border-top: var(--st-rule-thin);
    font-size: 13px;
  }
  .fixes li:first-child { border-top: 0; }
  .scope {
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--st-cobalt);
    flex-shrink: 0;
  }
  .hash-mini {
    margin-left: auto;
    font-size: 9px;
  }

  .footer {
    margin-top: 40px;
    padding-top: 14px;
    border-top: var(--st-rule-thin);
    font-family: var(--st-font-mono);
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--st-ink-dim);
    text-transform: uppercase;
  }
</style>
