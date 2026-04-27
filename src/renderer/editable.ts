/**
 * Wrap `{{fmt …}}` references in an htmlTemplate with a `<span
 * data-slidt-field="…">` marker so the in-page editor can attach
 * contenteditable handlers and map DOM edits back to the underlying field.
 *
 * Path resolution:
 * - Outside any `{{#each}}` block, the path is the literal reference,
 *   including dotted access (e.g. `sideA.label`).
 * - Inside one level of `{{#each list}}`, the path becomes
 *   `<list>.{{@index}}.<ref>` (or `<list>.{{@index}}` for `{{fmt this}}`).
 *   Handlebars renders `{{@index}}` per iteration so each list item gets a
 *   unique data-slidt-field on the rendered DOM.
 * - Two or more nested `{{#each}}` blocks are not handled: list items inside
 *   inner each lack a stable path without `{{@../index}}` plumbing, so we
 *   just leave them un-tagged.
 *
 * `{{#if}}` / `{{#unless}}` blocks don't change context, so wrapping inside
 * them is fine.
 */
export function makeEditable(template: string): string {
  let out = '';
  const eachStack: string[] = [];
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

    const eachOpen = /^#each\s+([A-Za-z_$][\w$.]*)$/.exec(inner);
    if (eachOpen) {
      eachStack.push(eachOpen[1]!);
      out += tag;
    } else if (inner.startsWith('/each')) {
      eachStack.pop();
      out += tag;
    } else {
      const fmtMatch = /^fmt\s+(this|[A-Za-z_$][\w$.]*)$/.exec(inner);
      if (fmtMatch) {
        const ref = fmtMatch[1]!;
        const path = pathFor(eachStack, ref);
        if (path) {
          out += `<span data-slidt-field="${path}">${tag}</span>`;
        } else {
          out += tag;
        }
      } else {
        out += tag;
      }
    }
    i = close + 2;
  }

  return out;
}

function pathFor(eachStack: string[], ref: string): string | null {
  if (eachStack.length === 0) {
    if (ref === 'this') return null;
    return ref;
  }
  if (eachStack.length === 1) {
    const list = eachStack[0]!;
    if (ref === 'this') return `${list}.{{@index}}`;
    return `${list}.{{@index}}.${ref}`;
  }
  // 2+ nested #each — would need {{@../index}} chaining; leave un-tagged.
  return null;
}

// Styles injected into the rendered iframe so editable elements show their
// hover/focus affordances. The contenteditable + event wiring is attached from
// the parent window via iframe.contentDocument — no scripts run inside the
// iframe, which lets us keep the sandbox at allow-same-origin only.
export const EDITOR_STYLES = `
<style>
[data-slidt-field] { transition: outline-color 100ms; }
[data-slidt-field]:hover { outline: 2px dashed rgba(20, 64, 212, 0.45); outline-offset: 4px; cursor: text; }
[data-slidt-field]:focus { outline: 2px solid rgba(20, 64, 212, 0.9); outline-offset: 4px; cursor: text; }
[data-slidt-field][contenteditable]:empty::before { content: attr(data-slidt-field); color: rgba(0,0,0,0.25); font-style: italic; }
</style>`;
