import { describe, it, expect } from 'vitest';
import { pageShell } from '../src/renderer/page-shell.ts';

describe('pageShell', () => {
  it('produces a valid HTML document', () => {
    const out = pageShell({
      lang: 'da',
      title: 'Test',
      css: 'body { margin: 0; }',
      body: '<section>one</section>',
    });
    expect(out).toMatch(/^<!doctype html>/i);
    expect(out).toContain('<html lang="da">');
    expect(out).toContain('<title>Test</title>');
    expect(out).toContain('<style>body { margin: 0; }</style>');
    expect(out).toContain('<section>one</section>');
  });

  it('escapes title', () => {
    const out = pageShell({
      lang: 'da',
      title: '<script>',
      css: '',
      body: '',
    });
    expect(out).toContain('<title>&lt;script&gt;</title>');
    expect(out).not.toContain('<title><script>');
  });

  it('escapes lang', () => {
    const out = pageShell({
      lang: 'da"><script>',
      title: 'T',
      css: '',
      body: '',
    });
    expect(out).not.toContain('<script>');
  });
});
