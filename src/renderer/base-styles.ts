/**
 * Global stylesheet included in every rendered deck. Covers:
 *   - @page size (1920x1080)
 *   - html/body reset
 *   - .slide base (the 1920x1080 frame)
 *   - .corner-logo
 *   - .page-num
 *   - .eyebrow
 *   - Shared typography defaults
 *
 * Per-slide-type styles live in each SlideType.css and are auto-scoped to
 * `.st-<name>` at render time. Fonts are expected to be loaded by the host
 * (Plan 2 serves them from /fonts).
 */
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
}

.corner-logo {
  position: absolute;
  right: 60px;
  bottom: 60px;
  font-family: 'Neureal Mono', monospace;
  font-size: 14px;
  line-height: 1.15;
  color: var(--ood-dark-matter-light);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.page-num {
  position: absolute;
  left: 60px;
  bottom: 60px;
  font-family: 'Neureal Mono', monospace;
  font-size: 12px;
  color: var(--ood-dark-matter-light);
}

.eyebrow {
  font-family: 'Neureal Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.1em;
  color: var(--ood-deep-violet);
  margin-bottom: 24px;
}
`;
