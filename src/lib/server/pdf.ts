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

async function loadDeckHtml(deckId: string): Promise<{ html: string; appendixAssets: typeof assets.$inferSelect[] }> {
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

  // 5. Load appendix-pdf assets
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
  return { html: injectFontCss(html, fontCss), appendixAssets };
}

export async function renderDeckToHtml(deckId: string): Promise<string> {
  const { html } = await loadDeckHtml(deckId);
  return html;
}

const PRESENTATION_CSS = `
html, body {
  margin: 0; padding: 0;
  width: 100vw; height: 100vh;
  overflow: hidden;
  background: #000;
}
.slide {
  display: none !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(var(--slide-scale, 1));
  transform-origin: center center;
}
.slide.active { display: flex !important; }
#prs-counter {
  position: fixed;
  bottom: 14px;
  right: 20px;
  font-family: monospace;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  pointer-events: none;
  z-index: 9999;
}
`;

const PRESENTATION_JS = `
(function() {
  var slides = Array.from(document.querySelectorAll('.slide'));
  var n = slides.length;
  var cur = 0;

  var counter = document.getElementById('prs-counter');

  function show(i) {
    slides[cur].classList.remove('active');
    cur = ((i % n) + n) % n;
    slides[cur].classList.add('active');
    if (counter) counter.textContent = (cur + 1) + ' / ' + n;
  }

  function resize() {
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--slide-scale', scale);
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault(); show(cur + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); show(cur - 1);
    }
  });

  document.addEventListener('click', function(e) {
    if (e.clientX >= window.innerWidth / 2) show(cur + 1);
    else show(cur - 1);
  });

  show(0);
})();
`;

export async function renderDeckToPresentation(deckId: string): Promise<string> {
  const { html } = await loadDeckHtml(deckId);
  return html
    .replace('</style>', PRESENTATION_CSS + '</style>')
    .replace('</body>', `<div id="prs-counter"></div><script>${PRESENTATION_JS}</script></body>`);
}

export async function renderDeckToPdf(deckId: string): Promise<Buffer> {
  const { html: htmlWithFonts, appendixAssets } = await loadDeckHtml(deckId);

  // 8. Print to PDF via Playwright
  const { chromium } = await import('playwright');
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
