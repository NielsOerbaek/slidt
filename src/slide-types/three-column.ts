import type { SlideType } from '../renderer/types.ts';

export const threeColumn: SlideType = {
  name: 'three-column',
  label: 'Three column',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'columns',
      type: 'list',
      required: true,
      items: {
        name: 'col',
        type: 'group',
        fields: [
          { name: 'heading', type: 'text', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="three-col-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="cols">
    {{#each columns}}
    <div class="col">
      <h4>{{fmt heading}}</h4>
      <p>{{fmt body}}</p>
    </div>
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 20px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 24px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
h2 { font-size: 80px; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 56px; letter-spacing: -0.03em; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
h4 { font-size: 28px; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 16px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); padding-bottom: 14px; border-bottom: 2px solid var(--sl-border, #e0e0db); }
p { font-size: 24px; font-weight: 400; color: var(--sl-dim, #a0a09a); line-height: 1.5; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .cols { grid-template-columns: 1fr; gap: 28px; }
  h2 { font-size: 2rem; margin-bottom: 32px; }
  h4 { font-size: 1.1rem; }
  p { font-size: 1rem; }
}`,
};
