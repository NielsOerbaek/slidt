/**
 * Global stylesheet included in every rendered deck. Per-slide-type styles
 * live in each SlideType.css and are auto-scoped to `.st-<name>` at render
 * time. Fonts are injected separately by src/lib/server/pdf.ts via buildFontCss().
 */
export const cornerStyles = `.corner-logo {
  position: absolute;
  right: 60px;
  bottom: 52px;
  width: 60px;
  height: 44px;
  color: var(--sl-accent);
  opacity: 0.85;
}
.corner-logo svg { width: 100%; height: 100%; fill: currentColor; }
.slide.dark .corner-logo { color: var(--sl-dark-fg); }`;

export const baseStyles = `
@page { size: 1920px 1080px; margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 1920px;
  background: var(--sl-surface);
  font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif));
  font-weight: 300;
  color: var(--sl-fg);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.slide {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  display: flex;
  padding: 80px 120px;
  background: var(--sl-bg);
  color: var(--sl-fg);
}

.slide:last-child { page-break-after: auto; }

.slide.dark { background: var(--sl-dark-bg); color: var(--sl-dark-fg); }
.slide.light { background: var(--sl-surface); color: var(--sl-fg); }
.slide.white { background: var(--sl-bg); color: var(--sl-fg); }

h1, h2, h3, h4 {
  font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.005em;
  color: var(--sl-accent);
}
.slide.dark h1,
.slide.dark h2,
.slide.dark h3,
.slide.dark h4 { color: var(--sl-dark-fg); }

p, li {
  font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif));
  font-weight: 300;
  line-height: 1.45;
}

strong, .subheading {
  font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif));
  font-weight: 500;
}

em {
  font-style: normal;
  font-weight: 500;
  color: var(--sl-accent);
}
.slide.dark em { color: var(--sl-dark-fg); }

.mono, .num {
  font-family: 'Neureal Mono', 'Courier New', monospace;
  font-weight: 400;
}

.page-num {
  position: absolute;
  right: 60px;
  top: 52px;
  font-family: 'Neureal Mono', 'Courier New', monospace;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: var(--sl-accent);
  opacity: 0.7;
  line-height: 1.2;
  z-index: 2;
}
.slide.dark .page-num { color: var(--sl-dark-dim); opacity: 0.85; }

.img-wrap {
  position: relative;
  overflow: hidden;
}
/* Legacy crop-window model (existing decks). */
.img-wrap > img {
  position: absolute;
  width: calc(100% * 100 / var(--crop-w, 100));
  height: calc(100% * 100 / var(--crop-h, 100));
  left: calc(var(--crop-x, 0) / var(--crop-w, 100) * -100%);
  top: calc(var(--crop-y, 0) / var(--crop-h, 100) * -100%);
  transform: rotate(var(--rotate, 0deg));
  transform-origin: center center;
}
/* Fit / zoom / position model (new images). */
.img-wrap.img-fit > img {
  inset: 0;
  left: auto;
  top: auto;
  width: 100%;
  height: 100%;
  object-fit: var(--fit, cover);
  object-position: var(--pos-x, 50%) var(--pos-y, 50%);
  transform: scale(var(--zoom, 1)) rotate(var(--rotate, 0deg));
  transform-origin: var(--pos-x, 50%) var(--pos-y, 50%);
}
`;
