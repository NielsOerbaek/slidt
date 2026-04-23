import { describe, it, expect } from 'vitest';
import type { Deck, Slide, SlideType, Field, Theme } from '../src/renderer/types.ts';

describe('types', () => {
  it('allows a valid Deck literal', () => {
    const deck: Deck = {
      title: 'Test',
      lang: 'da',
      slides: [{ typeName: 'title', data: { title: 'Hello' } }],
    };
    expect(deck.title).toBe('Test');
  });

  it('allows a Theme with tokens', () => {
    const theme: Theme = {
      name: 'default',
      tokens: { '--ood-white': '#FFFFFF' },
    };
    expect(theme.tokens['--ood-white']).toBe('#FFFFFF');
  });

  it('allows a SlideType with fields and template', () => {
    const t: SlideType = {
      name: 'content',
      label: 'Content',
      fields: [{ name: 'title', type: 'text' }],
      htmlTemplate: '<h2>{{title}}</h2>',
      css: '',
    };
    expect(t.name).toBe('content');
  });

  it('supports list fields with nested items', () => {
    const f: Field = {
      name: 'items',
      type: 'list',
      items: { name: 'bullet', type: 'richtext' },
    };
    expect(f.type).toBe('list');
  });

  it('supports group fields with sub-fields', () => {
    const f: Field = {
      name: 'card',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'richtext' },
      ],
    };
    expect(f.type).toBe('group');
  });
});
