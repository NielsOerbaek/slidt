import { describe, it, expect } from 'vitest';
import { render } from '../src/renderer/index.ts';
import { title } from '../src/slide-types/title.ts';
import { closing } from '../src/slide-types/closing.ts';
import { section } from '../src/slide-types/section.ts';
import { agenda } from '../src/slide-types/agenda.ts';
import type { Deck, Theme, SlideType } from '../src/renderer/types.ts';

const emptyTheme: Theme = { name: 'empty', tokens: {} };

async function renderOne(type: SlideType, data: Record<string, unknown>): Promise<string> {
  const deck: Deck = {
    title: 'T',
    lang: 'da',
    slides: [{ typeName: type.name, data }],
  };
  return render(deck, emptyTheme, [type]);
}

describe('title slide type', () => {
  it('renders eyebrow, title, titleAlt, kicker, and a mark', async () => {
    const html = await renderOne(title, {
      eyebrow: 'Diskussionsoplæg',
      title: 'ANTAL',
      titleAlt: 'og Theta',
      kicker: 'Hvordan ANTAL passer ind',
      mark: 'dandelion-green',
      markUrl: 'assets/ood-mark-green.svg',
    });
    expect(html).toContain('Diskussionsoplæg');
    expect(html).toContain('ANTAL');
    expect(html).toContain('og Theta');
    expect(html).toContain('Hvordan ANTAL passer ind');
    expect(html).toContain('ood-mark-green.svg');
  });

  it('falls back to violet mark when none specified', async () => {
    const html = await renderOne(title, {
      title: 'X',
      titleAlt: 'Y',
    });
    expect(html).toContain('ood-mark-violet.svg');
  });
});

describe('closing slide type', () => {
  it('renders title and optional subtitle', async () => {
    const html = await renderOne(closing, { title: 'Tak', subtitle: 'for i dag' });
    expect(html).toContain('Tak');
    expect(html).toContain('for i dag');
  });
});

describe('section slide type', () => {
  it('renders bigMark, title, subtitle and omits corner logo', async () => {
    const html = await renderOne(section, {
      bigMark: 'ϑ',
      title: 'Theta',
      subtitle: 'into the picture',
    });
    expect(html).toContain('ϑ');
    expect(html).toContain('Theta');
    expect(html).toContain('into the picture');
    expect(html).not.toContain('corner-logo');
  });
});

describe('agenda slide type', () => {
  it('renders title and ordered list of items', async () => {
    const html = await renderOne(agenda, {
      title: 'Indhold',
      items: ['Recap', 'Helikopter', 'Theta'],
    });
    expect(html).toContain('Indhold');
    expect(html).toContain('<li>Recap</li>');
    expect(html).toContain('<li>Helikopter</li>');
    expect(html).toContain('<li>Theta</li>');
  });
});
