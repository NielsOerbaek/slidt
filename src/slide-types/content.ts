import type { SlideType } from '../renderer/types.ts';

export const bulletList: SlideType = {
  name: 'bullet-list',
  label: 'Bullet list',
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
  css: `.content { flex-direction: column; padding: 100px 140px; }
.eyebrow { font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sl-accent); margin-bottom: 28px; }
h2 { font-size: 84px; line-height: 1.02; margin-bottom: 48px; max-width: 1500px; color: var(--sl-accent); }
ul, ol { margin-left: 28px; }
ul li, ol li { font-size: 28px; padding: 10px 0; max-width: 1500px; }`,
};
