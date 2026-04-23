const BOLD_RE = /\*\*([\s\S]+?)\*\*/g;
// em: a `*` not preceded by `*`, content without `*` or newline, closing `*` not followed by `*`
const EM_RE = /(?<!\*)\*([^*\n]+?)\*(?!\*)/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * HTML-escape text, then convert `**bold**`, `*em*`, and `\n` to inline HTML.
 * Output is raw HTML. Callers that pass output into Handlebars should use a
 * SafeString wrapper (see handlebars.ts).
 */
export function fmt(text: string | null | undefined): string {
  if (!text) return '';
  let out = escapeHtml(text);
  out = out.replace(BOLD_RE, (_m, inner: string) => `<strong>${inner}</strong>`);
  out = out.replace(EM_RE, (_m, inner: string) => `<em>${inner}</em>`);
  return out.replace(/\n/g, '<br/>');
}
