import type { SlideType } from '../renderer/types.ts';

export const twoColumn: SlideType = {
  name: 'two-column',
  label: 'Two column',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'left',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'richtext', required: true },
      ],
    },
    {
      name: 'right',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'richtext', required: true },
      ],
    },
  ],
  htmlTemplate: `<div class="two-col-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="cols">
    <div class="col">
      <h4>{{fmt left.heading}}</h4>
      <p>{{fmt left.body}}</p>
    </div>
    <div class="col">
      <h4>{{fmt right.heading}}</h4>
      <p>{{fmt right.body}}</p>
    </div>
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 48px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
h4 { font-size: 1.1rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); padding-bottom: 12px; border-bottom: 1px solid var(--sl-border, #e0e0db); }
p { font-size: 1rem; font-weight: 400; color: var(--sl-dim, #a0a09a); line-height: 1.65; font-family: var(--sl-font, 'Inter', sans-serif); }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .cols { grid-template-columns: 1fr; gap: 32px; }
  h2 { font-size: 1.75rem; margin-bottom: 32px; }
}`,
};
