import { describe, it, expect } from 'vitest';
import { compile } from '../src/renderer/handlebars.ts';

describe('handlebars helpers', () => {
  it('fmt helper emits safe HTML (no double-escape)', () => {
    const tpl = compile('{{fmt text}}');
    expect(tpl({ text: '**bold**' })).toBe('<strong>bold</strong>');
  });

  it('fmt helper escapes HTML in raw text', () => {
    const tpl = compile('{{fmt text}}');
    expect(tpl({ text: 'a < b' })).toBe('a &lt; b');
  });

  it('eq helper compares values', () => {
    const tpl = compile('{{#if (eq a b)}}yes{{else}}no{{/if}}');
    expect(tpl({ a: 1, b: 1 })).toBe('yes');
    expect(tpl({ a: 1, b: 2 })).toBe('no');
  });

  it('default helper returns fallback when value is missing', () => {
    const tpl = compile('{{default x "fallback"}}');
    expect(tpl({ x: 'value' })).toBe('value');
    expect(tpl({})).toBe('fallback');
    expect(tpl({ x: '' })).toBe('fallback');
    expect(tpl({ x: null })).toBe('fallback');
  });

  it('iterates lists with each', () => {
    const tpl = compile('{{#each items}}-{{this}}{{/each}}');
    expect(tpl({ items: ['a', 'b'] })).toBe('-a-b');
  });

  it('fmt applied per-item inside each', () => {
    const tpl = compile('{{#each items}}<li>{{fmt this}}</li>{{/each}}');
    expect(tpl({ items: ['**a**', 'b'] })).toBe('<li><strong>a</strong></li><li>b</li>');
  });

  it('compile caches repeated calls', () => {
    const src = '<p>{{x}}</p>';
    const a = compile(src);
    const b = compile(src);
    expect(a).toBe(b);
  });
});
