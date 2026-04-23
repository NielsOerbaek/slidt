import type { Field } from '../../renderer/types.ts';

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
