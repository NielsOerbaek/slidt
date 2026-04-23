import { describe, it, expect } from 'vitest';
import { fmt } from '../src/renderer/fmt.ts';

describe('fmt', () => {
  it('returns empty string for null/undefined/empty', () => {
    expect(fmt(null)).toBe('');
    expect(fmt(undefined)).toBe('');
    expect(fmt('')).toBe('');
  });

  it('escapes HTML chars', () => {
    expect(fmt('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
    expect(fmt('"q" \'s')).toBe('&quot;q&quot; &#x27;s');
  });

  it('converts **bold** to <strong>', () => {
    expect(fmt('**hello**')).toBe('<strong>hello</strong>');
    expect(fmt('x **a** y')).toBe('x <strong>a</strong> y');
  });

  it('converts *em* to <em>', () => {
    expect(fmt('x *a* y')).toBe('x <em>a</em> y');
  });

  it('keeps double-star bold from being consumed by em rule', () => {
    expect(fmt('**only bold**')).toBe('<strong>only bold</strong>');
  });

  it('converts \\n to <br/>', () => {
    expect(fmt('a\nb\nc')).toBe('a<br/>b<br/>c');
  });

  it('handles combinations', () => {
    expect(fmt('**bold**\nand *em*'))
      .toBe('<strong>bold</strong><br/>and <em>em</em>');
  });

  it('allows bold across newlines', () => {
    expect(fmt('**line1\nline2**')).toBe('<strong>line1\nline2</strong>'.replace('\n', '<br/>'));
  });

  it('does NOT match em across newlines', () => {
    expect(fmt('*line1\nline2*')).toBe('*line1<br/>line2*');
  });

  it('leaves lone * alone', () => {
    expect(fmt('lone * star')).toBe('lone * star');
  });

  it('escapes HTML inside bold markers', () => {
    expect(fmt('**a < b**')).toBe('<strong>a &lt; b</strong>');
  });
});
