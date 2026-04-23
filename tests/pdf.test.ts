import { describe, it, expect } from 'vitest';
import { injectFontCss } from '../src/lib/server/pdf.ts';

describe('injectFontCss', () => {
  it('inserts font CSS at the top of the style block', () => {
    const html = '<head><style>body { color: red; }</style></head>';
    const result = injectFontCss(html, '@font-face { font-family: Inter; }');
    expect(result).toBe(
      '<head><style>\n@font-face { font-family: Inter; }\nbody { color: red; }</style></head>',
    );
  });

  it('returns html unchanged when fontCss is empty string', () => {
    const html = '<head><style>body{}</style></head>';
    expect(injectFontCss(html, '')).toBe(html);
  });

  it('returns html unchanged when there is no style tag', () => {
    const html = '<head></head><body></body>';
    expect(injectFontCss(html, '@font-face{}')).toBe(html);
  });
});
