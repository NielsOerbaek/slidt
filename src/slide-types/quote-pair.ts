import type { SlideType } from '../renderer/types.ts';

export const quotePair: SlideType = {
  name: 'quote-pair',
  label: 'Quote pair',
  fields: [
    { name: 'eyebrow', type: 'text' },
    {
      name: 'left',
      type: 'group',
      fields: [
        { name: 'quote', type: 'richtext', required: true },
        { name: 'attribution', type: 'text' },
      ],
    },
    {
      name: 'right',
      type: 'group',
      fields: [
        { name: 'quote', type: 'richtext', required: true },
        { name: 'attribution', type: 'text' },
      ],
    },
  ],
  htmlTemplate: `<div class="quote-pair-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <div class="cards">
    <div class="card card-light">
      <blockquote>{{fmt left.quote}}</blockquote>
      {{#if left.attribution}}<p class="attr">— {{fmt left.attribution}}</p>{{/if}}
    </div>
    <div class="card card-dark">
      <blockquote>{{fmt right.quote}}</blockquote>
      {{#if right.attribution}}<p class="attr">— {{fmt right.attribution}}</p>{{/if}}
    </div>
  </div>
</div>`,
  css: `& { flex-direction: column; justify-content: center; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 32px; font-family: var(--sl-font, 'Inter', sans-serif); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.card { padding: 48px 40px; border-radius: 10px; }
.card-light { background: var(--sl-surface, #fafaf8); border: 1px solid var(--sl-border, #e0e0db); }
.card-dark { background: var(--sl-dark-bg, #1a1a1a); }
.card-light blockquote { color: var(--sl-fg, #1a1a1a); }
.card-dark blockquote { color: var(--sl-dark-fg, #f5f5f3); }
blockquote { font-size: clamp(1.25rem, 2.5vw, 1.75rem); font-weight: 500; line-height: 1.3; letter-spacing: -0.02em; margin: 0 0 24px; font-family: var(--sl-font, 'Inter', sans-serif); }
.attr { font-size: 0.85rem; font-weight: 400; font-family: var(--sl-font, 'Inter', sans-serif); }
.card-light .attr { color: var(--sl-dim, #a0a09a); }
.card-dark .attr { color: var(--sl-dark-dim, #888888); }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .cards { grid-template-columns: 1fr; gap: 16px; }
  .card { padding: 32px 24px; }
}`,
};
