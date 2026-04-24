import { a7 as head } from './dev-DoNs_J55.js';

//#region src/routes/docs/themes/+page.svelte
function _page($$renderer) {
	head("30iokt", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Themes — Docs — slidt</title>`);
		});
	});
	$$renderer.push(`<div class="doc"><h2>Themes</h2> <p>A theme is a named set of CSS token values applied to all slides in a deck. Tokens map to CSS
    custom properties that templates reference. A theme can also carry a <em>system prompt</em> that
    shapes the agent's tone when working on decks using that theme.</p> <h3>Applying a theme</h3> <p>In the deck editor, click the <strong>TEMA</strong> button in the top action bar to open the theme
    picker. Click a theme to apply it immediately.</p> <p>Via CLI: <code>pnpm slidt deck patch &lt;id> --theme &lt;theme-id></code></p> <h3>Token system</h3> <p>Each theme stores a flat object of token key/value pairs. The renderer injects them as CSS
    custom properties on the slide root element. Templates use them via <code>var(--token-name)</code>.</p> <pre><code>// Example theme tokens
{
  "color-background": "#0a0a0a",
  "color-text":       "#f5f5f5",
  "font-heading":     "'Neue Haas Grotesk', sans-serif",
  "font-size-base":   "18px"
}

// Used in template CSS:
.slide {
  background: var(--color-background);
  color: var(--color-text);
}</code></pre> <h3>Editing tokens</h3> <p>Go to <strong>Temaer</strong> → select a theme. Each token is editable inline. Changes apply to
    all decks using that theme.</p> <p>The agent can update tokens with <code>update_theme</code>. Changes are undoable from the undo stack in the agent panel.</p> <h3>System prompt</h3> <p>A theme can have an optional system prompt — free text appended to the agent's base instructions
    when working on a deck with this theme. Use it to encode style guidelines:</p> <pre><code>// Example system prompt on a dark editorial theme:
This deck uses a dark, minimal aesthetic.
- Prefer short, punchy headlines (max 6 words)
- Avoid bullet lists — use numbered steps or prose instead
- Slide backgrounds should always stay dark; never suggest light backgrounds</code></pre> <h3>Preset theme</h3> <p>One theme can be marked as the preset (default). Decks without an explicit theme assignment
    fall back to the preset. Marked via the admin panel or the seed script.</p></div>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D_lqrETV.js.map
