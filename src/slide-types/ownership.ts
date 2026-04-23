import type { SlideType } from '../renderer/types.ts';

export const ownership: SlideType = {
  name: 'ownership',
  label: 'Ownership model (three cards)',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    { name: 'source', type: 'richtext', required: true },
    {
      name: 'cards',
      type: 'list',
      required: true,
      items: {
        name: 'card',
        type: 'group',
        fields: [
          { name: 'title', type: 'richtext', required: true },
          { name: 'sub', type: 'richtext', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `{{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
{{#if title}}<h2>{{fmt title}}</h2>{{/if}}
<div class="source">{{fmt source}}</div>
<div class="three-col">
  {{#each cards}}<div class="oc">
    <div class="oc-title">{{fmt title}}</div>
    <div class="oc-sub">{{fmt sub}}</div>
    <div class="oc-body">{{fmt body}}</div>
  </div>{{/each}}
</div>`,
  css: `& { flex-direction: column; }
h2 { font-family: 'Neureal', sans-serif; font-size: 64px; margin-bottom: 24px; }
.source { font-size: 24px; color: var(--ood-dark-matter-light); margin-bottom: 40px; }
.three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; flex: 1; }
.oc { background: var(--ood-white); padding: 32px; display: flex; flex-direction: column; gap: 16px; }
.oc-title { font-family: 'Neureal', sans-serif; font-size: 36px; }
.oc-sub { font-family: 'Neureal Mono', monospace; font-size: 18px; color: var(--ood-deep-violet); }
.oc-body { font-size: 20px; line-height: 1.4; }`,
};
