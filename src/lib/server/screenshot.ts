import { render } from '../../renderer/index.ts';
import { buildFontCss } from './font-css.ts';
import { injectFontCss } from './pdf.ts';
import { db, decks, slides, slideTypes, themes } from './db/index.ts';
import { eq, and } from 'drizzle-orm';
import { buildDummyData } from '$lib/utils/field-defaults.ts';
import type { Deck, SlideType, Theme } from '../../renderer/types.ts';

/**
 * Render a single slide of the given slide type and return a PNG screenshot.
 * Used by the agent's `inspect_slide_type` tool to visually verify a template
 * after creation. When `slideId` is given, uses that slide's actual data
 * instead of auto-generated dummies — useful right after `add_slide`.
 */
export async function screenshotSlideType(
  slideTypeId: string,
  deckId: string,
  options: { slideId?: string } = {},
): Promise<Buffer> {
  const [st] = await db
    .select()
    .from(slideTypes)
    .where(eq(slideTypes.id, slideTypeId))
    .limit(1);
  if (!st) throw new Error(`slide type ${slideTypeId} not found`);

  const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
  if (!deck) throw new Error(`deck ${deckId} not found`);

  let slideData: Record<string, unknown> | null = null;
  if (options.slideId) {
    const [slide] = await db
      .select()
      .from(slides)
      .where(and(eq(slides.id, options.slideId), eq(slides.deckId, deckId)))
      .limit(1);
    if (!slide) throw new Error(`slide ${options.slideId} not found in this deck`);
    if (slide.typeId !== slideTypeId) {
      throw new Error(`slide ${options.slideId} uses a different slide type than ${slideTypeId}`);
    }
    slideData = slide.data as Record<string, unknown>;
  }

  // Theme: deck's theme → first preset → error.
  let theme: typeof themes.$inferSelect | null = null;
  if (deck.themeId) {
    const [t] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
    theme = t ?? null;
  }
  if (!theme) {
    const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
    theme = t ?? null;
  }
  if (!theme) throw new Error('no theme available');

  const renderType: SlideType = {
    name: st.name,
    label: st.label,
    fields: st.fields as SlideType['fields'],
    htmlTemplate: st.htmlTemplate,
    css: st.css,
  };

  const data = slideData ?? buildDummyData(renderType.fields);
  const deckObj: Deck = {
    title: deck.title,
    lang: deck.lang ?? 'da',
    slides: [{ typeName: renderType.name, data }],
  };
  const renderTheme: Theme = { name: theme.name, tokens: theme.tokens as Record<string, string> };

  const html = await render(deckObj, renderTheme, [renderType], { skipValidation: true });
  const fontCss = await buildFontCss();
  const fullHtml = injectFontCss(html, fontCss);

  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.setContent(fullHtml, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; });
    const slideEl = await page.$('.slide');
    if (!slideEl) throw new Error('no .slide rendered');
    const bytes = await slideEl.screenshot({ type: 'png' });
    return Buffer.from(bytes);
  } finally {
    await browser.close();
  }
}
