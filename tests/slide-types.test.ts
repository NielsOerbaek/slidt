import { describe, it, expect } from 'vitest';
import { render } from '../src/renderer/index.ts';
import { cover } from '../src/slide-types/title.ts';
import { closing } from '../src/slide-types/closing.ts';
import { divider } from '../src/slide-types/section.ts';
import { agenda } from '../src/slide-types/agenda.ts';
import type { Deck, Theme, SlideType } from '../src/renderer/types.ts';
import { appendixList } from '../src/slide-types/appendix-list.ts';
import { BUILT_IN_SLIDE_TYPES } from '../src/slide-types/index.ts';
import { bulletList } from '../src/slide-types/content.ts';
import { numberedList } from '../src/slide-types/principles.ts';
import { qaList } from '../src/slide-types/discussion.ts';
import { columnList } from '../src/slide-types/values.ts';
import { calloutContent } from '../src/slide-types/reserve.ts';
import { cardGrid } from '../src/slide-types/purposes.ts';
import { teamCards } from '../src/slide-types/ownership.ts';
import { comparison } from '../src/slide-types/friction.ts';
import { imageFull } from '../src/slide-types/image-full.ts';
import { imageSide } from '../src/slide-types/image-side.ts';

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
    const html = await renderOne(cover, {
      eyebrow: 'Diskussionsoplæg',
      title: 'ANTAL',
      titleAlt: 'og Theta',
      kicker: 'Hvordan ANTAL passer ind',
      mark: 'dandelion-green',
    });
    expect(html).toContain('Diskussionsoplæg');
    expect(html).toContain('ANTAL');
    expect(html).toContain('og Theta');
    expect(html).toContain('Hvordan ANTAL passer ind');
    // Dandelion SVG is inlined — verify the green stroke colour appears.
    expect(html).toContain('#9CED7C');
  });

  it('falls back to violet mark when none specified', async () => {
    const html = await renderOne(cover, {
      title: 'X',
      titleAlt: 'Y',
    });
    expect(html).toContain('#6E31FF');
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
    const html = await renderOne(divider, {
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

describe('content slide type', () => {
  it('renders eyebrow, title, and bullets', async () => {
    const html = await renderOne(bulletList, {
      eyebrow: 'Recap',
      title: 'Hvad er ANTAL?',
      bullets: ['**ANTAL** er en forening', 'F.M.B.A. stiftet i 2022'],
    });
    expect(html).toContain('Recap');
    expect(html).toContain('Hvad er ANTAL?');
    expect(html).toContain('<strong>ANTAL</strong>');
    expect(html).toContain('F.M.B.A. stiftet i 2022');
  });
});

describe('principles slide type', () => {
  it('renders an ordered list of {title, body} items', async () => {
    const html = await renderOne(numberedList, {
      eyebrow: 'Værdi',
      title: 'De syv principper',
      items: [
        { title: 'Demokratisk', body: 'Medlemmer skal være...' },
        { title: 'Flad ledelse', body: 'Lige og direkte...' },
      ],
    });
    expect(html).toContain('Demokratisk');
    expect(html).toContain('Medlemmer skal være');
    expect(html).toContain('Flad ledelse');
  });
});

describe('discussion slide type', () => {
  it('renders letter-marked items', async () => {
    const html = await renderOne(qaList, {
      eyebrow: 'Diskussion',
      title: 'Fire spørgsmål',
      items: [
        { letter: 'A', text: 'Hvordan...?' },
        { letter: 'B', text: 'Hvorfor...?' },
      ],
    });
    expect(html).toContain('data-q="A"');
    expect(html).toContain('Hvordan');
    expect(html).toContain('data-q="B"');
  });
});

describe('values slide type', () => {
  it('renders two columns each with heading + items', async () => {
    const html = await renderOne(columnList, {
      eyebrow: 'Princip 5',
      title: 'De fælles værdier',
      columns: [
        { heading: 'Skal leve op til:', items: ['Lige ret', 'Klima'] },
        { heading: 'Ikke være:', items: ['Negative', 'Grønne'] },
      ],
    });
    expect(html).toContain('Skal leve op til');
    expect(html).toContain('Lige ret');
    expect(html).toContain('Ikke være');
  });
});

describe('reserve slide type', () => {
  it('renders title, paragraphs, and callout', async () => {
    const html = await renderOne(calloutContent, {
      eyebrow: 'Princip 6',
      title: 'Udelelig reserve',
      paragraphs: ['Bygger på fællesøkonomi.', 'Må ikke udbetales.'],
      callout: 'Aldrig som udbytte.',
    });
    expect(html).toContain('Udelelig reserve');
    expect(html).toContain('Bygger på fællesøkonomi');
    expect(html).toContain('Aldrig som udbytte');
  });
});

describe('purposes slide type', () => {
  it('renders a grid of numbered cards', async () => {
    const html = await renderOne(cardGrid, {
      eyebrow: 'Helikopter',
      title: 'Fire formål',
      cards: [
        { num: '01', title: 'Stordrift', body: 'Delt IT' },
        { num: '02', title: 'Fællesskab', body: 'Metoder' },
      ],
    });
    expect(html).toContain('01');
    expect(html).toContain('Stordrift');
    expect(html).toContain('Delt IT');
  });
});

describe('ownership slide type', () => {
  it('renders a source line and three cards', async () => {
    const html = await renderOne(teamCards, {
      eyebrow: 'Theta',
      title: 'Demokratisk organisering',
      source: 'F.M.B.A.-struktur.',
      cards: [
        { title: 'Foreningen', sub: 'medlemmer', body: 'Alle medlemmer.' },
        { title: 'Repræsentantskab', sub: '99 personer', body: 'Legitimitet.' },
        { title: 'Bestyrelse', sub: '8–12', body: 'Valgte.' },
      ],
    });
    expect(html).toContain('F.M.B.A.-struktur');
    expect(html).toContain('Foreningen');
    expect(html).toContain('99 personer');
  });
});

describe('friction slide type', () => {
  it('renders two sides and a question', async () => {
    const html = await renderOne(comparison, {
      eyebrow: 'Friktion 1',
      title: 'Medarbejdereje?',
      sideA: {
        label: 'ANTAL',
        head: 'Medlemsvirksomheder er medarbejderejede.',
        body: ['Fundament.'],
      },
      sideB: {
        label: 'Theta',
        head: 'Forbrugereje.',
        body: ['Ejes af brugerne.'],
      },
      question: 'Hvad er forholdet?',
    });
    expect(html).toContain('Medarbejdereje');
    expect(html).toContain('ANTAL');
    expect(html).toContain('Fundament');
    expect(html).toContain('Theta');
    expect(html).toContain('Ejes af brugerne');
    expect(html).toContain('Hvad er forholdet');
  });
});

describe('appendix-list slide type', () => {
  it('renders a list of appendix items with marks', async () => {
    const html = await renderOne(appendixList, {
      eyebrow: 'Bilag',
      title: 'Tilhørende materiale',
      items: [
        { mark: 'A', title: 'Bilag A', subtitle: 'Vedtægter' },
        { mark: 'B', title: 'Bilag B', subtitle: 'Principgrundlag' },
      ],
    });
    expect(html).toContain('Tilhørende materiale');
    expect(html).toContain('>A<');
    expect(html).toContain('Bilag A');
    expect(html).toContain('Vedtægter');
  });
});

describe('image-full slide type', () => {
  it('renders img-wrap with asset URL', async () => {
    const html = await renderOne(imageFull, {
      image: 'asset-uuid-1',
      overlay: true,
      headline: 'Visual story',
      caption: 'Copenhagen, 2026',
    });
    expect(html).toContain('/api/assets/asset-uuid-1');
    expect(html).toContain('img-wrap');
    expect(html).toContain('Visual story');
    expect(html).toContain('Copenhagen, 2026');
    expect(html).toContain('has-overlay');
  });

  it('renders with image object and no overlay', async () => {
    const html = await renderOne(imageFull, {
      image: { id: 'asset-uuid-2', cropX: 10, cropY: 5, cropW: 80, cropH: 90, rotate: 0 },
      overlay: false,
    });
    expect(html).toContain('/api/assets/asset-uuid-2');
    // Check that the HTML content (not CSS) doesn't have the class on the image-full-slide element
    expect(html).not.toContain('image-full-slide has-overlay');
  });
});

describe('image-side slide type', () => {
  it('renders image column and text column', async () => {
    const html = await renderOne(imageSide, {
      image: 'asset-side-1',
      title: 'Billede og tekst',
      body: 'En linje til højre.',
      flip: false,
    });
    expect(html).toContain('/api/assets/asset-side-1');
    expect(html).toContain('Billede og tekst');
    expect(html).toContain('En linje til højre');
    expect(html).not.toContain('image-side-slide flipped');
  });

  it('adds "flipped" class when flip is true', async () => {
    const html = await renderOne(imageSide, {
      image: 'asset-side-2',
      flip: true,
    });
    expect(html).toContain('image-side-slide flipped');
  });
});

describe('BUILT_IN_SLIDE_TYPES', () => {
  it('exports exactly 22 types', () => {
    expect(BUILT_IN_SLIDE_TYPES).toHaveLength(22);
  });

  it('includes the expected names', () => {
    const names = BUILT_IN_SLIDE_TYPES.map((t) => t.name).sort();
    expect(names).toEqual([
      'agenda', 'appendix-list', 'bullet-list', 'callout-content', 'card-grid',
      'closing', 'column-list', 'comparison', 'cover', 'divider', 'dot-flow',
      'image-full', 'image-side', 'numbered-list', 'qa-list', 'quote', 'quote-pair',
      'stat-grid', 'team-cards', 'three-column', 'timeline', 'two-column',
    ]);
  });

  it('has unique names', () => {
    const names = BUILT_IN_SLIDE_TYPES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
