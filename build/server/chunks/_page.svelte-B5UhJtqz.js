import { a7 as head } from './dev-DoNs_J55.js';

//#region src/routes/docs/cli/+page.svelte
function _page($$renderer) {
	head("y492lb", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>CLI — Docs — slidt</title>`);
		});
	});
	$$renderer.push(`<div class="doc"><h2>CLI</h2> <p>The <code>slidt</code> CLI lets you manage decks, slides, themes, templates, and the agent
    from the terminal — useful for scripting, automation, and content pipelines.</p> <h3>Setup</h3> <pre><code># Run locally (inside the repo)
pnpm slidt &lt;command>

# Or directly with tsx
tsx scripts/slidt.ts &lt;command></code></pre> <h3>Authentication</h3> <p>All commands require an API key. Generate one in the <strong>NØGLER</strong> settings page.</p> <pre><code># Via environment variable (recommended)
export SLIDT_API_KEY=slidt_your_key_here
export SLIDT_URL=https://slidt.osogdata.dk   # default: http://localhost:3000

# Or per-command flags
pnpm slidt --api-key slidt_xxx --url https://... &lt;command></code></pre> <h3>deck</h3> <table><thead><tr><th>Sub-command</th><th>Description</th></tr></thead><tbody><tr><td><code>deck list</code></td><td>List all decks you have access to</td></tr><tr><td><code>deck create --title "My Deck"</code></td><td>Create a new deck</td></tr><tr><td><code>deck get &lt;id></code></td><td>Get deck metadata</td></tr><tr><td><code>deck duplicate &lt;id></code></td><td>Duplicate a deck</td></tr><tr><td><code>deck delete &lt;id></code></td><td>Delete a deck</td></tr></tbody></table> <h3>slide</h3> <table><thead><tr><th>Sub-command</th><th>Description</th></tr></thead><tbody><tr><td><code>slide list &lt;deck-id></code></td><td>List slides in a deck</td></tr><tr><td><code>slide add &lt;deck-id> --type &lt;name></code></td><td>Add a slide</td></tr><tr><td><code>slide patch &lt;deck-id> &lt;slide-id></code></td><td>Merge-patch slide data</td></tr><tr><td><code>slide delete &lt;deck-id> &lt;slide-id></code></td><td>Delete a slide</td></tr><tr><td><code>slide reorder &lt;deck-id> &lt;id1> &lt;id2> …</code></td><td>Set slide order</td></tr></tbody></table> <h3>theme</h3> <table><thead><tr><th>Sub-command</th><th>Description</th></tr></thead><tbody><tr><td><code>theme list</code></td><td>List all themes</td></tr><tr><td><code>theme get &lt;id></code></td><td>Get theme details and tokens</td></tr><tr><td><code>theme create</code></td><td>Create a theme (JSON from stdin)</td></tr><tr><td><code>theme patch &lt;id></code></td><td>Update theme tokens</td></tr><tr><td><code>theme validate &lt;file></code></td><td>Validate theme JSON (structure + CSS safety)</td></tr><tr><td><code>theme delete &lt;id></code></td><td>Delete a theme</td></tr></tbody></table> <h3>template</h3> <table><thead><tr><th>Sub-command</th><th>Description</th></tr></thead><tbody><tr><td><code>template list</code></td><td>List global slide types</td></tr><tr><td><code>template get &lt;id></code></td><td>Get slide type details</td></tr><tr><td><code>template create</code></td><td>Create a global slide type (JSON from stdin)</td></tr><tr><td><code>template patch &lt;id></code></td><td>Update a slide type</td></tr><tr><td><code>template validate &lt;file></code></td><td>Validate Handlebars + CSS guardrails</td></tr><tr><td><code>template delete &lt;id></code></td><td>Delete a global slide type</td></tr></tbody></table> <h3>agent</h3> <table><thead><tr><th>Sub-command / flag</th><th>Description</th></tr></thead><tbody><tr><td><code>agent chat --deck &lt;id></code></td><td>Interactive streaming chat with the agent</td></tr><tr><td><code>agent chat --deck &lt;id> --json</code></td><td>Output raw SSE events as JSON lines</td></tr><tr><td><code>agent chat --deck &lt;id> --quiet</code></td><td>Silent — prints only the final text response</td></tr><tr><td><code>agent history --deck &lt;id></code></td><td>Print stored message history for the deck</td></tr></tbody></table> <p class="note">Pipe a prompt via stdin: <code>echo "Add a title slide" | pnpm slidt agent chat --deck &lt;id></code></p> <h3>key</h3> <table><thead><tr><th>Sub-command</th><th>Description</th></tr></thead><tbody><tr><td><code>key list</code></td><td>List your API keys (name + last-used)</td></tr><tr><td><code>key create --name "CI"</code></td><td>Create a new API key (printed once)</td></tr><tr><td><code>key revoke &lt;id></code></td><td>Revoke an API key</td></tr></tbody></table> <h3>export</h3> <pre><code>pnpm slidt export &lt;deck-id> --out deck.pdf</code></pre> <p>Exports a deck to PDF via Chromium. Requires server to be running.</p> <h3>health</h3> <pre><code>pnpm slidt health</code></pre> <p>Checks that the server is reachable and returns <code>ok</code>.</p></div>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B5UhJtqz.js.map
