import type { SlideType } from '../renderer/types.ts';

export const quote: SlideType = {
  name: 'quote',
  label: 'Quote',
  fields: [
    { name: 'quote', type: 'richtext', required: true },
    { name: 'attribution', type: 'text' },
  ],
  htmlTemplate: `<div class="quote-wrap">
  <blockquote>{{fmt quote}}</blockquote>
  {{#if attribution}}<p class="attribution">— {{fmt attribution}}</p>{{/if}}
</div>`,
  css: `& { justify-content: center; align-items: center; text-align: center; padding: 120px 160px; background: var(--sl-bg, #f5f5f3); }
.quote-wrap { max-width: 1100px; }
blockquote { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 500; color: var(--sl-fg, #1a1a1a); line-height: 1.15; letter-spacing: -0.025em; margin: 0 0 40px; font-family: var(--sl-font, 'Inter', sans-serif); }
.attribution { font-size: 1rem; font-weight: 400; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Inter', sans-serif); }
@media (max-width: 768px) {
  & { padding: 60px 40px; }
  blockquote { font-size: 1.75rem; }
}`,
};
