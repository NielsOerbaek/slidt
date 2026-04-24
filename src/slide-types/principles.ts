import type { SlideType } from '../renderer/types.ts';

export const principles: SlideType = {
  name: 'principles',
  label: 'Numbered principles list',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: {
        name: 'principle',
        type: 'group',
        fields: [
          { name: 'title', type: 'richtext', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <ol class="principle-list">
    {{#each items}}<li><span><span class="p-title">{{fmt title}}</span> {{fmt body}}</span></li>{{/each}}
  </ol>
</div>`,
  css: `.content { flex-direction: column; padding: 100px 140px; }
.eyebrow { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ood-deep-violet); margin-bottom: 28px; }
h2 { font-size: 84px; line-height: 1.02; margin-bottom: 48px; max-width: 1500px; color: var(--ood-deep-violet); }
.principle-list { list-style: none; margin-left: 0; counter-reset: plist; display: flex; flex-direction: column; gap: 14px; }
.principle-list li { counter-increment: plist; display: grid; grid-template-columns: 72px 1fr; align-items: baseline; font-size: 24px; line-height: 1.35; max-width: 1500px !important; }
.principle-list li::before { content: counter(plist); font-family: 'Neureal', sans-serif; font-size: 48px; color: var(--ood-deep-violet); line-height: 1; }
.principle-list .p-title { font-family: 'Inter', sans-serif; font-weight: 500; }`,
};
