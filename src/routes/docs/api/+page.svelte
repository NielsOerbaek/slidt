<svelte:head><title>API — Docs — slidt</title></svelte:head>

<div class="doc">
  <h2>API</h2>
  <p>
    slidt exposes a JSON REST API. All endpoints require authentication except
    <code>GET /healthz</code>.
  </p>

  <h3>Authentication</h3>
  <p>Pass your API key as a Bearer token:</p>
  <pre><code>Authorization: Bearer slidt_your_key_here</code></pre>
  <p>
    Generate API keys in the <strong>NØGLER</strong> settings page or with
    <code>pnpm slidt key create</code>.
  </p>

  <h3>Decks</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>GET</code></td><td><code>/api/decks</code></td><td>List decks you own or collaborate on</td></tr>
      <tr><td><code>POST</code></td><td><code>/api/decks</code></td><td>Create a deck — body: <code>&#123; title &#125;</code></td></tr>
      <tr><td><code>GET</code></td><td><code>/api/decks/:id</code></td><td>Get a deck with its slide order and theme</td></tr>
      <tr><td><code>PATCH</code></td><td><code>/api/decks/:id</code></td><td>Update title, slideOrder, or themeId</td></tr>
      <tr><td><code>DELETE</code></td><td><code>/api/decks/:id</code></td><td>Delete a deck and all its slides</td></tr>
      <tr><td><code>POST</code></td><td><code>/api/decks/:id/duplicate</code></td><td>Duplicate a deck</td></tr>
    </tbody>
  </table>

  <h3>Slides</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>GET</code></td><td><code>/api/decks/:id/slides</code></td><td>List slides in order</td></tr>
      <tr><td><code>POST</code></td><td><code>/api/decks/:id/slides</code></td><td>Add a slide — body: <code>&#123; typeId, data &#125;</code></td></tr>
      <tr><td><code>PATCH</code></td><td><code>/api/decks/:id/slides/:slideId</code></td><td>Merge-patch slide data — body: <code>&#123; data &#125;</code></td></tr>
      <tr><td><code>DELETE</code></td><td><code>/api/decks/:id/slides/:slideId</code></td><td>Delete a slide</td></tr>
    </tbody>
  </table>

  <h3>Agent</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>POST</code></td><td><code>/api/decks/:id/agent</code></td><td>Send a message; responds as an SSE stream of typed events</td></tr>
    </tbody>
  </table>
  <p>SSE event types: <code>text</code>, <code>tool_start</code>, <code>tool_done</code>, <code>done</code>, <code>error</code>.</p>
  <pre><code>// Example event shapes
&#123; "type": "text",       "delta": "I'll add the slide now." &#125;
&#123; "type": "tool_start", "tool": "add_slide", "toolUseId": "…", "input": &#123;…&#125; &#125;
&#123; "type": "tool_done",  "tool": "add_slide", "toolUseId": "…", "result": "ok", "undoPatch": &#123;…&#125; &#125;
&#123; "type": "done" &#125;</code></pre>

  <h3>Sharing &amp; Collaboration</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>POST</code></td><td><code>/api/decks/:id/share</code></td><td>Create or retrieve a share link token</td></tr>
      <tr><td><code>GET</code></td><td><code>/api/decks/:id/collaborators</code></td><td>List collaborators</td></tr>
      <tr><td><code>POST</code></td><td><code>/api/decks/:id/collaborators</code></td><td>Add a collaborator — body: <code>&#123; email, role &#125;</code></td></tr>
      <tr><td><code>DELETE</code></td><td><code>/api/decks/:id/collaborators</code></td><td>Remove a collaborator — body: <code>&#123; userId &#125;</code></td></tr>
    </tbody>
  </table>

  <h3>Export &amp; Present</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>GET</code></td><td><code>/api/decks/:id/export</code></td><td>Export deck as PDF (binary response)</td></tr>
      <tr><td><code>GET</code></td><td><code>/api/decks/:id/present</code></td><td>Render full-screen HTML presentation</td></tr>
    </tbody>
  </table>

  <h3>Themes</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>GET</code></td><td><code>/api/themes</code></td><td>List all themes</td></tr>
      <tr><td><code>POST</code></td><td><code>/api/themes</code></td><td>Create a theme — body: <code>&#123; name, tokens, systemPrompt? &#125;</code></td></tr>
      <tr><td><code>GET</code></td><td><code>/api/themes/:id</code></td><td>Get a theme</td></tr>
      <tr><td><code>PATCH</code></td><td><code>/api/themes/:id</code></td><td>Update name, tokens, or systemPrompt</td></tr>
      <tr><td><code>DELETE</code></td><td><code>/api/themes/:id</code></td><td>Delete a theme</td></tr>
    </tbody>
  </table>

  <h3>Slide types (templates)</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>GET</code></td><td><code>/api/templates</code></td><td>List global slide types</td></tr>
      <tr><td><code>POST</code></td><td><code>/api/templates</code></td><td>Create a global slide type</td></tr>
      <tr><td><code>GET</code></td><td><code>/api/templates/:id</code></td><td>Get a slide type</td></tr>
      <tr><td><code>PATCH</code></td><td><code>/api/templates/:id</code></td><td>Update label, fields, htmlTemplate, or css</td></tr>
      <tr><td><code>DELETE</code></td><td><code>/api/templates/:id</code></td><td>Delete a slide type</td></tr>
    </tbody>
  </table>

  <h3>API keys</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>GET</code></td><td><code>/api/keys</code></td><td>List your API keys</td></tr>
      <tr><td><code>POST</code></td><td><code>/api/keys</code></td><td>Create a key — body: <code>&#123; name &#125;</code> — returns full key once</td></tr>
      <tr><td><code>DELETE</code></td><td><code>/api/keys</code></td><td>Revoke a key — body: <code>&#123; id &#125;</code></td></tr>
    </tbody>
  </table>

  <h3>Health</h3>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>GET</code></td><td><code>/healthz</code></td><td>Returns <code>&#123; "ok": true &#125;</code> — no auth required</td></tr>
    </tbody>
  </table>
</div>

<style>
  @import '../doc.css';
</style>
