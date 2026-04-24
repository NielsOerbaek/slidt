import { describe, it, expect } from 'vitest';
import { buildFontCss } from '../src/lib/server/font-css.ts';

describe('buildFontCss', () => {
  it('returns a non-empty string', async () => {
    const css = await buildFontCss();
    expect(typeof css).toBe('string');
    expect(css.length).toBeGreaterThan(0);
  });

  it('includes Inter @font-face rules for weights 300, 400, 600', async () => {
    const css = await buildFontCss();
    expect(css).toContain("font-family: 'Inter'");
    expect(css).toContain('font-weight: 300');
    expect(css).toContain('font-weight: 400');
    expect(css).toContain('font-weight: 600');
  });

  it('embeds woff2 base64 data URIs', async () => {
    const css = await buildFontCss();
    expect(css).toContain('data:font/woff2;base64,');
  });

  it('does not throw when Neureal Mono files are absent', async () => {
    // static/fonts/ may not exist — buildFontCss must not throw
    await expect(buildFontCss()).resolves.not.toThrow();
  });

  it('includes Neureal + Neureal Mono @font-face rules when the files are present', async () => {
    const css = await buildFontCss();
    expect(css).toContain("font-family: 'Neureal'");
    expect(css).toContain("font-family: 'Neureal Mono'");
  });
});
