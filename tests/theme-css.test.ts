import { describe, it, expect } from 'vitest';
import { themeCss } from '../src/renderer/theme-css.ts';

describe('themeCss', () => {
  it('returns empty :root for empty tokens', () => {
    expect(themeCss({ name: 't', tokens: {} })).toBe(':root {\n}\n');
  });

  it('emits a single token', () => {
    expect(themeCss({ name: 't', tokens: { '--x': '#fff' } }))
      .toBe(':root {\n  --x: #fff;\n}\n');
  });

  it('emits multiple tokens in insertion order', () => {
    const css = themeCss({
      name: 't',
      tokens: { '--a': '1px', '--b': '2px' },
    });
    expect(css).toBe(':root {\n  --a: 1px;\n  --b: 2px;\n}\n');
  });

  it('throws on token name without leading --', () => {
    expect(() => themeCss({ name: 't', tokens: { 'bad': 'x' } }))
      .toThrow(/custom property/);
  });

  it('rejects values with semicolons (cheap injection guard)', () => {
    expect(() => themeCss({
      name: 't',
      tokens: { '--x': 'red; background: url(/evil)' },
    })).toThrow(/semicolon/);
  });
});
