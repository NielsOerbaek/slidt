import type { SlideType } from '../renderer/types.ts';

export const discussion: SlideType = {
  name: 'discussion',
  label: 'Discussion questions',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: {
        name: 'question',
        type: 'group',
        fields: [
          { name: 'letter', type: 'text', required: true },
          { name: 'text', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `{{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
{{#if title}}<h2>{{fmt title}}</h2>{{/if}}
<ol class="q-list">
  {{#each items}}<li data-q="{{fmt letter}}"><span>{{fmt text}}</span></li>{{/each}}
</ol>`,
  css: `& { padding: 100px 140px; flex-direction: column; }
.eyebrow { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ood-deep-violet); margin-bottom: 24px; }
h2 { font-size: 80px; color: var(--ood-deep-violet); margin-bottom: 48px; line-height: 1.02; }
.q-list { list-style: none; display: flex; flex-direction: column; gap: 28px; }
.q-list li { display: grid; grid-template-columns: 90px 1fr; align-items: start; gap: 28px; font-family: 'Inter', sans-serif; font-weight: 300; font-size: 28px; line-height: 1.35; color: var(--ood-dark-matter); max-width: 1500px; }
.q-list li::before { content: attr(data-q); font-family: 'Neureal', sans-serif; font-size: 60px; color: var(--ood-deep-violet); line-height: 1; }`,
};
