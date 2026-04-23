import { describe, it, expect } from 'vitest';
import { parseFieldsJson } from '../src/lib/utils/fields-json.ts';

describe('parseFieldsJson', () => {
  it('parses valid fields JSON array', () => {
    const json = '[{"name":"title","type":"text"}]';
    const result = parseFieldsJson(json);
    expect(result).toEqual([{ name: 'title', type: 'text' }]);
  });
  it('returns null for invalid JSON', () => {
    expect(parseFieldsJson('not json')).toBeNull();
  });
  it('returns null for JSON that is not an array', () => {
    expect(parseFieldsJson('{"name":"x"}')).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(parseFieldsJson('')).toBeNull();
  });
  it('returns empty array for empty JSON array', () => {
    expect(parseFieldsJson('[]')).toEqual([]);
  });
});
