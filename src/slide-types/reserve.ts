import type { SlideType } from '../renderer/types.ts';

export const calloutContent: SlideType = {
  name: 'callout-content',
  label: 'Content + callout',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    {
      name: 'paragraphs',
      type: 'list',
      required: true,
      items: { name: 'p', type: 'richtext' },
    },
    { name: 'callout', type: 'richtext', required: true },
  ],
  htmlTemplate: `<div class="left">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <h2>{{fmt title}}</h2>
</div>
<div class="right">
  {{#each paragraphs}}<p>{{fmt this}}</p>{{/each}}
  <p class="callout">{{fmt callout}}</p>
</div>`,
  css: `& { flex-direction: row; padding: 0; }
.left { flex: 1; background: var(--sl-accent-bg); color: var(--sl-fg); padding: 120px 100px; display: flex; flex-direction: column; justify-content: center; }
.right { flex: 1.1; background: var(--sl-surface); color: var(--sl-fg); padding: 120px 100px; display: flex; flex-direction: column; justify-content: center; }
.left .eyebrow { font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sl-accent); margin-bottom: 20px; }
.left h2 { font-size: 72px; color: var(--sl-accent); line-height: 1.05; }
.right p { font-size: 28px; line-height: 1.5; margin-bottom: 22px; max-width: 780px; color: var(--sl-fg); }
.right .callout { font-family: var(--sl-font, 'Neureal', sans-serif); font-size: 40px; color: var(--sl-accent); margin-top: 16px; line-height: 1.15; max-width: 780px; }`,
};
