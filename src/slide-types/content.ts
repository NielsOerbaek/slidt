import type { SlideType } from '../renderer/types.ts';

export const content: SlideType = {
  name: 'content',
  label: 'Bullet list with title',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'bullets',
      type: 'list',
      required: true,
      items: { name: 'bullet', type: 'richtext' },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <ul>
    {{#each bullets}}<li>{{fmt this}}</li>{{/each}}
  </ul>
</div>`,
  css: `.content { max-width: 1400px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 72px; line-height: 1.05; margin-bottom: 48px; }
ul { list-style: disc; padding-left: 40px; font-size: 32px; line-height: 1.45; }
ul li { margin-bottom: 20px; }
ul li::marker { color: var(--ood-deep-violet); }`,
};
