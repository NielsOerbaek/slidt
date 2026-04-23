import { describe, it, expect } from 'vitest';
import { validate, ValidationError } from '../src/renderer/validate.ts';
import type { Field } from '../src/renderer/types.ts';

describe('validate', () => {
  it('accepts valid scalar data', () => {
    const fields: Field[] = [{ name: 'title', type: 'text' }];
    expect(() => validate({ title: 'Hello' }, fields)).not.toThrow();
  });

  it('accepts missing optional fields', () => {
    const fields: Field[] = [{ name: 'title', type: 'text' }];
    expect(() => validate({}, fields)).not.toThrow();
  });

  it('rejects missing required fields', () => {
    const fields: Field[] = [{ name: 'title', type: 'text', required: true }];
    expect(() => validate({}, fields)).toThrow(ValidationError);
    expect(() => validate({}, fields)).toThrow(/title/);
  });

  it('rejects wrong scalar type', () => {
    const fields: Field[] = [{ name: 'n', type: 'text' }];
    expect(() => validate({ n: 42 }, fields)).toThrow(/text/);
  });

  it('rejects wrong bool type', () => {
    const fields: Field[] = [{ name: 'b', type: 'bool' }];
    expect(() => validate({ b: 'yes' }, fields)).toThrow(/bool/);
  });

  it('accepts valid lists of scalars', () => {
    const fields: Field[] = [
      { name: 'bullets', type: 'list', items: { name: 'b', type: 'richtext' } },
    ];
    expect(() => validate({ bullets: ['a', 'b'] }, fields)).not.toThrow();
  });

  it('rejects list that is not an array', () => {
    const fields: Field[] = [
      { name: 'bullets', type: 'list', items: { name: 'b', type: 'richtext' } },
    ];
    expect(() => validate({ bullets: 'hello' }, fields)).toThrow(/list/);
  });

  it('validates nested group items in a list', () => {
    const fields: Field[] = [
      {
        name: 'cards',
        type: 'list',
        items: {
          name: 'card',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'richtext' },
          ],
        },
      },
    ];
    expect(() =>
      validate({ cards: [{ title: 'a', body: 'x' }, { title: 'b' }] }, fields),
    ).not.toThrow();
    expect(() => validate({ cards: [{ body: 'no title' }] }, fields)).toThrow(/title/);
  });

  it('rejects select values not in options', () => {
    const fields: Field[] = [
      { name: 'mark', type: 'select', options: ['green', 'violet'] },
    ];
    expect(() => validate({ mark: 'green' }, fields)).not.toThrow();
    expect(() => validate({ mark: 'red' }, fields)).toThrow(/mark/);
  });
});
