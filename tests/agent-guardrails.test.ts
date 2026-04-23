import { describe, it, expect } from 'vitest';
import {
  checkHandlebarsTemplate,
  checkCss,
  GuardrailError,
} from '../src/lib/server/agent/guardrails.ts';

describe('checkHandlebarsTemplate', () => {
  it('accepts templates with allowed helpers only', () => {
    expect(() =>
      checkHandlebarsTemplate(
        '<div>{{fmt title}}</div>{{#if subtitle}}<p>{{default subtitle ""}}</p>{{/if}}',
      ),
    ).not.toThrow();
  });

  it('accepts templates with #each', () => {
    expect(() =>
      checkHandlebarsTemplate('{{#each items}}<li>{{fmt this}}</li>{{/each}}'),
    ).not.toThrow();
  });

  it('accepts simple variable lookups without helpers', () => {
    expect(() => checkHandlebarsTemplate('<h1>{{title}}</h1><p>{{body}}</p>')).not.toThrow();
  });

  it('accepts eq helper in sub-expression', () => {
    expect(() =>
      checkHandlebarsTemplate('{{#if (eq type "hero")}}<span>hero</span>{{/if}}'),
    ).not.toThrow();
  });

  it('rejects templates with unknown helpers', () => {
    expect(() => checkHandlebarsTemplate('{{exec "rm -rf /"}}{{fmt title}}')).toThrow(
      /unknown helper/i,
    );
  });

  it('rejects triple-stash on unknown helpers', () => {
    expect(() => checkHandlebarsTemplate('{{{html content}}}')).toThrow(/unknown helper/i);
  });

  it('rejects partial references', () => {
    expect(() => checkHandlebarsTemplate('{{> myPartial}}')).toThrow(/partial/i);
  });

  it('throws on invalid Handlebars syntax', () => {
    expect(() => checkHandlebarsTemplate('{{#if unclosed')).toThrow();
  });

  it('exports a GuardrailError class', () => {
    expect(new GuardrailError('test')).toBeInstanceOf(Error);
    expect(new GuardrailError('test').name).toBe('GuardrailError');
  });
});

describe('checkCss', () => {
  it('accepts clean CSS with theme variables', () => {
    expect(() =>
      checkCss('& .content { color: var(--ood-text); font-size: 16px; }'),
    ).not.toThrow();
  });

  it('rejects @import', () => {
    expect(() => checkCss('@import url("evil.css");')).toThrow(/@import/i);
  });

  it('rejects external url()', () => {
    expect(() => checkCss('background: url("https://evil.com/img.png")')).toThrow(/url\(\)/i);
  });

  it('rejects expression()', () => {
    expect(() => checkCss('width: expression(document.cookie)')).toThrow(/expression/i);
  });

  it('rejects behavior:', () => {
    expect(() => checkCss('behavior: url(evil.htc)')).toThrow(/behavior/i);
  });

  it('accepts data: URIs for embedded fonts', () => {
    expect(() =>
      checkCss("@font-face { src: url('data:font/woff2;base64,abc'); }"),
    ).not.toThrow();
  });

  it('accepts relative url() references', () => {
    expect(() => checkCss('background: url("/static/logo.svg")')).not.toThrow();
  });
});
