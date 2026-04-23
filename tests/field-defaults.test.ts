import { describe, it, expect } from 'vitest';
import { buildDefaultData } from '../src/lib/utils/field-defaults.ts';
import type { Field } from '../src/renderer/types.ts';

describe('buildDefaultData', () => {
  it('returns empty object for empty field list', () => {
    expect(buildDefaultData([])).toEqual({});
  });

  it('returns empty string for text, richtext, markdown, select, image', () => {
    const fields: Field[] = [
      { name: 'a', type: 'text' },
      { name: 'b', type: 'richtext' },
      { name: 'c', type: 'markdown' },
      { name: 'd', type: 'select', options: ['x'] },
      { name: 'e', type: 'image' },
    ];
    expect(buildDefaultData(fields)).toEqual({ a: '', b: '', c: '', d: '', e: '' });
  });

  it('returns false for bool', () => {
    expect(buildDefaultData([{ name: 'v', type: 'bool' }])).toEqual({ v: false });
  });

  it('returns empty array for list', () => {
    expect(
      buildDefaultData([{ name: 'items', type: 'list', items: { name: 'item', type: 'text' } }]),
    ).toEqual({ items: [] });
  });

  it('returns nested defaults for group', () => {
    const field: Field = {
      name: 'meta',
      type: 'group',
      fields: [{ name: 'x', type: 'text' }, { name: 'flag', type: 'bool' }],
    };
    expect(buildDefaultData([field])).toEqual({ meta: { x: '', flag: false } });
  });

  it('uses field.default when present', () => {
    expect(buildDefaultData([{ name: 'lang', type: 'text', default: 'da' }])).toEqual({ lang: 'da' });
  });
});
