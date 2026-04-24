// SVGs are imported via Vite's `?raw` query so the renderer works both on
// the server (Node) and in the browser (SlidePreview). Vite inlines each
// file's contents as a string at build time — no `node:fs` required.
import cornerSvgRaw from './assets/ood-type-vertical.svg?raw';
import markVioletRaw from './assets/ood-mark-violet.svg?raw';
import markGreenRaw from './assets/ood-mark-green.svg?raw';
import markWhiteRaw from './assets/ood-mark.svg?raw';

function svgInnerAndViewBox(svg: string): { viewBox: string; inner: string } {
  const viewBox = svg.match(/<svg[^>]*\sviewBox="([^"]+)"/i)?.[1] ?? '';
  const inner = svg
    .replace(/<\?xml[^?]*\?>\s*/g, '')
    .replace(/<svg\b[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim();
  return { viewBox, inner };
}

const { viewBox: CORNER_VIEWBOX, inner: CORNER_INNER } = svgInnerAndViewBox(cornerSvgRaw);

export const CORNER_SYMBOL_ID = 'ood-type-vertical';

export function cornerMarkup(): string {
  return (
    `<div class="corner-logo" role="img" aria-label="Os & Data">` +
    `<svg viewBox="${CORNER_VIEWBOX}" aria-hidden="true">` +
    `<use href="#${CORNER_SYMBOL_ID}"/></svg></div>`
  );
}

const DANDELION_SVGS: Record<string, string> = {
  'dandelion-green': markGreenRaw,
  'dandelion-violet': markVioletRaw,
  'dandelion-white': markWhiteRaw,
};

function stripXmlDecl(svg: string): string {
  return svg.replace(/<\?xml[^?]*\?>\s*/g, '').trim();
}

export function dandelionSvg(mark: string): string {
  const raw = DANDELION_SVGS[mark] ?? DANDELION_SVGS['dandelion-violet']!;
  return stripXmlDecl(raw);
}

/**
 * Single <svg> island that defines every reusable symbol (currently just the
 * corner wordmark). Emitted once per rendered page.
 */
export function symbolDefs(): string {
  return (
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true">` +
    `<symbol id="${CORNER_SYMBOL_ID}" viewBox="${CORNER_VIEWBOX}">${CORNER_INNER}</symbol>` +
    `</svg>`
  );
}
