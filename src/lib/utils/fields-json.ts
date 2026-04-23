import type { Field } from '../../renderer/types.ts';

export function parseFieldsJson(json: string): Field[] | null {
  if (!json.trim()) return null;
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    return parsed as Field[];
  } catch {
    return null;
  }
}
