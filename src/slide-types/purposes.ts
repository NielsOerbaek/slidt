import type { SlideType } from '../renderer/types.ts';

export const purposes: SlideType = {
  name: 'purposes',
  label: 'Numbered-card grid (four purposes)',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'cards',
      type: 'list',
      required: true,
      items: {
        name: 'card',
        type: 'group',
        fields: [
          { name: 'num', type: 'text', required: true },
          { name: 'title', type: 'richtext', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="content-inner">
    {{#each cards}}<div class="p-card">
      <div class="p-num">{{fmt num}}</div>
      <div class="p-title">{{fmt title}}</div>
      <div class="p-desc">{{fmt body}}</div>
    </div>{{/each}}
  </div>
</div>`,
  css: `.content { flex-direction: column; padding: 100px 140px; }
.eyebrow { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ood-deep-violet); margin-bottom: 28px; }
h2 { font-size: 84px; line-height: 1.02; margin-bottom: 48px; max-width: 1500px; color: var(--ood-deep-violet); }
.content-inner { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 32px; width: 100%; margin-top: 24px; }
.p-card { padding: 44px 52px; border: 2px solid var(--ood-deep-violet-bright); border-radius: 8px; background: var(--ood-white); }
.p-num { font-family: 'Neureal', sans-serif; font-size: 40px; color: var(--ood-deep-violet); margin-bottom: 14px; line-height: 1; }
.p-title { font-family: 'Neureal', sans-serif; font-size: 38px; color: var(--ood-dark-matter); margin-bottom: 14px; line-height: 1.1; }
.p-desc { font-size: 22px; color: var(--ood-dark-matter-light); line-height: 1.45; }`,
};
