import { a7 as head } from './dev-DoNs_J55.js';

//#region src/routes/docs/agent/+page.svelte
function _page($$renderer) {
	head("19gvj6i", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Agent — Docs — slidt</title>`);
		});
	});
	$$renderer.push(`<div class="doc"><h2>Agent</h2> <p>The agent is an AI assistant (Claude Sonnet) embedded directly in the editor. It can read and
    modify your deck using a set of structured tools, create new slide templates, inspect renders,
    and fetch web content.</p> <h3>Opening the agent</h3> <table><thead><tr><th>Context</th><th>How</th></tr></thead><tbody><tr><td>Desktop</td><td>Click the <strong>-_- AGENT</strong> button in the top-right action bar, or press <kbd>⌘K</kbd></td></tr><tr><td>Mobile</td><td>Tap the <strong>Agent</strong> tab in the bottom tab bar</td></tr><tr><td>CLI</td><td><code>pnpm slidt agent chat --deck &lt;id></code></td></tr></tbody></table> <h3>Sending messages</h3> <ul><li><kbd>Enter</kbd> — send message</li> <li><kbd>⇧Enter</kbd> — insert newline</li> <li>The compose box grows up to ~2.5 lines then scrolls internally</li></ul> <h3>Agent tools</h3> <table><thead><tr><th>Tool</th><th>What it does</th></tr></thead><tbody><tr><td><code>list_slides</code></td><td>List all slides with IDs, type names, and data</td></tr><tr><td><code>get_slide</code></td><td>Get a specific slide by ID</td></tr><tr><td><code>patch_slide</code></td><td>Merge-patch a slide's data fields</td></tr><tr><td><code>add_slide</code></td><td>Add a new slide to the end of the deck</td></tr><tr><td><code>delete_slide</code></td><td>Delete a slide by ID</td></tr><tr><td><code>reorder_slides</code></td><td>Reorder slides by providing a new ID sequence</td></tr><tr><td><code>list_slide_types</code></td><td>List all available slide types (global + deck-scoped)</td></tr><tr><td><code>create_slide_type</code></td><td>Create a new deck-scoped slide type with Handlebars template + CSS</td></tr><tr><td><code>patch_slide_type</code></td><td>Update an existing deck-scoped slide type</td></tr><tr><td><code>delete_slide_type</code></td><td>Delete a deck-scoped slide type (fails if slides still use it)</td></tr><tr><td><code>update_theme</code></td><td>Update theme token values for the current deck</td></tr><tr><td><code>inspect_slide_type</code></td><td>Screenshot a slide type render (1920×1080 PNG); uses dummy data or a real slide</td></tr><tr><td><code>fetch_url</code></td><td>Fetch plain text from a URL (up to 8 000 chars)</td></tr><tr><td><code>report_issue</code></td><td>Submit a bug report visible in the admin panel</td></tr></tbody></table> <h3>Creating a new template</h3> <p>Ask the agent to create a slide type. It will call <code>create_slide_type</code> then immediately
    call <code>inspect_slide_type</code> to screenshot the result and iterate until the render looks right.</p> <p class="note">Deck-scoped templates appear in your slide type picker alongside global templates.
    The agent can also patch or delete them if needed.</p> <h3>Undo stack</h3> <p>Every slide mutation and theme change pushed by the agent is undoable from the panel.
    The undo stack shows up to 20 entries; click <strong>UNDO</strong> next to any entry to revert it.</p> <h3>Cross-session memory</h3> <p>The agent's full message history (including tool calls and results) is persisted in the database
    per deck. When you reopen a deck the agent reconstructs its context so it can refer back to
    previous work.</p> <h3>Guardrails</h3> <p>Handlebars templates created by the agent are validated before saving:</p> <ul><li>Allowed block helpers: <code>each</code>, <code>if</code>, <code>unless</code>, <code>with</code></li> <li>Allowed inline helpers: <code>fmt</code>, <code>eq</code>, <code>default</code></li> <li>No partials (<code>{{> partial}}</code>)</li></ul> <p>CSS is also validated — no <code>@import</code>, external <code>url()</code>, <code>expression()</code>, or <code>behavior:</code>.</p></div>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BIUB4BKp.js.map
