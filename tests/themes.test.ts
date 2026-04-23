import { describe, it, expect } from 'vitest';
import { antalThetaDefault } from '../src/themes/antal-theta-default.ts';
import { themeCss } from '../src/renderer/theme-css.ts';

describe('antalThetaDefault theme', () => {
  it('has a name', () => {
    expect(antalThetaDefault.name).toBe('antal-theta-default');
  });

  it('contains the OOD brand tokens', () => {
    const t = antalThetaDefault.tokens;
    expect(t['--ood-white']).toBe('#FFFFFF');
    expect(t['--ood-big-cloud']).toBe('#EDEDED');
    expect(t['--ood-deep-violet']).toBe('#6E31FF');
    expect(t['--ood-dark-matter']).toBe('#363442');
    expect(t['--ood-wicked-matrix']).toBe('#54DE10');
  });

  it('emits as valid CSS via themeCss', () => {
    const css = themeCss(antalThetaDefault);
    expect(css).toContain(':root {');
    expect(css).toContain('--ood-white: #FFFFFF;');
  });
});
