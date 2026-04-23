import type { SlideType } from '../renderer/types.ts';

export const reserve: SlideType = {
  name: 'reserve',
  label: 'Two-column reserve / callout',
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
  css: `.left { flex: 1; }
.right { flex: 1; display: flex; flex-direction: column; gap: 24px; justify-content: center; }
h2 { font-family: 'Neureal', sans-serif; font-size: 96px; line-height: 1; }
.right p { font-size: 26px; line-height: 1.45; }
.callout { background: var(--ood-deep-violet); color: var(--ood-white); padding: 32px; font-size: 28px; font-weight: 500; margin-top: 24px; }`,
};
