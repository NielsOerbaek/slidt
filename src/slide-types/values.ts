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
  css: `.content { max-width: 1700px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 64px; margin-bottom: 40px; }
.values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
.v-col h3 { font-size: 24px; font-weight: 500; color: var(--ood-deep-violet); margin-bottom: 20px; }
.v-col ul { list-style: disc; padding-left: 32px; font-size: 22px; line-height: 1.4; }
.v-col li { margin-bottom: 12px; }`,
};
