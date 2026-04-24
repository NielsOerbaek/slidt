import{D as e,L as t,T as n,U as r,_ as i}from"../chunks/CWOWk0v5.js";import"../chunks/AZeLEXKw.js";import"../chunks/DDfdlyGg.js";var a=e(`<div class="doc"><h2>Templates</h2> <p>A <strong>slide type</strong> (template) defines the layout and editable fields for a category of
    slides. It consists of a Handlebars HTML template, scoped CSS, and a field schema.</p> <h3>Scope</h3> <dl><dt>Global</dt> <dd>Available in every deck. Managed in the <strong>Skabeloner</strong> section. Read-only for the agent.</dd> <dt>Deck-scoped</dt> <dd>Belong to one deck. Created and modified by the agent (or manually via the Skabeloner editor). Appear in that deck's slide type picker.</dd></dl> <h3>Field types</h3> <table><thead><tr><th>Type</th><th>Value shape</th><th>Notes</th></tr></thead><tbody><tr><td><code>text</code></td><td>string</td><td>Single-line plain text</td></tr><tr><td><code>richtext</code></td><td>string</td><td>Multi-line plain text (no HTML/markdown unless field explicitly allows it)</td></tr><tr><td><code>number</code></td><td>number</td><td>Numeric value</td></tr><tr><td><code>boolean</code></td><td>boolean</td><td>Checkbox toggle</td></tr><tr><td><code>select</code></td><td>string</td><td>One of a fixed set of options</td></tr><tr><td><code>list</code></td><td>array</td><td>Repeating items — either strings or objects (see below)</td></tr><tr><td><code>group</code></td><td>object</td><td>Nested sub-fields keyed by name</td></tr></tbody></table> <h3>List field shapes</h3> <p>The shape of list items depends on the <code>items</code> schema:</p> <pre><code>// List of strings
&#123; name: "bullets", type: "list", items: &#123; name: "item", type: "richtext" &#125; &#125;
// Data: &#123; bullets: ["First point", "Second point"] &#125;

// List of objects
&#123; name: "cards", type: "list", items: &#123; type: "group", fields: [
  &#123; name: "title", type: "text" &#125;,
  &#123; name: "body",  type: "richtext" &#125;
] &#125; &#125;
// Data: &#123; cards: [&#123; title: "X", body: "Y" &#125;] &#125;</code></pre> <p class="note">Never wrap list items in an extra object keyed by the field name. Pass a flat array.</p> <h3>Handlebars template</h3> <p>Templates are standard Handlebars HTML. The slide data is the root context.</p> <pre><code>&lt;div class="slide my-slide"&gt;
  &lt;h1&gt;&#123;&#123;fmt title&#125;&#125;&lt;/h1&gt;
  &lt;ul&gt;
    &#123;&#123;#each bullets&#125;&#125;
      &lt;li&gt;&#123;&#123;fmt this&#125;&#125;&lt;/li&gt;
    &#123;&#123;/each&#125;&#125;
  &lt;/ul&gt;
&lt;/div&gt;</code></pre> <h3>Allowed Handlebars helpers</h3> <table><thead><tr><th>Helper</th><th>Usage</th></tr></thead><tbody><tr><td><code>fmt</code></td><td>Format a <em>string</em> value for display. Never pass objects or arrays.</td></tr><tr><td><code>eq</code></td><td><code>&#123;&#123;#if (eq a b)&#125;&#125;</code> — equality check</td></tr><tr><td><code>default</code></td><td><code>&#123;&#123;default value "fallback"&#125;&#125;</code></td></tr><tr><td><code>each</code></td><td>Iterate over arrays</td></tr><tr><td><code>if</code> / <code>unless</code></td><td>Conditional blocks</td></tr><tr><td><code>with</code></td><td>Change context to a nested object</td></tr></tbody></table> <h3>Scoped CSS</h3> <p>CSS is automatically scoped to <code>.st-&lt;name&gt;</code> where <code>name</code> is your slide type's
    name slug. You can reference theme tokens via CSS custom properties:</p> <pre><code>.slide &#123;
  background: var(--st-bg);
  color: var(--st-ink);
  font-family: var(--st-font-display);
&#125;</code></pre> <p>Prohibited: <code>@import</code>, <code>url()</code> with external refs, <code>expression()</code>, <code>behavior:</code>.</p> <h3>Common pitfalls</h3> <ul><li>Passing <code>&#123;&#123;fmt someObject&#125;&#125;</code> → renders "[object Object]". Use <code>fmt</code> only on string fields.</li> <li>Putting HTML in content fields (e.g. <code>&lt;strong&gt;text&lt;/strong&gt;</code>) — the template handles all formatting.</li> <li>Wrapping list items: <code>[&#123; item: "x" &#125;]</code> instead of <code>["x"]</code>.</li></ul></div>`);function o(e){var o=a();i(`1cvelko`,e=>{t(()=>{r.title=`Templates — Docs — slidt`})}),n(e,o)}export{o as component};