import type { Deck, SlideType, Theme, Slide, RenderOptions } from './types.ts';
import { compile } from './handlebars.ts';
import { validate } from './validate.ts';
import { themeCss } from './theme-css.ts';
import { scopeCss } from './scope-css.ts';
import { wrapSlide } from './slide-wrap.ts';
import { pageShell } from './page-shell.ts';
import { baseStyles } from './base-styles.ts';

export * from './types.ts';

export async function render(
  deck: Deck,
  theme: Theme,
  templates: SlideType[],
  options: RenderOptions = {},
): Promise<string> {
  const byName = new Map(templates.map((t) => [t.name, t]));
  const slides = buildSlideList(deck, options);
  const usedTypeNames = new Set<string>();

  const slideHtml: string[] = [];
  const total = slides.length;
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!;
    const type = byName.get(slide.typeName);
    if (!type) {
      throw new Error(`Unknown slide type: ${slide.typeName}`);
    }
    usedTypeNames.add(type.name);
    validate(slide.data, type.fields);
    const tpl = compile(type.htmlTemplate);
    const inner = tpl(slide.data);
    slideHtml.push(
      wrapSlide(inner, {
        name: type.name,
        pageNum: i + 1,
        total,
        showCorner: type.name !== 'section',
      }),
    );
  }

  const perTypeCss: string[] = [];
  for (const name of usedTypeNames) {
    const type = byName.get(name)!;
    if (type.css.trim()) {
      perTypeCss.push(await scopeCss(type.css, name));
    }
  }

  const css = [themeCss(theme), baseStyles, ...perTypeCss].join('\n');

  return pageShell({
    lang: deck.lang,
    title: deck.title,
    css,
    body: slideHtml.join('\n\n'),
  });
}

function buildSlideList(deck: Deck, options: RenderOptions): Slide[] {
  const slides: Slide[] = [...deck.slides];
  if (!options.skipAppendixList && deck.appendix && deck.appendix.length > 0) {
    slides.push({
      typeName: 'appendix-list',
      data: {
        eyebrow: deck.appendixEyebrow ?? 'Bilag',
        title: deck.appendixTitle ?? 'Tilhørende materiale',
        items: deck.appendix,
      },
    });
  }
  return slides;
}
