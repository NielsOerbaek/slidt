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
  css: `& { padding: 100px 120px; flex-direction: column; }
.eyebrow { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ood-deep-violet); margin-bottom: 24px; }
h2 { font-size: 72px; color: var(--ood-deep-violet); margin-bottom: 18px; line-height: 1.05; }
.source { font-size: 22px; color: var(--ood-dark-matter-light); margin-bottom: 54px; }
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
.oc { background: var(--ood-white); color: var(--ood-dark-matter); border: 2px solid var(--ood-deep-violet-bright); border-radius: 12px; padding: 44px 40px; position: relative; }
.oc .oc-title { font-family: 'Neureal', sans-serif; font-size: 38px; color: var(--ood-deep-violet); margin-bottom: 8px; line-height: 1.1; }
.oc .oc-sub { font-family: 'Neureal Mono', monospace; font-size: 22px; color: var(--ood-dark-matter-light); margin-bottom: 24px; }
.oc .oc-body { font-size: 21px; line-height: 1.45; color: var(--ood-dark-matter); }`,
};
