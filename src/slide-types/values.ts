import type { SlideType } from '../renderer/types.ts';

export const values: SlideType = {
  name: 'values',
  label: 'Two-column values',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'columns',
      type: 'list',
      required: true,
      items: {
        name: 'column',
        type: 'group',
        fields: [
          { name: 'heading', type: 'richtext', required: true },
          {
            name: 'items',
            type: 'list',
            required: true,
            items: { name: 'value', type: 'richtext' },
          },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="values-grid">
    {{#each columns}}<div class="v-col">
      <h3>{{fmt heading}}</h3>
      <ul>{{#each items}}<li>{{fmt this}}</li>{{/each}}</ul>
    </div>{{/each}}
  </div>
</div>`,
  css: `.content { flex-direction: column; padding: 100px 140px; }
.eyebrow { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ood-deep-violet); margin-bottom: 28px; }
h2 { font-size: 84px; line-height: 1.02; margin-bottom: 48px; max-width: 1500px; color: var(--ood-deep-violet); }
.values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 20px; }
.v-col h3 { font-family: 'Neureal', sans-serif; font-size: 34px; color: var(--ood-deep-violet); margin-bottom: 20px; line-height: 1.1; }
.values-grid ul { list-style: none; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.values-grid li { font-size: 22px; display: grid; grid-template-columns: 22px 1fr; column-gap: 14px; align-items: baseline; line-height: 1.4; max-width: 640px !important; padding: 0; }
.values-grid li::before { content: ''; display: inline-block; width: 14px; height: 2px; background: var(--ood-deep-violet); transform: translateY(-6px); }`,
};
