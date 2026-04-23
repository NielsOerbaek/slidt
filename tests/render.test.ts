import { describe, it, expect } from 'vitest';
import { render } from '../src/renderer/index.ts';
import type { Deck, SlideType, Theme } from '../src/renderer/types.ts';

const minimalType: SlideType = {
  name: 'test',
  label: 'Test',
  fields: [{ name: 'title', type: 'text', required: true }],
  htmlTemplate: '<h1>{{fmt title}}</h1>',
  css: 'h1 { color: red; }',
};

const emptyTheme: Theme = { name: 'empty', tokens: {} };

describe('render', () => {
  it('renders a single-slide deck', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: { title: 'Hello' } }],
    };
    const html = await render(deck, emptyTheme, [minimalType]);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<section class="slide st-test">');
    expect(html).toContain('<h1>Hello</h1>');
  });

  it('includes scoped CSS for used slide types', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: { title: 'Hi' } }],
    };
    const html = await render(deck, emptyTheme, [minimalType]);
    expect(html).toContain('.st-test h1');
  });

  it('includes theme tokens as :root block', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: { title: 'Hi' } }],
    };
    const theme: Theme = { name: 't', tokens: { '--c': 'red' } };
    const html = await render(deck, theme, [minimalType]);
    expect(html).toContain(':root');
    expect(html).toContain('--c: red');
  });

  it('numbers slides correctly', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [
        { typeName: 'test', data: { title: 'A' } },
        { typeName: 'test', data: { title: 'B' } },
        { typeName: 'test', data: { title: 'C' } },
      ],
    };
    const html = await render(deck, emptyTheme, [minimalType]);
    expect(html).toContain('>01 / 03<');
    expect(html).toContain('>02 / 03<');
    expect(html).toContain('>03 / 03<');
  });

  it('throws if a slide references an unknown type', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'missing', data: {} }],
    };
    await expect(render(deck, emptyTheme, [minimalType])).rejects.toThrow(/missing/);
  });

  it('throws if required data is missing', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: {} }],
    };
    await expect(render(deck, emptyTheme, [minimalType])).rejects.toThrow(/title/);
  });
});
