import { a7 as head } from './dev-DoNs_J55.js';

//#region src/routes/docs/templates/+page.svelte
function _page($$renderer) {
	head("1cvelko", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Templates — Docs — slidt</title>`);
		});
	});
	$$renderer.push(`<div class="doc"><h2>Templates</h2> <p>A <strong>slide type</strong> (template) defines the layout and editable fields for a category of
    slides. It consists of a Handlebars HTML template, scoped CSS, and a field schema.</p> <h3>Scope</h3> <dl><dt>Global</dt> <dd>Available in every deck. Managed in the <strong>Skabeloner</strong> section. Read-only for the agent.</dd> <dt>Deck-scoped</dt> <dd>Belong to one deck. Created and modified by the agent (or manually via the Skabeloner editor). Appear in that deck's slide type picker.</dd></dl> <h3>Field types</h3> <table><thead><tr><th>Type</th><th>Value shape</th><th>Notes</th></tr></thead><tbody><tr><td><code>text</code></td><td>string</td><td>Single-line plain text</td></tr><tr><td><code>richtext</code></td><td>string</td><td>Multi-line plain text (no HTML/markdown unless field explicitly allows it)</td></tr><tr><td><code>number</code></td><td>number</td><td>Numeric value</td></tr><tr><td><code>boolean</code></td><td>boolean</td><td>Checkbox toggle</td></tr><tr><td><code>select</code></td><td>string</td><td>One of a fixed set of options</td></tr><tr><td><code>list</code></td><td>array</td><td>Repeating items — either strings or objects (see below)</td></tr><tr><td><code>group</code></td><td>object</td><td>Nested sub-fields keyed by name</td></tr></tbody></table> <h3>List field shapes</h3> <p>The shape of list items depends on the <code>items</code> schema:</p> <pre><code>// List of strings
{ name: "bullets", type: "list", items: { name: "item", type: "richtext" } }
// Data: { bullets: ["First point", "Second point"] }

// List of objects
{ name: "cards", type: "list", items: { type: "group", fields: [
  { name: "title", type: "text" },
  { name: "body",  type: "richtext" }
] } }
// Data: { cards: [{ title: "X", body: "Y" }] }</code></pre> <p class="note">Never wrap list items in an extra object keyed by the field name. Pass a flat array.</p> <h3>Handlebars template</h3> <p>Templates are standard Handlebars HTML. The slide data is the root context.</p> <pre><code>&lt;div class="slide my-slide">
  &lt;h1>{{fmt title}}&lt;/h1>
  &lt;ul>
    {{#each bullets}}
      &lt;li>{{fmt this}}&lt;/li>
    {{/each}}
  &lt;/ul>
&lt;/div></code></pre> <h3>Allowed Handlebars helpers</h3> <table><thead><tr><th>Helper</th><th>Usage</th></tr></thead><tbody><tr><td><code>fmt</code></td><td>Format a <em>string</em> value for display. Never pass objects or arrays.</td></tr><tr><td><code>eq</code></td><td><code>{{#if (eq a b)}}</code> — equality check</td></tr><tr><td><code>default</code></td><td><code>{{default value "fallback"}}</code></td></tr><tr><td><code>each</code></td><td>Iterate over arrays</td></tr><tr><td><code>if</code> / <code>unless</code></td><td>Conditional blocks</td></tr><tr><td><code>with</code></td><td>Change context to a nested object</td></tr></tbody></table> <h3>Scoped CSS</h3> <p>CSS is automatically scoped to <code>.st-&lt;name></code> where <code>name</code> is your slide type's
    name slug. You can reference theme tokens via CSS custom properties:</p> <pre><code>.slide {
  background: var(--st-bg);
  color: var(--st-ink);
  font-family: var(--st-font-display);
}</code></pre> <p>Prohibited: <code>@import</code>, <code>url()</code> with external refs, <code>expression()</code>, <code>behavior:</code>.</p> <h3>Common pitfalls</h3> <ul><li>Passing <code>{{fmt someObject}}</code> → renders "[object Object]". Use <code>fmt</code> only on string fields.</li> <li>Putting HTML in content fields (e.g. <code>&lt;strong>text&lt;/strong></code>) — the template handles all formatting.</li> <li>Wrapping list items: <code>[{ item: "x" }]</code> instead of <code>["x"]</code>.</li></ul></div>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BWyu8Xsg.js.map
