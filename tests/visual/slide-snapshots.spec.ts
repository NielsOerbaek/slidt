import { test, expect } from '@playwright/test';
import { BUILT_IN_SLIDE_TYPES } from '../../src/slide-types/index.ts';
import { render } from '../../src/renderer/index.ts';
import { antalThetaDefault } from '../../src/themes/antal-theta-default.ts';
import { buildFontCss } from '../../src/lib/server/font-css.ts';
import { buildDefaultData } from '../../src/lib/utils/field-defaults.ts';

// Minimal overrides so required fields aren't empty in screenshots.
const FILL: Record<string, Record<string, unknown>> = {
  title: { title: 'Sample Titel', eyebrow: 'AGENDA', kicker: 'Os & Data · 2024' },
  agenda: {
    title: 'Dagsorden',
    items: ['Intro', 'Diskussion', 'Næste skridt'],
  },
  section: { bigMark: '01', title: 'Sektion', subtitle: 'Undertitel' },
  content: { title: 'Indhold', bullets: ['Her er brødteksten.'] },
  principles: {
    title: 'Principper',
    items: [
      { title: 'Princip 1', body: 'Beskrivelse 1' },
      { title: 'Princip 2', body: 'Beskrivelse 2' },
    ],
  },
  values: {
    title: 'Værdier',
    columns: [
      { heading: 'Kolonne 1', items: ['Ærlighed', 'Ambition'] },
      { heading: 'Kolonne 2', items: ['Mod', 'Omsorg'] },
    ],
  },
  reserve: {
    title: 'Reserve slide',
    paragraphs: ['Her er teksten.'],
    callout: 'Her er callout.',
  },
  purposes: {
    title: 'Formål',
    cards: [{ num: '01', title: 'Formål 1', body: 'Beskrivelse' }],
  },
  ownership: {
    title: 'Ejerskab',
    source: 'Kilde: Intern analyse',
    cards: [
      { title: 'Kort 1', sub: 'Undertype A', body: 'Beskrivelse 1' },
      { title: 'Kort 2', sub: 'Undertype B', body: 'Beskrivelse 2' },
      { title: 'Kort 3', sub: 'Undertype C', body: 'Beskrivelse 3' },
    ],
  },
  friction: {
    title: 'Gnidning',
    sideA: { label: 'Side A', head: 'Hoved A', body: ['Tekst A'] },
    sideB: { label: 'Side B', head: 'Hoved B', body: ['Tekst B'] },
    question: 'Hvad er løsningen?',
  },
  discussion: {
    title: 'Diskussion',
    items: [
      { letter: 'A', text: 'Spørgsmål 1' },
      { letter: 'B', text: 'Spørgsmål 2' },
    ],
  },
  closing: { title: 'Tak' },
  'appendix-list': {
    eyebrow: 'Bilag',
    title: 'Tilhørende materiale',
    items: [{ mark: 'A', title: 'Bilag 1', subtitle: 'Undertitel' }],
  },
};

let fontCss: string;

test.beforeAll(async () => {
  fontCss = await buildFontCss();
});

for (const slideType of BUILT_IN_SLIDE_TYPES) {
  test(slideType.name, async ({ page }) => {
    const data = { ...buildDefaultData(slideType.fields), ...(FILL[slideType.name] ?? {}) };
    const deck = { title: 'Test', lang: 'da', slides: [{ typeName: slideType.name, data }] };
    const html = await render(deck, antalThetaDefault, [slideType]);
    const htmlWithFonts = fontCss
      ? html.replace('<style>', `<style>\n${fontCss}\n`)
      : html;

    await page.setContent(htmlWithFonts, { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => { await document.fonts.ready; });

    const slide = page.locator('.slide').first();
    await expect(slide).toHaveScreenshot(`${slideType.name}.png`, {
      maxDiffPixels: 100,
    });
  });
}
