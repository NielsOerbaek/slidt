import type { Field } from '../../renderer/types.ts';

const STRING_LIKE = new Set<Field['type']>(['text', 'richtext', 'markdown']);
const FALLBACK_KEYS = ['title', 'head', 'label', 'name', 'eyebrow'];
const MAX_LEN = 60;

/**
 * Extract a short readable preview of a slide's content for the slide list.
 * Tries (in order): a top-level `title` field, any other top-level text field,
 * the first item of any list field. Returns null when the slide has no
 * usable text — caller should fall back to the slide-type label.
 */
export function slideSnippet(
  data: Record<string, unknown> | null | undefined,
  fields: Field[],
): string | null {
  if (!data) return null;

  if (typeof data.title === 'string' && data.title.trim()) {
    return clip(data.title);
  }

  for (const f of fields) {
    if (!STRING_LIKE.has(f.type)) continue;
    const v = data[f.name];
    if (typeof v === 'string' && v.trim()) return clip(v);
  }

  for (const f of fields) {
    if (f.type !== 'list') continue;
    const arr = data[f.name];
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const first = arr[0];
    if (typeof first === 'string' && first.trim()) return clip(first);
    if (first && typeof first === 'object') {
      const obj = first as Record<string, unknown>;
      for (const k of FALLBACK_KEYS) {
        const v = obj[k];
        if (typeof v === 'string' && v.trim()) return clip(v);
      }
    }
  }

  return null;
}

function clip(s: string): string {
  const stripped = s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > MAX_LEN ? stripped.slice(0, MAX_LEN - 1) + '…' : stripped;
}
