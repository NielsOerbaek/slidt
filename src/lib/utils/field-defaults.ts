import type { Field } from '../../renderer/types.ts';

/**
 * Returns realistic-looking placeholder values for use in live preview.
 * Unlike buildDefaultData, text fields get sample copy instead of empty strings.
 */
export function buildDummyData(fields: Field[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      result[field.name] = field.default;
    } else if (field.type === 'bool') {
      result[field.name] = true;
    } else if (field.type === 'select') {
      result[field.name] = field.options?.[0] ?? '';
    } else if (field.type === 'list') {
      const itemField = field.items;
      if (itemField?.type === 'group') {
        result[field.name] = [buildDummyData(itemField.fields ?? {}), buildDummyData(itemField.fields ?? {})];
      } else {
        result[field.name] = [`${field.label ?? field.name} one`, `${field.label ?? field.name} two`];
      }
    } else if (field.type === 'group') {
      result[field.name] = buildDummyData(field.fields ?? []);
    } else if (field.type === 'image') {
      result[field.name] = '';
    } else if (field.type === 'markdown') {
      result[field.name] = `**${field.label ?? field.name}** with _emphasis_ and a [link](#)`;
    } else {
      // text, richtext
      result[field.name] = field.label ?? field.name;
    }
  }
  return result;
}

export function buildDefaultData(fields: Field[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      result[field.name] = field.default;
    } else if (field.type === 'bool') {
      result[field.name] = false;
    } else if (field.type === 'list') {
      result[field.name] = [];
    } else if (field.type === 'group') {
      result[field.name] = buildDefaultData(field.fields ?? []);
    } else {
      result[field.name] = '';
    }
  }
  return result;
}
