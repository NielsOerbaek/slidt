import type { SlideType } from '../renderer/types.ts';

export const purposes: SlideType = {
  name: 'purposes',
  label: 'Numbered-card grid',
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
  css: `.content { width: 100%; }
h2 { font-family: 'Neureal', sans-serif; font-size: 80px; margin-bottom: 48px; }
.content-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
.p-card { background: var(--ood-white); padding: 32px; display: flex; flex-direction: column; gap: 16px; }
.p-num { font-family: 'Neureal Mono', monospace; color: var(--ood-deep-violet); font-size: 32px; }
.p-title { font-family: 'Neureal', sans-serif; font-size: 32px; line-height: 1.05; }
.p-desc { font-size: 20px; line-height: 1.4; color: var(--ood-dark-matter-light); }`,
};
