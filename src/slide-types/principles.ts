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
  css: `.content { max-width: 1600px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 72px; margin-bottom: 48px; }
.principle-list { counter-reset: p; list-style: none; font-size: 26px; line-height: 1.4; }
.principle-list li { counter-increment: p; padding-left: 80px; position: relative; margin-bottom: 20px; }
.principle-list li::before { content: counter(p, decimal-leading-zero); position: absolute; left: 0; top: 0; color: var(--ood-deep-violet); font-family: 'Neureal Mono', monospace; font-size: 22px; }
.p-title { font-weight: 500; color: var(--ood-dark-matter); }`,
};
