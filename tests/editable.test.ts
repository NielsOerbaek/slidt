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

  it('tags fmt this inside #each with list path + @index', () => {
    expect(
      makeEditable('{{#each bullets}}<li>{{fmt this}}</li>{{/each}}'),
    ).toBe(
      '{{#each bullets}}<li><span data-slidt-field="bullets.{{@index}}">{{fmt this}}</span></li>{{/each}}',
    );
  });

  it('tags named field inside #each as list.@index.field', () => {
    expect(
      makeEditable('{{#each cards}}<h3>{{fmt heading}}</h3>{{/each}}'),
    ).toBe(
      '{{#each cards}}<h3><span data-slidt-field="cards.{{@index}}.heading">{{fmt heading}}</span></h3>{{/each}}',
    );
  });

  it('handles dotted top-level paths (group field access)', () => {
    expect(makeEditable('{{fmt sideA.label}}')).toBe(
      '<span data-slidt-field="sideA.label">{{fmt sideA.label}}</span>',
    );
  });

  it('handles #each over a dotted path', () => {
    expect(
      makeEditable('{{#each sideA.body}}<p>{{fmt this}}</p>{{/each}}'),
    ).toBe(
      '{{#each sideA.body}}<p><span data-slidt-field="sideA.body.{{@index}}">{{fmt this}}</span></p>{{/each}}',
    );
  });

  it('skips wrapping inside two-level nested #each', () => {
    const tpl = '{{#each outer}}{{#each inner}}<i>{{fmt this}}</i>{{/each}}{{/each}}';
    expect(makeEditable(tpl)).toBe(tpl);
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

  it('tags through #if inside #each (if does not change context)', () => {
    const tpl = '{{#each items}}{{#if foo}}<span>{{fmt this}}</span>{{/if}}{{/each}}{{fmt title}}';
    const out = makeEditable(tpl);
    expect(out).toContain('data-slidt-field="items.{{@index}}"');
    expect(out).toContain('<span data-slidt-field="title">{{fmt title}}</span>');
  });
});
