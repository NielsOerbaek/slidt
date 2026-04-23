import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render } from '../src/renderer/index.ts';
import { BUILT_IN_SLIDE_TYPES } from '../src/slide-types/index.ts';
import { antalThetaDefault } from '../src/themes/antal-theta-default.ts';
import type { Deck } from '../src/renderer/types.ts';

const deck = JSON.parse(
  readFileSync(new URL('./fixtures/deck-antal.json', import.meta.url), 'utf8'),
) as Deck;

describe('full ANTAL deck render', () => {
  it('renders without throwing', async () => {
    await expect(render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES)).resolves.toBeDefined();
  });

  it('emits one <section class="slide ..."> per slide, plus one appendix-list', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    const sectionCount = (html.match(/<section class="slide /g) ?? []).length;
    expect(sectionCount).toBe(deck.slides.length + (deck.appendix?.length ? 1 : 0));
  });

  it('includes the deck title in <title> and the first slide title text', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    expect(html).toContain('<title>ANTAL og Theta</title>');
    expect(html).toContain('ANTAL');
  });

  it('includes theme tokens and base styles', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    expect(html).toContain('--ood-deep-violet: #6E31FF');
    expect(html).toContain('@page { size: 1920px 1080px');
  });

  it('includes the appendix-list slide with both appendix items', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    expect(html).toContain('.st-appendix-list');
    expect(html).toContain('Vedtægter');
    expect(html).toContain('Principgrundlag');
  });

  it('page-numbers all slides with matching total', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    const total = deck.slides.length + (deck.appendix?.length ? 1 : 0);
    const totalStr = total < 10 ? `0${total}` : String(total);
    expect(html).toContain(`>01 / ${totalStr}<`);
    expect(html).toContain(`>${totalStr} / ${totalStr}<`);
  });
});
