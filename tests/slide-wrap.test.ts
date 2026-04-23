import { describe, it, expect } from 'vitest';
import { wrapSlide } from '../src/renderer/slide-wrap.ts';

describe('wrapSlide', () => {
  it('wraps content in a <section class="slide st-<name>">', () => {
    const out = wrapSlide('<h2>Hello</h2>', { name: 'title', pageNum: 1, total: 3 });
    expect(out).toContain('<section class="slide st-title">');
    expect(out).toContain('<h2>Hello</h2>');
    expect(out).toMatch(/<\/section>\s*$/);
  });

  it('includes the page counter', () => {
    const out = wrapSlide('<div />', { name: 'content', pageNum: 3, total: 17 });
    expect(out).toContain('<div class="page-num">03 / 17</div>');
  });

  it('zero-pads page numbers', () => {
    const out = wrapSlide('<div />', { name: 'content', pageNum: 1, total: 9 });
    expect(out).toContain('>01 / 09<');
  });

  it('includes the corner logo unless opted out', () => {
    const out = wrapSlide('<div />', { name: 'content', pageNum: 1, total: 1 });
    expect(out).toContain('class="corner-logo"');
  });

  it('omits the corner logo when showCorner is false', () => {
    const out = wrapSlide('<div />', { name: 'section', pageNum: 1, total: 1, showCorner: false });
    expect(out).not.toContain('corner-logo');
  });
});
