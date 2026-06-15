import { describe, it, expect } from 'vitest';
import { antalThetaDefault } from '../src/themes/antal-theta-default.ts';
import { themeCss } from '../src/renderer/theme-css.ts';

describe('antalThetaDefault theme', () => {
  it('has a name', () => {
    expect(antalThetaDefault.name).toBe('antal-theta-default');
  });

  it('contains the brand tokens', () => {
    const t = antalThetaDefault.tokens;
    expect(t['--sl-bg']).toBe('#FFFFFF');
    expect(t['--sl-surface']).toBe('#EDEDED');
    expect(t['--sl-accent']).toBe('#6E31FF');
    expect(t['--sl-fg']).toBe('#363442');
  });

  it('emits as valid CSS via themeCss', () => {
    const css = themeCss(antalThetaDefault);
    expect(css).toContain(':root {');
    expect(css).toContain('--sl-accent: #6E31FF;');
  });
});
