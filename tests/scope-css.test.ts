import { describe, it, expect } from 'vitest';
import { scopeCss } from '../src/renderer/scope-css.ts';

describe('scopeCss', () => {
  it('prefixes a simple selector', async () => {
    const out = await scopeCss('.eyebrow { color: red; }', 'content');
    expect(out).toContain('.st-content .eyebrow');
  });

  it('prefixes multiple selectors in a comma list', async () => {
    const out = await scopeCss('.a, .b { color: red; }', 'c');
    expect(out).toContain('.st-c .a');
    expect(out).toContain('.st-c .b');
  });

  it('prefixes element selectors', async () => {
    const out = await scopeCss('h2 { font-size: 60px; }', 'content');
    expect(out).toContain('.st-content h2');
  });

  it('handles @media by prefixing inner rules', async () => {
    const out = await scopeCss('@media print { h2 { color: black; } }', 'c');
    expect(out).toMatch(/@media print\s*\{\s*\.st-c h2/);
  });

  it('leaves @font-face alone', async () => {
    const src = "@font-face { font-family: 'X'; src: url('x.woff2'); }";
    const out = await scopeCss(src, 'c');
    expect(out).toContain('@font-face');
    expect(out).not.toContain('.st-c @font-face');
  });

  it('leaves :root alone', async () => {
    const out = await scopeCss(':root { --x: 1; }', 'c');
    expect(out).toContain(':root');
    expect(out).not.toContain('.st-c :root');
  });

  it('throws on @import (security guard)', async () => {
    await expect(scopeCss("@import 'evil.css';", 'c')).rejects.toThrow(/@import/);
  });
});
