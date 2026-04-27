import { describe, it, expect } from 'vitest';
import { makeEditable } from '../src/renderer/editable.ts';

describe('makeEditable', () => {
  it('wraps a top-level fmt reference', () => {
    expect(makeEditable('{{fmt title}}')).toBe(
      '<span data-slidt-field="title">{{fmt title}}</span>',
    );
  });

  it('wraps fmt inside #if (context unchanged)', () => {
    expect(makeEditable('{{#if eyebrow}}{{fmt eyebrow}}{{/if}}')).toBe(
      '{{#if eyebrow}}<span data-slidt-field="eyebrow">{{fmt eyebrow}}</span>{{/if}}',
    );
  });

  it('skips fmt this inside #each (list item context)', () => {
    expect(
      makeEditable('{{#each bullets}}<li>{{fmt this}}</li>{{/each}}'),
    ).toBe('{{#each bullets}}<li>{{fmt this}}</li>{{/each}}');
  });

  it('skips fmt of a named field inside #each (would resolve against item)', () => {
    expect(
      makeEditable('{{#each cards}}<h3>{{fmt heading}}</h3>{{/each}}'),
    ).toBe('{{#each cards}}<h3>{{fmt heading}}</h3>{{/each}}');
  });

  it('handles multiple top-level fields', () => {
    const out = makeEditable('<h1>{{fmt title}}</h1><p>{{fmt subtitle}}</p>');
    expect(out).toContain('data-slidt-field="title"');
    expect(out).toContain('data-slidt-field="subtitle"');
  });

  it('leaves non-fmt helpers and raw expressions alone', () => {
    const tpl = '{{dandelion mark}} {{eyebrow}} {{default kicker "—"}}';
    expect(makeEditable(tpl)).toBe(tpl);
  });

  it('handles nested each + if correctly', () => {
    const tpl = '{{#each items}}{{#if foo}}<span>{{fmt this}}</span>{{/if}}{{/each}}{{fmt title}}';
    const out = makeEditable(tpl);
    expect(out).toContain('<span>{{fmt this}}</span>');
    expect(out).toContain('<span data-slidt-field="title">{{fmt title}}</span>');
  });
});
