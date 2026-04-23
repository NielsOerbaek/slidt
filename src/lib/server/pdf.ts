import { chromium } from 'playwright';
import { readFile } from 'fs/promises';
import { render } from '../../renderer/index.ts';
import { buildFontCss } from './font-css.ts';
import { stitchPdfs } from './pdf-utils.ts';
import { db, decks, slides, slideTypes, themes, assets } from './db/index.ts';
import { eq, inArray } from 'drizzle-orm';
import type { Deck, SlideType, Theme, Slide } from '../../renderer/types.ts';

/**
 * Insert @font-face CSS at the top of the HTML `<style>` block.
 * Returns html unchanged when fontCss is empty or there is no <style> tag.
 */
export function injectFontCss(html: string, fontCss: string): string {
  if (!fontCss || !html.includes('<style>')) return html;
  return html.replace('<style>', `<style>\n${fontCss}\n`);
}

export async function renderDeckToPdf(deckId: string): Promise<Buffer> {
  // 1. Load deck
  const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
  if (!deck) throw new Error(`Deck not found: ${deckId}`);

  // 2. Load slides ordered by deck.slideOrder
  const slideRows = await db.select().from(slides).where(eq(slides.deckId, deckId));
  const slideMap = new Map(slideRows.map((s) => [s.id, s]));
  const ordered = deck.slideOrder
    .map((id) => slideMap.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  for (const s of slideRows) {
    if (!deck.slideOrder.includes(s.id)) ordered.push(s);
  }

  // 3. Load slide types used by this deck
  const typeIds = [...new Set(ordered.map((s) => s.typeId))];
  const typeRows = typeIds.length
    ? await db.select().from(slideTypes).where(inArray(slideTypes.id, typeIds))
    : [];
  const typeMap = new Map(typeRows.map((t) => [t.id, t]));

  // 4. Load theme: deck theme → first preset → error
  let theme: typeof themes.$inferSelect | null = null;
  if (deck.themeId) {
    const [t] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
    theme = t ?? null;
  }
  if (!theme) {
    const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
    theme = t ?? null;
  }
  if (!theme) throw new Error('No theme configured for this deck');

  // 5. Load appendix-pdf assets (stitched onto the end of the PDF)
  const deckAssets = await db.select().from(assets).where(eq(assets.deckId, deckId));
  const appendixAssets = deckAssets.filter((a) => a.kind === 'appendix-pdf');

  // 6. Assemble render inputs
  const deckSlides: Slide[] = ordered.map((s) => {
    const t = typeMap.get(s.typeId);
    if (!t) throw new Error(`Missing slide type ${s.typeId}`);
    return { typeName: t.name, data: s.data as Record<string, unknown> };
  });
  const renderTypes: SlideType[] = typeRows.map((t) => ({
    name: t.name,
    label: t.label,
    fields: t.fields as SlideType['fields'],
    htmlTemplate: t.htmlTemplate,
    css: t.css,
  }));
  const renderTheme: Theme = {
    name: theme.name,
    tokens: theme.tokens as Record<string, string>,
  };
  const renderDeck: Deck = { title: deck.title, lang: deck.lang, slides: deckSlides };

  // 7. Render HTML and inject fonts
  const html = await render(renderDeck, renderTheme, renderTypes);
  const fontCss = await buildFontCss();
  const htmlWithFonts = injectFontCss(html, fontCss);

  // 8. Print to PDF via Playwright
  const browser = await chromium.launch();
  let pdfBuf: Buffer;
  try {
    const page = await browser.newPage();
    await page.setContent(htmlWithFonts, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; });
    const bytes = await page.pdf({
      width: '1920px',
      height: '1080px',
      printBackground: true,
    });
    pdfBuf = Buffer.from(bytes);
  } finally {
    await browser.close();
  }

  // 9. Stitch appendix PDFs
  if (appendixAssets.length > 0) {
    const appendixBufs = await Promise.all(
      appendixAssets.map((a) => readFile(a.storagePath).then((b) => Buffer.from(b))),
    );
    pdfBuf = await stitchPdfs(pdfBuf, appendixBufs);
  }

  return pdfBuf;
}
