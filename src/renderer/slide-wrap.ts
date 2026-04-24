import { cornerMarkup } from './symbols.ts';

export interface WrapOptions {
  name: string;
  pageNum: number;
  total: number;
  /** Section-divider slides drop the corner logo. Default true. */
  showCorner?: boolean;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function wrapSlide(content: string, opts: WrapOptions): string {
  const showCorner = opts.showCorner !== false;
  const counter = `<div class="page-num">${pad2(opts.pageNum)} / ${pad2(opts.total)}</div>`;
  const corner = showCorner ? cornerMarkup() : '';
  return `<section class="slide st-${opts.name}">\n${content}\n${corner}${counter}\n</section>`;
}
