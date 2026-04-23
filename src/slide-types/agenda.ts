import type { SlideType } from '../renderer/types.ts';

export const agenda: SlideType = {
  name: 'agenda',
  label: 'Agenda',
  fields: [
    { name: 'title', type: 'richtext', required: true },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: { name: 'item', type: 'richtext' },
    },
  ],
  htmlTemplate: `<div style="width:100%;">
  <h1>{{fmt title}}</h1>
  <ol>
    {{#each items}}<li>{{fmt this}}</li>{{/each}}
  </ol>
</div>`,
  css: `h1 { font-family: 'Neureal', sans-serif; font-size: 120px; margin-bottom: 60px; }
ol { counter-reset: item; list-style: none; font-size: 44px; line-height: 1.4; }
ol li { counter-increment: item; padding-left: 80px; position: relative; margin-bottom: 16px; }
ol li::before { content: counter(item, decimal-leading-zero); position: absolute; left: 0; color: var(--ood-deep-violet); font-family: 'Neureal Mono', monospace; font-size: 32px; top: 8px; }`,
};
