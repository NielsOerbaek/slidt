/**
 * Wrap top-level `{{fmt fieldName}}` references in an htmlTemplate with a
 * `<span data-slidt-field="…">` marker so the in-page editor can attach
 * contenteditable handlers and map DOM edits back to the underlying field.
 *
 * Only references that resolve against the slide's root data context get
 * wrapped — anything inside a `{{#each}}` block (where `this` rebinds to a
 * list item) is skipped, since list items have no field-name we can map back
 * to without tracking the path. `{{#if}}` / `{{#unless}}` blocks don't change
 * context, so fields inside them are still editable.
 */
export function makeEditable(template: string): string {
  let out = '';
  let inEach = 0;
  let i = 0;

  while (i < template.length) {
    const open = template.indexOf('{{', i);
    if (open === -1) {
      out += template.slice(i);
      break;
    }
    out += template.slice(i, open);
    const close = template.indexOf('}}', open);
    if (close === -1) {
      out += template.slice(open);
      break;
    }
    const tag = template.slice(open, close + 2);
    const inner = template.slice(open + 2, close).trim();

    if (inner.startsWith('#each')) {
      inEach++;
      out += tag;
    } else if (inner.startsWith('/each')) {
      inEach = Math.max(0, inEach - 1);
      out += tag;
    } else if (inEach === 0) {
      const m = /^fmt\s+([A-Za-z_$][\w$]*)$/.exec(inner);
      if (m && m[1] !== 'this') {
        out += `<span data-slidt-field="${m[1]}">${tag}</span>`;
      } else {
        out += tag;
      }
    } else {
      out += tag;
    }
    i = close + 2;
  }

  return out;
}

export const EDITOR_SCRIPT = `
<style>
[data-slidt-field] { transition: outline-color 100ms; }
[data-slidt-field]:hover { outline: 2px dashed rgba(20, 64, 212, 0.45); outline-offset: 4px; cursor: text; }
[data-slidt-field]:focus { outline: 2px solid rgba(20, 64, 212, 0.9); outline-offset: 4px; cursor: text; }
[data-slidt-field][contenteditable]:empty::before { content: attr(data-slidt-field); color: rgba(0,0,0,0.25); font-style: italic; }
</style>
<script>
(function () {
  function send(field, value) {
    parent.postMessage({ type: 'slidt:edit', field: field, value: value }, '*');
  }
  function attach(el) {
    el.contentEditable = 'true';
    el.spellcheck = true;
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); el.blur(); }
    });
    el.addEventListener('blur', function () {
      send(el.dataset.slidtField, el.innerText);
    });
  }
  function init() {
    var nodes = document.querySelectorAll('[data-slidt-field]');
    for (var i = 0; i < nodes.length; i++) attach(nodes[i]);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
`;
