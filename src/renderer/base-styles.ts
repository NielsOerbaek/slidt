/**
 * Global stylesheet included in every rendered deck. Ported from
 * reference/slides/styles.css — the source-of-truth visual contract for the
 * ANTAL-Theta look. Per-slide-type styles live in each SlideType.css and are
 * auto-scoped to `.st-<name>` at render time. Fonts are injected separately
 * by src/lib/server/pdf.ts via buildFontCss().
 */
export const cornerStyles = `.corner-logo {
  position: absolute;
  right: 60px;
  bottom: 52px;
  width: 60px;
  height: 44px;
  color: var(--ood-deep-violet);
  opacity: 0.85;
}
.corner-logo svg { width: 100%; height: 100%; fill: currentColor; }
.slide.dark .corner-logo { color: var(--ood-wicked-matrix-light); }`;

export const baseStyles = `
@page { size: 1920px 1080px; margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 1920px;
  background: var(--ood-big-cloud);
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  color: var(--ood-dark-matter);
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
  background: var(--ood-big-cloud);
  color: var(--ood-dark-matter);
}

.slide:last-child { page-break-after: auto; }

.slide.dark { background: var(--ood-dark-matter); color: var(--ood-white); }
.slide.light { background: var(--ood-big-cloud); color: var(--ood-dark-matter); }
.slide.white { background: var(--ood-white); color: var(--ood-dark-matter); }

h1, h2, h3, h4 {
  font-family: 'Neureal', 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.005em;
  color: var(--ood-deep-violet);
}
.slide.dark h1,
.slide.dark h2,
.slide.dark h3,
.slide.dark h4 { color: var(--ood-wicked-matrix-light); }

p, li {
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  line-height: 1.45;
}

strong, .subheading {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

em {
  font-style: normal;
  font-weight: 500;
  color: var(--ood-deep-violet);
}
.slide.dark em { color: var(--ood-wicked-matrix-light); }

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
  color: var(--ood-deep-violet);
  opacity: 0.7;
  line-height: 1.2;
  z-index: 2;
}
.slide.dark .page-num { color: var(--ood-deep-violet-light); opacity: 0.85; }
`;
