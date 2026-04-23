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
  css: `& { flex-direction: column; }
h2 { font-family: 'Neureal', sans-serif; font-size: 80px; margin-bottom: 48px; }
.q-list { list-style: none; display: grid; grid-template-columns: 80px 1fr; gap: 24px 40px; font-size: 28px; }
.q-list li { display: contents; }
.q-list li::before { content: attr(data-q); color: var(--ood-deep-violet); font-family: 'Neureal Mono', monospace; font-size: 48px; }`,
};
