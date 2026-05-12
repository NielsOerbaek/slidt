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
.eyebrow { font-size: 20px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 40px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.card { padding: 56px 48px; }
.card-light { background: var(--sl-surface, #ededed); border: 2px solid var(--sl-border, #e0e0db); }
.card-dark { background: var(--sl-dark-bg, #1a1a1a); }
.card-light blockquote { color: var(--sl-fg, #1a1a1a); }
.card-dark blockquote { color: var(--sl-dark-fg, #f5f5f3); }
blockquote { font-size: 48px; font-weight: 500; line-height: 1.15; letter-spacing: -0.025em; margin: 0 0 28px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.attr { font-size: 22px; font-weight: 400; font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); }
.card-light .attr { color: var(--sl-dim, #a0a09a); }
.card-dark .attr { color: var(--sl-dark-dim, #888888); }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .cards { grid-template-columns: 1fr; gap: 16px; }
  .card { padding: 32px 24px; }
  blockquote { font-size: 1.5rem; }
  .attr { font-size: 0.875rem; }
}`,
};
