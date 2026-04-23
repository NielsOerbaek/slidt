import type { SlideType } from '../renderer/types.ts';

export const appendixList: SlideType = {
  name: 'appendix-list',
  label: 'Appendix list (auto-appended)',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: {
        name: 'item',
        type: 'group',
        fields: [
          { name: 'mark', type: 'text', default: '§' },
          { name: 'title', type: 'richtext' },
          { name: 'subtitle', type: 'richtext' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <ul class="app-list">
    {{#each items}}<li>
      <div class="app-mark">{{fmt (default mark "§")}}</div>
      <div class="app-text">
        <div class="app-title">{{fmt title}}</div>
        <div class="app-sub">{{fmt subtitle}}</div>
      </div>
    </li>{{/each}}
  </ul>
</div>`,
  css: `.content { max-width: 1600px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 72px; margin-bottom: 48px; }
.app-list { list-style: none; display: flex; flex-direction: column; gap: 28px; font-size: 28px; }
.app-list li { display: grid; grid-template-columns: 120px 1fr; gap: 40px; align-items: center; }
.app-mark { font-family: 'Neureal Mono', monospace; font-size: 48px; color: var(--ood-deep-violet); text-align: center; }
.app-title { font-weight: 500; }
.app-sub { color: var(--ood-dark-matter-light); font-size: 22px; margin-top: 4px; }`,
};
